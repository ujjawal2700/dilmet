import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import adminService from '../../../core/services/admin.service';
import socketService from '../../../core/services/socket.service';
import type { SupportTicket, SupportTicketMessage, SupportTicketStatus } from '../../../core/types/support.types';

const STATUS_OPTIONS: { value: SupportTicketStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const formatTime = (value: string) =>
  new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export const SupportTicketDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    navigationItems,
    handleNavigationClick,
    isCollapsed,
    toggleCollapse,
  } = useAdminNavigation();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    adminService
      .getSupportTicket(id)
      .then((data: any) => {
        setTicket(data.ticket);
        setMessages(data.messages);
        scrollToBottom(false);
      })
      .catch((err) => console.error('Failed to load ticket:', err))
      .finally(() => setIsLoading(false));

    socketService.joinSupportTicket(id);
    return () => socketService.leaveSupportTicket(id);
  }, [id, scrollToBottom]);

  useEffect(() => {
    if (!id) return;

    const handleNewMessage = (data: { ticketId: string; message: SupportTicketMessage }) => {
      if (data.ticketId !== id) return;
      setMessages((prev) => (prev.some((m) => m._id === data.message._id) ? prev : [...prev, data.message]));
      scrollToBottom();
    };

    const handleTicketUpdated = (data: { ticket: SupportTicket }) => {
      if (data.ticket._id !== id) return;
      setTicket(data.ticket);
    };

    socketService.on('support:message:new', handleNewMessage);
    socketService.on('support:ticket:updated', handleTicketUpdated);
    return () => {
      socketService.off('support:message:new', handleNewMessage);
      socketService.off('support:ticket:updated', handleTicketUpdated);
    };
  }, [id, scrollToBottom]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || !id || isSending) return;

    setIsSending(true);
    setDraft('');
    try {
      const result: any = await adminService.sendSupportMessage(id, trimmed);
      setMessages((prev) => (prev.some((m) => m._id === result.message._id) ? prev : [...prev, result.message]));
      setTicket(result.ticket);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
      setDraft(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (status: SupportTicketStatus) => {
    if (!id) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await adminService.updateSupportTicketStatus(id, status);
      setTicket(updated.ticket);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getUserName = () =>
    ticket && typeof ticket.userId === 'object' ? ticket.userId.profile?.name || 'Unknown User' : 'Unknown User';
  const getUserPhone = () =>
    ticket && typeof ticket.userId === 'object' ? ticket.userId.phoneNumber || '' : '';
  const getUserIdString = () =>
    ticket ? (typeof ticket.userId === 'object' ? ticket.userId._id : ticket.userId) : '';

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0a0a0a] overflow-x-hidden">
      <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      <div className={`flex-1 p-4 md:p-6 mt-[57px] transition-all duration-300 flex flex-col ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/admin/support-tickets')}
              className="p-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <MaterialSymbol name="arrow_back" size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {ticket?.subject || 'Support Ticket'}
              </h1>
              {ticket && (
                <button
                  onClick={() => navigate(`/admin/users/${getUserIdString()}`)}
                  className="text-xs text-pink-600 dark:text-pink-400 hover:underline"
                >
                  {getUserName()} · {getUserPhone()} · {ticket.userRole}
                </button>
              )}
            </div>
            {ticket && (
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as SupportTicketStatus)}
                disabled={isUpdatingStatus}
                className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-y-auto p-4 space-y-3 min-h-[50vh]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-12">No messages yet</p>
            ) : (
              messages.map((msg) => {
                const isAdmin = msg.senderRole === 'admin';
                return (
                  <div key={msg._id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      isAdmin
                        ? 'bg-pink-600 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
                    }`}>
                      {!isAdmin && (
                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">
                          {getUserName()}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${isAdmin ? 'text-white/70' : 'text-gray-400'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply box */}
          <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your reply..."
              maxLength={2000}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              type="submit"
              disabled={!draft.trim() || isSending}
              className="px-5 py-3 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSending ? (
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <MaterialSymbol name="send" size={18} />
              )}
              Reply
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportTicketDetailPage;
