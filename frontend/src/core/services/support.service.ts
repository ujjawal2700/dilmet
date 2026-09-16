import apiClient from '../api/client';
import type { SupportTicket, SupportTicketMessage, SupportTicketCategory } from '../types/support.types';

export const createTicket = async (data: {
    subject: string;
    category?: SupportTicketCategory;
    message: string;
}): Promise<SupportTicket> => {
    const response = await apiClient.post('/support', data);
    return response.data.data.ticket;
};

export const listMyTickets = async (): Promise<SupportTicket[]> => {
    const response = await apiClient.get('/support');
    return response.data.data.tickets;
};

export const getTicket = async (
    ticketId: string,
): Promise<{ ticket: SupportTicket; messages: SupportTicketMessage[] }> => {
    const response = await apiClient.get(`/support/${ticketId}`);
    return response.data.data;
};

export const sendMessage = async (
    ticketId: string,
    message: string,
): Promise<{ ticket: SupportTicket; message: SupportTicketMessage }> => {
    const response = await apiClient.post(`/support/${ticketId}/messages`, { message });
    return response.data.data;
};

export default {
    createTicket,
    listMyTickets,
    getTicket,
    sendMessage,
};
