export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SupportTicketCategory = 'account' | 'payment' | 'technical' | 'report_user' | 'other';
export type SupportSenderRole = 'user' | 'admin';

export interface SupportTicket {
    _id: string;
    userId: string | { _id: string; profile?: { name?: string }; phoneNumber?: string; role?: string };
    userRole: 'male' | 'female';
    subject: string;
    category: SupportTicketCategory;
    status: SupportTicketStatus;
    lastMessageAt: string;
    lastMessagePreview: string;
    lastMessageBySenderRole: SupportSenderRole;
    unreadCountForUser: number;
    unreadCountForAdmin: number;
    createdAt: string;
    updatedAt: string;
}

export interface SupportTicketMessage {
    _id: string;
    ticketId: string;
    senderId: string;
    senderRole: SupportSenderRole;
    message: string;
    createdAt: string;
}
