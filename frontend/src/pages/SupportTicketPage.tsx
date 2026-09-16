import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { MaterialSymbol } from "../shared/components/MaterialSymbol";
import { MeshBackground } from "../shared/components/auth/AuthLayoutComponents";
import supportService from "../core/services/support.service";
import socketService from "../core/services/socket.service";
import type { SupportTicket, SupportTicketMessage } from "../core/types/support.types";

const STATUS_META: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-blue-50 text-blue-600" },
  in_progress: { label: "In Progress", className: "bg-amber-50 text-amber-600" },
  resolved: { label: "Resolved", className: "bg-emerald-50 text-emerald-600" },
  closed: { label: "Closed", className: "bg-slate-100 text-slate-500" },
};

const formatMessageTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export const SupportTicketPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ticketId } = useParams<{ ticketId: string }>();
  const isFemale = location.pathname.startsWith("/female");
  const basePath = isFemale ? "/female" : "/male";

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    });
  }, []);

  useEffect(() => {
    if (!ticketId) return;
    window.scrollTo(0, 0);
    setIsLoading(true);
    supportService
      .getTicket(ticketId)
      .then(({ ticket, messages }) => {
        setTicket(ticket);
        setMessages(messages);
        setError(null);
        scrollToBottom(false);
      })
      .catch((err) => {
        console.error("Failed to load ticket:", err);
        setError(err.response?.data?.message || "Failed to load this ticket.");
      })
      .finally(() => setIsLoading(false));

    socketService.joinSupportTicket(ticketId);
    return () => {
      socketService.leaveSupportTicket(ticketId);
    };
  }, [ticketId, scrollToBottom]);

  // Real-time: new messages + ticket status changes
  useEffect(() => {
    if (!ticketId) return;

    const handleNewMessage = (data: { ticketId: string; message: SupportTicketMessage }) => {
      if (data.ticketId !== ticketId) return;
      setMessages((prev) => {
        if (prev.some((m) => m._id === data.message._id)) return prev;
        return [...prev, data.message];
      });
      scrollToBottom();
    };

    const handleTicketUpdated = (data: { ticket: SupportTicket }) => {
      if (data.ticket._id !== ticketId) return;
      setTicket(data.ticket);
    };

    socketService.on("support:message:new", handleNewMessage);
    socketService.on("support:ticket:updated", handleTicketUpdated);

    return () => {
      socketService.off("support:message:new", handleNewMessage);
      socketService.off("support:ticket:updated", handleTicketUpdated);
    };
  }, [ticketId, scrollToBottom]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || !ticketId || isSending) return;

    setIsSending(true);
    setDraft("");
    try {
      const result = await supportService.sendMessage(ticketId, trimmed);
      setMessages((prev) => (prev.some((m) => m._id === result.message._id) ? prev : [...prev, result.message]));
      setTicket(result.ticket);
      scrollToBottom();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message.");
      setDraft(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  const statusMeta = ticket ? STATUS_META[ticket.status] : null;

  return (
    <div className="text-slate-900 dark:text-white font-display antialiased min-h-screen relative overflow-x-hidden bg-background-light dark:bg-[#0a0a0a] flex flex-col">
      <MeshBackground />

      <div className="relative z-10 max-w-md mx-auto w-full flex flex-col flex-1 min-h-screen">
        <header className="h-16 flex items-center gap-3 px-4 sticky top-0 bg-background-light/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md z-30 border-b border-gray-100 dark:border-white/5">
          <button
            onClick={() => navigate(`${basePath}/support`)}
            className="skeuo-button size-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0"
            aria-label="Back to tickets"
          >
            <MaterialSymbol name="arrow_back" size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 dark:text-white truncate">
              {ticket?.subject || "Support Ticket"}
            </p>
            {statusMeta && (
              <span className={`inline-block mt-0.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${statusMeta.className}`}>
                {statusMeta.label}
              </span>
            )}
          </div>
        </header>

        <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 ${i % 2 === 0 ? "ml-12" : "mr-12"}`} />
              ))}
            </div>
          ) : error && messages.length === 0 ? (
            <div className="skeuo-card rounded-[2rem] bg-mesh-glass border-white/60 dark:border-white/5 p-8 text-center shadow-xl mt-8">
              <MaterialSymbol name="error" size={32} className="text-red-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{error}</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderRole === "user";
              return (
                <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-sm ${
                    isMine
                      ? "bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-br-md"
                      : "bg-white dark:bg-[#1a1a1a] border border-slate-100 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-bl-md"
                  }`}>
                    {!isMine && (
                      <p className="text-[9px] font-black uppercase tracking-widest text-pink-500 mb-0.5">Support</p>
                    )}
                    <p className="text-sm font-medium whitespace-pre-wrap break-words">{msg.message}</p>
                    <p className={`text-[9px] font-semibold mt-1 ${isMine ? "text-white/70" : "text-slate-400"}`}>
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </main>

        {ticket?.status === "closed" && (
          <div className="px-4 pb-1">
            <p className="text-[10px] font-semibold text-slate-400 text-center">
              This ticket is closed. Sending a message will reopen it.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSend}
          className="p-3 border-t border-gray-100 dark:border-white/5 bg-background-light/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md sticky bottom-0 flex items-center gap-2"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your message..."
            maxLength={2000}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            type="submit"
            disabled={!draft.trim() || isSending}
            className="size-11 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shrink-0 disabled:opacity-50 active:scale-95 transition-transform"
            aria-label="Send"
          >
            {isSending ? (
              <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <MaterialSymbol name="send" size={18} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupportTicketPage;
