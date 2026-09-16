/**
 * Support Service - Support ticket conversations between users and admin
 * @purpose: Any male/female user can open a support ticket and message the
 *           admin team about an issue; admins can view, reply to, and
 *           manage the status of any ticket. All new messages and status
 *           changes are pushed live via Socket.IO (see socket/chatHandlers.js).
 */

import mongoose from 'mongoose';
import SupportTicket from '../../models/SupportTicket.js';
import SupportTicketMessage from '../../models/SupportTicketMessage.js';
import User from '../../models/User.js';
import Notification from '../../models/Notification.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors.js';
import { emitSupportMessage, emitSupportTicketUpdate, emitNotification } from '../../socket/chatHandlers.js';

const MAX_MESSAGE_LENGTH = 2000;
const PREVIEW_LENGTH = 120;

const truncatePreview = (message) =>
    message.length > PREVIEW_LENGTH ? `${message.slice(0, PREVIEW_LENGTH)}…` : message;

/**
 * Create a new support ticket with its opening message.
 */
export const createTicket = async (userId, userRole, { subject, category, message }, io) => {
    if (!subject || !subject.trim()) throw new BadRequestError('Subject is required');
    if (!message || !message.trim()) throw new BadRequestError('Message is required');
    if (message.length > MAX_MESSAGE_LENGTH) throw new BadRequestError('Message is too long');

    const ticket = await SupportTicket.create({
        userId,
        userRole,
        subject: subject.trim(),
        category: category || 'other',
        status: 'open',
        lastMessageAt: new Date(),
        lastMessagePreview: truncatePreview(message.trim()),
        lastMessageBySenderRole: 'user',
        unreadCountForUser: 0,
        unreadCountForAdmin: 1,
    });

    await SupportTicketMessage.create({
        ticketId: ticket._id,
        senderId: userId,
        senderRole: 'user',
        message: message.trim(),
    });

    if (io) emitSupportTicketUpdate(io, ticket);

    return ticket;
};

/**
 * List the authenticated user's own tickets, most recently active first.
 */
export const listMyTickets = async (userId) => {
    return SupportTicket.find({ userId }).sort({ lastMessageAt: -1 }).lean();
};

/**
 * Get a ticket with its full message thread. Verifies ownership unless
 * `asAdmin` is true.
 */
export const getTicketWithMessages = async (ticketId, requesterId, asAdmin) => {
    if (!mongoose.isValidObjectId(ticketId)) throw new NotFoundError('Ticket not found');

    const ticket = await SupportTicket.findById(ticketId).lean();
    if (!ticket) throw new NotFoundError('Ticket not found');

    if (!asAdmin && ticket.userId.toString() !== requesterId.toString()) {
        throw new ForbiddenError('You do not have access to this ticket');
    }

    const messages = await SupportTicketMessage.find({ ticketId }).sort({ createdAt: 1 }).lean();

    return { ticket, messages };
};

/**
 * Add a message to a ticket - shared by both the user-facing and admin
 * controllers. Reopens a resolved/closed ticket when the user replies again.
 */
export const addMessage = async (ticketId, senderId, senderRole, message, io) => {
    if (!mongoose.isValidObjectId(ticketId)) throw new NotFoundError('Ticket not found');
    if (!message || !message.trim()) throw new BadRequestError('Message is required');
    if (message.length > MAX_MESSAGE_LENGTH) throw new BadRequestError('Message is too long');

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');

    if (senderRole === 'user' && ticket.userId.toString() !== senderId.toString()) {
        throw new ForbiddenError('You do not have access to this ticket');
    }

    const trimmed = message.trim();

    const ticketMessage = await SupportTicketMessage.create({
        ticketId,
        senderId,
        senderRole,
        message: trimmed,
    });

    ticket.lastMessageAt = new Date();
    ticket.lastMessagePreview = truncatePreview(trimmed);
    ticket.lastMessageBySenderRole = senderRole;

    if (senderRole === 'user') {
        ticket.unreadCountForAdmin += 1;
        // A user replying to a resolved/closed ticket reopens it
        if (ticket.status === 'resolved' || ticket.status === 'closed') {
            ticket.status = 'open';
        }
    } else {
        ticket.unreadCountForUser += 1;
        if (ticket.status === 'open') {
            ticket.status = 'in_progress';
        }
    }

    await ticket.save();

    if (io) {
        emitSupportMessage(io, ticket, ticketMessage);
        emitSupportTicketUpdate(io, ticket);

        // Notify the user (not the admin sending it) so they see it even if
        // they're elsewhere in the app.
        if (senderRole === 'admin') {
            try {
                const notification = await Notification.create({
                    userId: ticket.userId,
                    type: 'system',
                    title: 'Support replied to your ticket',
                    message: trimmed.length > 100 ? `${trimmed.slice(0, 100)}…` : trimmed,
                    actionUrl: ticket.userRole === 'female' ? '/female/support' : '/male/support',
                    metadata: new Map([['ticketId', ticketId.toString()]]),
                });
                emitNotification(io, ticket.userId, notification);
            } catch (err) {
                // Non-critical - don't fail the message send if notification creation fails
            }
        }
    }

    return { ticket, message: ticketMessage };
};

/**
 * Mark a ticket as read by the given side (resets that side's unread counter).
 */
export const markRead = async (ticketId, side) => {
    const field = side === 'admin' ? 'unreadCountForAdmin' : 'unreadCountForUser';
    await SupportTicket.updateOne({ _id: ticketId }, { $set: { [field]: 0 } });
};

/**
 * Admin: update a ticket's status.
 */
export const updateTicketStatus = async (ticketId, status, io) => {
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) throw new BadRequestError('Invalid status');

    const ticket = await SupportTicket.findByIdAndUpdate(
        ticketId,
        { status },
        { new: true },
    );
    if (!ticket) throw new NotFoundError('Ticket not found');

    if (io) emitSupportTicketUpdate(io, ticket);

    return ticket;
};

/**
 * Admin: list all tickets across every user, filterable by status/role/userId/search.
 */
export const listAllTicketsAdmin = async (filters = {}, page = 1, limit = 20) => {
    const query = {};

    if (filters.status && filters.status !== 'all') query.status = filters.status;
    if (filters.role && filters.role !== 'all') query.userRole = filters.role;
    if (filters.userId) query.userId = filters.userId;

    let userIdsForSearch = null;
    if (filters.search) {
        const matchingUsers = await User.find({
            $or: [
                { 'profile.name': { $regex: filters.search, $options: 'i' } },
                { phoneNumber: { $regex: filters.search, $options: 'i' } },
            ],
        }).select('_id').lean();
        userIdsForSearch = matchingUsers.map((u) => u._id);
        query.$or = [
            { subject: { $regex: filters.search, $options: 'i' } },
            ...(userIdsForSearch.length ? [{ userId: { $in: userIdsForSearch } }] : []),
        ];
    }

    const skip = (page - 1) * limit;

    const [tickets, total, statusCounts] = await Promise.all([
        SupportTicket.find(query)
            .populate('userId', 'profile.name phoneNumber role')
            .sort({ lastMessageAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        SupportTicket.countDocuments(query),
        SupportTicket.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
    ]);

    const summary = { total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 };
    statusCounts.forEach((row) => {
        summary[row._id] = row.count;
        summary.total += row.count;
    });

    return {
        tickets,
        total,
        totalPages: Math.ceil(total / limit),
        page,
        summary,
    };
};

/**
 * Admin: list all tickets raised by a specific user (used on the admin User Detail page).
 */
export const listTicketsForUser = async (userId) => {
    return SupportTicket.find({ userId }).sort({ lastMessageAt: -1 }).lean();
};

export default {
    createTicket,
    listMyTickets,
    getTicketWithMessages,
    addMessage,
    markRead,
    updateTicketStatus,
    listAllTicketsAdmin,
    listTicketsForUser,
};
