/**
 * Socket.IO Chat Handlers - Real-time Messaging (PERFORMANCE OPTIMIZED)
 * 
 * KEY FIXES:
 * A user may have more than one connection (multiple tabs/devices). Presence is
 * online while at least one authenticated socket is connected. Socket.IO's own
 * ping/pong is the source of truth; browser timers are deliberately not used
 * because mobile browsers throttle them in the background.
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import SupportTicket from '../models/SupportTicket.js';
import logger from '../utils/logger.js';
import { getEnvConfig } from '../config/env.js';
import memoryCache from '../core/cache/memoryCache.js';

// Shared room every connected admin socket joins, so admin-facing lists
// (e.g. the support ticket queue) can be updated live without each admin
// needing a specific ticket open.
const ADMIN_ROOM = 'admins';

const { jwtSecret } = getEnvConfig();

const activeUsers = new Map(); // userId -> Set<socketId>

const addActiveSocket = (userId, socketId) => {
    const sockets = activeUsers.get(userId) || new Set();
    sockets.add(socketId);
    activeUsers.set(userId, sockets);
    return sockets.size;
};

const removeActiveSocket = (userId, socketId) => {
    const sockets = activeUsers.get(userId);
    if (!sockets) return 0;
    sockets.delete(socketId);
    if (sockets.size === 0) activeUsers.delete(userId);
    return sockets.size;
};

/**
 * Authenticate Socket.IO connection (FAST - no DB call)
 */
export const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('No token'));

        const decoded = jwt.verify(token, jwtSecret);
        socket.userId = decoded.id;
        socket.userRole = decoded.role || 'unknown';
        next();
    } catch (error) {
        next(new Error('Auth error'));
    }
};

/**
 * Setup Socket.IO chat handlers (SINGLETON-ENFORCED)
 */
export const setupChatHandlers = (io) => {
    io.on('connection', (socket) => {
        const userId = socket.userId?.toString();
        if (!userId) return;

        const connectionCount = addActiveSocket(userId, socket.id);
        socket.join(userId);
        if (socket.userRole === 'admin') {
            socket.join(ADMIN_ROOM);
        }

        // Update DB immediately (don't defer) - critical for online status accuracy
        User.findByIdAndUpdate(userId, {
            isOnline: true,
            socketId: socket.id,
            lastSeen: new Date()
        }).catch((err) => {
            logger.error(`Failed to update online status for ${userId}:`, err.message);
        });

        // Invalidate discover cache for online filter (so new online users appear immediately)
        Array.from(memoryCache.keys()).forEach(key => {
            if (key.includes('discover:females:') && key.includes(':online:')) {
                memoryCache.delete(key);
            }
        });

        // Only broadcast the online transition, not every additional tab.
        if (connectionCount === 1) {
            socket.broadcast.emit('user:online', { userId });
        }

        // Backward compatibility for older clients. Socket.IO already performs
        // transport-level heartbeat and emits disconnect when it expires.
        socket.on('heartbeat', () => {
            socket.emit('heartbeat:ack');
        });

        // JOIN CHAT
        socket.on('chat:join', async (data) => {
            try {
                const { chatId } = data;
                const chat = await Chat.findOne({ _id: chatId, 'participants.userId': userId }).lean();
                if (!chat) return socket.emit('error', { message: 'Chat not found' });
                socket.join(`chat:${chatId}`);
                socket.emit('chat:joined', { chatId });
            } catch (e) {
                socket.emit('error', { message: 'Failed to join chat' });
            }
        });

        // LEAVE CHAT
        socket.on('chat:leave', (data) => {
            socket.leave(`chat:${data.chatId}`);
        });

        // JOIN SUPPORT TICKET (owner or any admin)
        socket.on('support:join', async (data) => {
            try {
                const { ticketId } = data;
                const ticket = await SupportTicket.findById(ticketId).select('userId').lean();
                if (!ticket) return socket.emit('error', { message: 'Ticket not found' });
                if (socket.userRole !== 'admin' && ticket.userId.toString() !== userId) {
                    return socket.emit('error', { message: 'Not authorized for this ticket' });
                }
                socket.join(`support:${ticketId}`);
                socket.emit('support:joined', { ticketId });
            } catch (e) {
                socket.emit('error', { message: 'Failed to join ticket' });
            }
        });

        // LEAVE SUPPORT TICKET
        socket.on('support:leave', (data) => {
            socket.leave(`support:${data.ticketId}`);
        });

        // TYPING
        socket.on('chat:typing', (data) => {
            socket.to(`chat:${data.chatId}`).emit('chat:typing', { chatId: data.chatId, userId, isTyping: data.isTyping });
        });

        // READ
        socket.on('message:read', async (data) => {
            try {
                await Message.findByIdAndUpdate(data.messageId, { status: 'read', readAt: new Date() });
                socket.to(`chat:${data.chatId}`).emit('message:read', { messageId: data.messageId, chatId: data.chatId, readBy: userId });
            } catch (e) {
                logger.error('Error in message:read:', e);
            }
        });

        // BALANCE REQUEST
        socket.on('balance:request', async () => {
            try {
                const user = await User.findById(userId).select('coinBalance').lean();
                socket.emit('balance:update', { balance: user?.coinBalance || 0 });
            } catch (e) {
                logger.error('Error in balance:request:', e);
            }
        });

        // USER STATUS REQUEST - Get real-time online status of a user
        socket.on('user:status:request', async (data) => {
            try {
                const targetUserId = (data?.targetUserId || '').toString();
                if (!targetUserId) return;

                // Check if user is currently connected (real-time)
                if (isUserOnline(targetUserId)) {
                    socket.emit('user:status:response', {
                        userId: targetUserId,
                        isOnline: true,
                        lastSeen: new Date()
                    });
                } else {
                    const user = await User.findById(targetUserId).select('isOnline lastSeen').lean();
                    socket.emit('user:status:response', {
                        userId: targetUserId,
                        // The in-memory socket registry is authoritative within
                        // this process. A stale DB flag must not report online.
                        isOnline: false,
                        lastSeen: user?.lastSeen || new Date()
                    });
                }
            } catch (e) {
                console.error('Status request error:', e);
            }
        });

        // DISCONNECT
        socket.on('disconnect', () => {
            // A user is offline only after their final tab/device disconnects.
            if (removeActiveSocket(userId, socket.id) === 0) {

                // Update DB immediately - critical for online status accuracy
                User.findByIdAndUpdate(userId, {
                    isOnline: false,
                    socketId: null,
                    lastSeen: new Date()
                }).catch((err) => {
                    logger.error(`Failed to update offline status for ${userId}:`, err.message);
                });

                // Invalidate discover cache for online filter (so offline users disappear immediately)
                Array.from(memoryCache.keys()).forEach(key => {
                    if (key.includes('discover:females:') && key.includes(':online:')) {
                        memoryCache.delete(key);
                    }
                });

                // Ensure userId is string for frontend comparison
                socket.broadcast.emit('user:offline', { userId: userId.toString(), lastSeen: new Date() });
            }
        });
    });

    logger.info('✅ Socket.IO handlers initialized (Optimized)');
};

// Export helpers
export const emitBalanceUpdate = (io, userId, newBalance) => {
    const uid = (userId?._id || userId || '').toString();
    if (uid) io.to(uid).emit('balance:update', { balance: newBalance });
};

export const emitNewMessage = (io, chatId, message) => {
    const normalizedMessage = {
        ...message,
        type: message.messageType || message.type || (message.attachments?.length ? 'image' : 'text')
    };
    const cId = (chatId || '').toString();
    const receiverId = (message.receiverId?._id || message.receiverId || '').toString();
    const senderId = (message.senderId?._id || message.senderId || '').toString();

    // A socket can be in both its user room and the open chat room. Chaining
    // rooms makes Socket.IO perform a union, so each socket receives exactly
    // one message:new event instead of two or three duplicates.
    let recipients = io;
    if (cId) recipients = recipients.to(`chat:${cId}`);
    if (receiverId) recipients = recipients.to(receiverId);
    if (senderId) recipients = recipients.to(senderId);
    recipients.emit('message:new', { chatId: cId, message: normalizedMessage });
};

export const isUserOnline = (userId) => {
    if (!userId) return false;
    const uid = (userId?._id || userId).toString();
    return (activeUsers.get(uid)?.size || 0) > 0;
};

export const emitNotification = (io, userId, notification) => {
    const uid = (userId?._id || userId || '').toString();
    if (uid) io.to(uid).emit('notification:new', { notification });
};

export const emitTaskCompleted = (io, userId, task) => {
    const uid = (userId?._id || userId || '').toString();
    if (uid) io.to(uid).emit('task:completed', task);
};

// Support tickets: notify anyone with the ticket open (support:<id> room),
// the ticket owner directly (in case they're elsewhere in the app), and
// every connected admin (so the admin ticket queue updates live).
export const emitSupportMessage = (io, ticket, message) => {
    const ticketId = ticket._id.toString();
    io.to(`support:${ticketId}`).emit('support:message:new', { ticketId, message });

    const ownerId = ticket.userId.toString();
    if (isUserOnline(ownerId)) io.to(ownerId).emit('support:message:notification', { ticketId, message });

    io.to(ADMIN_ROOM).emit('support:ticket:activity', { ticket, message });
};

export const emitSupportTicketUpdate = (io, ticket) => {
    const ticketId = ticket._id.toString();
    io.to(`support:${ticketId}`).emit('support:ticket:updated', { ticket });

    const ownerId = ticket.userId.toString();
    if (isUserOnline(ownerId)) io.to(ownerId).emit('support:ticket:updated', { ticket });

    io.to(ADMIN_ROOM).emit('support:ticket:updated', { ticket });
};
