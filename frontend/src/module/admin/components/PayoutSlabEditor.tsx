// @ts-nocheck
import { useState } from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import type { PayoutSlab } from '../types/admin.types';

interface PayoutSlabEditorProps {
  slabs: PayoutSlab[];
  onSave: (slab: PayoutSlab) => void;
  onDelete: (slabId: string) => void;
  onAdd: () => void;
}

export const PayoutSlabEditor = ({ slabs, onSave, onDelete, onAdd }: PayoutSlabEditorProps) => {
  const [editingSlab, setEditingSlab] = useState<PayoutSlab | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleEdit = (slab: PayoutSlab) => {
    setEditingSlab({ ...slab });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setEditingSlab({
      id: '',
      minCoins: 0,
      maxCoins: null,
      payoutPercentage: 50,
      displayOrder: slabs.length + 1,
    });
    setIsAddingNew(true);
  };

  const handleSave = () => {
    if (!editingSlab) return;
    onSave(editingSlab);
    setEditingSlab(null);
    setIsAddingNew(false);
  };

  const handleCancel = () => {
    setEditingSlab(null);
    setIsAddingNew(false);
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payout Slabs</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure payout percentages based on coin amounts
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <MaterialSymbol name="add" size={20} />
          Add Slab
        </button>
      </div>

      {/* Slabs List */}
      <div className="space-y-3 mb-6">
        {slabs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MaterialSymbol name="account_balance_wallet" className="mx-auto mb-2" size={32} />
            <p>No payout slabs configured</p>
          </div>
        ) : (
          slabs
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((slab) => (
              <div
                key={slab.id}
                className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {slab.minCoins.toLocaleString()} - {slab.maxCoins ? `${slab.maxCoins.toLocaleString()} coins` : 'Unlimited'}
                      </h4>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                        {slab.payoutPercentage}% Payout
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Display Order: #{slab.displayOrder}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(slab)}
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      title="Edit slab"
                    >
                      <MaterialSymbol name="edit" size={20} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this payout slab?')) {
                          onDelete(slab.id);
                        }
                      }}
                      className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      title="Delete slab"
                    >
                      <MaterialSymbol name="delete" size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Edit/Add Modal */}
      {editingSlab && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isAddingNew ? 'Add New Payout Slab' : 'Edit Payout Slab'}
            </h3>

            <div className="space-y-4">
              {/* Min Coins */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Coins
                </label>
                <input
                  type="number"
                  value={editingSlab.minCoins}
                  onChange={(e) =>
                    setEditingSlab({
                      ...editingSlab,
                      minCoins: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Max Coins */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Coins (leave empty for unlimited)
                </label>
                <input
                  type="number"
                  value={editingSlab.maxCoins || ''}
                  onChange={(e) =>
                    setEditingSlab({
                      ...editingSlab,
                      maxCoins: e.target.value === '' ? null : parseInt(e.target.value) || null,
                    })
                  }
                  min={editingSlab.minCoins + 1}
                  step="1"
                  placeholder="Unlimited"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Payout Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payout Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={editingSlab.payoutPercentage}
                    onChange={(e) =>
                      setEditingSlab({
                        ...editingSlab,
                        payoutPercentage: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    %
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Percentage of coins that will be paid out in INR
                </p>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={editingSlab.displayOrder}
                  onChange={(e) =>
                    setEditingSlab({
                      ...editingSlab,
                      displayOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  min="1"
                  step="1"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Preview */}
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Payout Range:</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {editingSlab.minCoins.toLocaleString()} - {editingSlab.maxCoins ? `${editingSlab.maxCoins.toLocaleString()} coins` : 'Unlimited'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Payout: <span className="font-semibold">{editingSlab.payoutPercentage}%</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Example: 1000 coins = ₹{Math.floor((1000 * editingSlab.payoutPercentage) / 100).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={editingSlab.minCoins < 0 || editingSlab.payoutPercentage < 0 || editingSlab.payoutPercentage > 100}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingNew ? 'Add Slab' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

