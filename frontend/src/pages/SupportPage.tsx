import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MaterialSymbol } from "../shared/components/MaterialSymbol";
import { MeshBackground } from "../shared/components/auth/AuthLayoutComponents";
import supportService from "../core/services/support.service";
import socketService from "../core/services/socket.service";
import type { SupportTicket, SupportTicketCategory } from "../core/types/support.types";

const CATEGORY_OPTIONS: { value: SupportTicketCategory; label: string }[] = [
  { value: "account", label: "Account" },
  { value: "payment", label: "Payment / Coins" },
  { value: "technical", label: "Technical Issue" },
  { value: "report_user", label: "Report a User" },
  { value: "other", label: "Other" },
];

const STATUS_META: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-blue-50 text-blue-600" },
  in_progress: { label: "In Progress", className: "bg-amber-50 text-amber-600" },
  resolved: { label: "Resolved", className: "bg-emerald-50 text-emerald-600" },
  closed: { label: "Closed", className: "bg-slate-100 text-slate-500" },
};

const formatTimeAgo = (dateString: string) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const SupportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isFemale = location.pathname.startsWith("/female");
  const basePath = isFemale ? "/female" : "/male";
  const accentColor = isFemale ? "text-pink-500" : "text-primary";
  const bgAccent = isFemale ? "bg-pink-500/10" : "bg-primary/10";

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  // New ticket form state
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<SupportTicketCategory>("other");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      const data = await supportService.listMyTickets();
      setTickets(data);
    } catch (err) {
      console.error("Failed to fetch support tickets:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTickets();
  }, [fetchTickets]);

  // Live-update the ticket list without refresh whenever any ticket changes
  useEffect(() => {
    const handleTicketUpdated = (data: { ticket: SupportTicket }) => {
      setTickets((prev) => {
        const exists = prev.some((t) => t._id === data.ticket._id);
        if (!exists) return [data.ticket, ...prev];
        return prev
          .map((t) => (t._id === data.ticket._id ? data.ticket : t))
          .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      });
    };

    socketService.on("support:ticket:updated", handleTicketUpdated);
    socketService.on("support:message:notification", () => fetchTickets());

    return () => {
      socketService.off("support:ticket:updated", handleTicketUpdated);
      socketService.off("support:message:notification", () => fetchTickets());
    };
  }, [fetchTickets]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setFormError("Please fill in both the subject and your message.");
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      const ticket = await supportService.createTicket({ subject: subject.trim(), category, message: message.trim() });
      setShowNewTicketModal(false);
      setSubject("");
      setMessage("");
      setCategory("other");
      navigate(`${basePath}/support/${ticket._id}`);
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to create ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-slate-900 dark:text-white font-display antialiased min-h-screen relative overflow-x-hidden bg-background-light dark:bg-[#0a0a0a]">
      <MeshBackground />
      {isFemale && (
        <div className="absolute inset-0 bg-pink-500/5 blur-[80px] rounded-full opacity-30 pointer-events-none z-0" />
      )}

      <div className="relative z-10 max-w-md mx-auto w-full flex flex-col pb-24">
        <header className="h-16 flex items-center justify-between px-4 sticky top-0 bg-background-light/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md z-30 border-b border-gray-100 dark:border-white/5">
          <button
            onClick={() => navigate(`${basePath}/my-profile`)}
            className="skeuo-button size-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400"
            aria-label="Go back"
          >
            <MaterialSymbol name="arrow_back" size={20} />
          </button>
          <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white">Support</h1>
          <button
            onClick={() => setShowNewTicketModal(true)}
            className="skeuo-button size-10 rounded-full flex items-center justify-center text-pink-500"
            aria-label="New ticket"
          >
            <MaterialSymbol name="add" size={22} />
          </button>
        </header>

        <main className="p-4 space-y-4">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="skeuo-card rounded-[2rem] bg-mesh-glass border-white/60 dark:border-white/5 p-8 text-center shadow-xl space-y-4 mt-8">
              <div className={`skeuo-inset size-16 rounded-full flex items-center justify-center bg-transparent dark:bg-black/25 mx-auto ${accentColor}`}>
                <MaterialSymbol name="support_agent" size={32} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-white">No support tickets yet</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Having an issue? Reach out and our team will help.
                </p>
              </div>
              <button
                onClick={() => setShowNewTicketModal(true)}
                className={`w-full h-12 rounded-2xl text-white text-xs font-black uppercase tracking-widest ${isFemale ? "bg-gradient-to-r from-pink-500 to-rose-600" : "bg-primary"}`}
              >
                Contact Support
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const statusMeta = STATUS_META[ticket.status];
                const hasUnread = ticket.unreadCountForUser > 0;
                return (
                  <button
                    key={ticket._id}
                    onClick={() => navigate(`${basePath}/support/${ticket._id}`)}
                    className="w-full text-left skeuo-card rounded-2xl bg-mesh-glass border-white/60 dark:border-white/5 p-4 shadow-lg flex items-start gap-3"
                  >
                    <div className={`skeuo-inset size-11 shrink-0 rounded-2xl flex items-center justify-center bg-transparent dark:bg-black/25 ${bgAccent} ${accentColor}`}>
                      <MaterialSymbol name="confirmation_number" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">{ticket.subject}</p>
                        {hasUnread && <span className="size-2 rounded-full bg-pink-500 shrink-0" />}
                      </div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {ticket.lastMessageBySenderRole === "admin" ? "Support: " : "You: "}
                        {ticket.lastMessagePreview}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${statusMeta.className}`}>
                          {statusMeta.label}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                          {formatTimeAgo(ticket.lastMessageAt)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => !isSubmitting && setShowNewTicketModal(false)}
        >
          <div
            className="skeuo-card bg-white dark:bg-[#151515] rounded-t-[2rem] sm:rounded-[2rem] w-full sm:max-w-sm max-h-[85vh] overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-slate-900 dark:text-white">New Support Ticket</h2>
              <button
                onClick={() => !isSubmitting && setShowNewTicketModal(false)}
                className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <MaterialSymbol name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Briefly describe your issue"
                  maxLength={150}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportTicketCategory)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's going on..."
                  rows={4}
                  maxLength={2000}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>

              {formError && (
                <p className="text-xs font-bold text-red-500">{formError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-12 rounded-2xl text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 ${isFemale ? "bg-gradient-to-r from-pink-500 to-rose-600" : "bg-primary"}`}
              >
                {isSubmitting ? (
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Submit Ticket"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
