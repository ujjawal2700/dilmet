/**
 * Support Controller - User-facing support ticket endpoints
 */

import supportService from '../../services/support/supportService.js';

export const createTicket = async (req, res, next) => {
    try {
        const { subject, category, message } = req.body;
        const ticket = await supportService.createTicket(
            req.user.id,
            req.user.role,
            { subject, category, message },
            req.app.get('io'),
        );
        res.status(201).json({ status: 'success', data: { ticket } });
    } catch (error) {
        next(error);
    }
};

export const listMyTickets = async (req, res, next) => {
    try {
        const tickets = await supportService.listMyTickets(req.user.id);
        res.status(200).json({ status: 'success', data: { tickets } });
    } catch (error) {
        next(error);
    }
};

export const getTicket = async (req, res, next) => {
    try {
        const { ticket, messages } = await supportService.getTicketWithMessages(
            req.params.id,
            req.user.id,
            false,
        );
        await supportService.markRead(req.params.id, 'user');
        res.status(200).json({ status: 'success', data: { ticket, messages } });
    } catch (error) {
        next(error);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const { message } = req.body;
        const result = await supportService.addMessage(
            req.params.id,
            req.user.id,
            'user',
            message,
            req.app.get('io'),
        );
        res.status(201).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};

export default {
    createTicket,
    listMyTickets,
    getTicket,
    sendMessage,
};
