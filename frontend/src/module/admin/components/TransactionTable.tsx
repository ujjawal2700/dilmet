import { useState, useMemo } from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import type { AdminTransaction } from '../types/admin.types';

interface TransactionTableProps {
  transactions: AdminTransaction[];
  onViewDetails?: (transaction: AdminTransaction) => void;
}

export const TransactionTable = ({ transactions, onViewDetails }: TransactionTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | AdminTransaction['type']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AdminTransaction['status']>('all');
  const [directionFilter, setDirectionFilter] = useState<'all' | AdminTransaction['direction']>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof AdminTransaction; direction: 'asc' | 'desc' } | null>({
    key: 'timestamp',
    direction: 'desc',
  });

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.userId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Direction filter
    if (directionFilter !== 'all') {
      filtered = filtered.filter((t) => t.direction === directionFilter);
    }

    // Sort
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === 'asc'
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return 0;
      });
    }

    return filtered;
  }, [transactions, searchQuery, typeFilter, statusFilter, directionFilter, sortConfig]);

  const handleSort = (key: keyof AdminTransaction) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key: keyof AdminTransaction) => {
    if (!sortConfig || sortConfig.key !== key) {
      return 'unfold_more';
    }
    return sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
  };

  const getTypeIcon = (type: AdminTransaction['type']) => {
    switch (type) {
      case 'purchase':
        return 'shopping_cart';
      case 'message_spent':
        return 'chat_bubble';
      case 'message_earned':
        return 'chat_bubble';
      case 'withdrawal':
        return 'account_balance_wallet';
      case 'adjustment':
        return 'tune';
      case 'gift_sent':
        return 'redeem';
      case 'gift_received':
        return 'redeem';
      default:
        return 'receipt';
    }
  };

  const getTypeColor = (type: AdminTransaction['type']) => {
    switch (type) {
      case 'purchase':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'message_spent':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'message_earned':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'withdrawal':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'adjustment':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
      case 'gift_sent':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300';
      case 'gift_received':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: AdminTransaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'pending':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MaterialSymbol
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by user name, transaction ID, or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="purchase">Purchase</option>
              <option value="message_spent">Message Spent</option>
              <option value="message_earned">Message Earned</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="adjustment">Adjustment</option>
              <option value="gift_sent">Gift Sent</option>
              <option value="gift_received">Gift Received</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Direction Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDirectionFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              directionFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Directions
          </button>
          <button
            onClick={() => setDirectionFilter('credit')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              directionFilter === 'credit'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Credits
          </button>
          <button
            onClick={() => setDirectionFilter('debit')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              directionFilter === 'debit'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Debits
          </button>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredTransactions.length}</span> of{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{transactions.length}</span> transactions
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <MaterialSymbol name="receipt_long" className="mx-auto mb-4" size={48} />
            <p>No transactions found matching your criteria.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-white transition-colors"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center">
                    Date & Time <MaterialSymbol name={getSortIcon('timestamp')} size={16} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-white transition-colors"
                  onClick={() => handleSort('userName')}
                >
                  <div className="flex items-center">
                    User <MaterialSymbol name={getSortIcon('userName')} size={16} className="ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-white transition-colors"
                  onClick={() => handleSort('amountCoins')}
                >
                  <div className="flex items-center">
                    Amount <MaterialSymbol name={getSortIcon('amountCoins')} size={16} className="ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1a1a1a] divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(transaction.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.userName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.userId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MaterialSymbol
                        name={getTypeIcon(transaction.type)}
                        className={getTypeColor(transaction.type).split(' ')[0]}
                        size={18}
                      />
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(transaction.type)}`}>
                        {transaction.type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {transaction.amountCoins.toLocaleString()} coins
                      </div>
                      {transaction.amountINR && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(transaction.amountINR)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.direction === 'credit'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}
                    >
                      {transaction.direction === 'credit' ? (
                        <span className="flex items-center gap-1">
                          <MaterialSymbol name="arrow_upward" size={14} />
                          Credit
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <MaterialSymbol name="arrow_downward" size={14} />
                          Debit
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {onViewDetails && (
                      <button
                        onClick={() => onViewDetails(transaction)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
                        title="View Details"
                      >
                        <MaterialSymbol name="info" size={20} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

