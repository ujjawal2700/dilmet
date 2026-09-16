import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import adminService from '../../../core/services/admin.service';
import socketService from '../../../core/services/socket.service';
import type { SupportTicket } from '../../../core/types/support.types';

const STATUS_META: Record<string, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' },
  in_progress: { label: 'In Progress', className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' },
  resolved: { label: 'Resolved', className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
  closed: { label: 'Closed', className: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
};

export const SupportTicketsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [summary, setSummary] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', status: 'all', role: 'all' });
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    navigationItems,
    handleNavigationClick,
    isCollapsed,
    toggleCollapse,
  } = useAdminNavigation();

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminService.listSupportTickets(filters, page, 20);
      setTickets(data.tickets);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSummary(data.summary);
    } catch (error) {
      console.error('Failed to fetch support tickets:', error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTickets();
  }, [fetchTickets]);

  // Live updates: any ticket activity anywhere refreshes the queue instantly
  useEffect(() => {
    const handleActivity = () => fetchTickets();
    socketService.on('support:ticket:activity', handleActivity);
    socketService.on('support:ticket:updated', handleActivity);
    return () => {
      socketService.off('support:ticket:activity', handleActivity);
      socketService.off('support:ticket:updated', handleActivity);
    };
  }, [fetchTickets]);

  const formatDate = (value: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const getUserName = (t: SupportTicket) =>
    typeof t.userId === 'object' ? t.userId.profile?.name || 'Unknown' : 'Unknown';
  const getUserPhone = (t: SupportTicket) =>
    typeof t.userId === 'object' ? t.userId.phoneNumber || '' : '';
  const getUserIdString = (t: SupportTicket) =>
    typeof t.userId === 'object' ? t.userId._id : t.userId;

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

      <div className={`flex-1 p-4 md:p-6 mt-[57px] transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Support Tickets</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage support conversations from male and female users ({total} total)
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{summary.open}</p>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{summary.in_progress}</p>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{summary.resolved}</p>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Closed</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">{summary.closed}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <MaterialSymbol name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by subject or user name/phone"
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <select
              value={filters.role}
              onChange={(e) => updateFilters({ role: e.target.value })}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Last Activity</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                        No support tickets found
                      </td>
                    </tr>
                  ) : (
                    tickets.map((t) => {
                      const statusMeta = STATUS_META[t.status];
                      const hasUnread = t.unreadCountForAdmin > 0;
                      return (
                        <tr
                          key={t._id}
                          className="text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/40"
                          onClick={() => navigate(`/admin/support-tickets/${t._id}`)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {hasUnread && <span className="size-2 rounded-full bg-pink-500 shrink-0" />}
                              <div>
                                <div className="font-medium">{getUserName(t)}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {getUserPhone(t)} · {t.userRole}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium max-w-xs truncate">{t.subject}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                              {t.lastMessageBySenderRole === 'admin' ? 'You: ' : ''}{t.lastMessagePreview}
                            </div>
                          </td>
                          <td className="px-4 py-3 capitalize text-xs">{t.category.replace('_', ' ')}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusMeta.className}`}>
                              {statusMeta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(t.lastMessageAt)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/users/${getUserIdString(t)}`);
                              }}
                              className="text-xs text-pink-600 dark:text-pink-400 hover:underline"
                            >
                              View User
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-pink-600 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTicketsPage;
