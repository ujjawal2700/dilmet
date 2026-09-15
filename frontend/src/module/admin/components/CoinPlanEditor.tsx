// @ts-nocheck
import { useState } from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import type { CoinPlan } from '../types/admin.types';

interface CoinPlanEditorProps {
  plans: CoinPlan[];
  onSave: (plan: CoinPlan) => void;
  onDelete: (planId: string) => void;
  onAdd: () => void;
}

export const CoinPlanEditor = ({ plans, onSave, onDelete, onAdd }: CoinPlanEditorProps) => {
  const [editingPlan, setEditingPlan] = useState<CoinPlan | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleEdit = (plan: CoinPlan) => {
    setEditingPlan({ ...plan });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setEditingPlan({
      id: '',
      name: '',
      tier: 'basic',
      priceInINR: 0,
      baseCoins: 0,
      bonusCoins: 0,
      totalCoins: 0,
      isActive: true,
      displayOrder: plans.length + 1,
    });
    setIsAddingNew(true);
  };

  const handleSave = () => {
    if (!editingPlan) return;

    const totalCoins = editingPlan.baseCoins + editingPlan.bonusCoins;
    const planToSave = {
      ...editingPlan,
      totalCoins,
    };

    onSave(planToSave);
    setEditingPlan(null);
    setIsAddingNew(false);
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setIsAddingNew(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Coin Plans</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage coin purchase plans and pricing
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <MaterialSymbol name="add" size={20} />
          Add Plan
        </button>
      </div>

      {/* Plans List */}
      <div className="space-y-3 mb-6">
        {plans.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MaterialSymbol name="monetization_on" className="mx-auto mb-2" size={32} />
            <p>No coin plans configured</p>
          </div>
        ) : (
          plans
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((plan) => (
              <div
                key={plan.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  plan.isActive
                    ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
                    : 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {plan.name}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          plan.tier === 'basic'
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            : plan.tier === 'silver'
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                            : plan.tier === 'gold'
                            ? 'bg-yellow-200 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                            : 'bg-purple-200 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                        }`}
                      >
                        {plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}
                      </span>
                      {plan.badge && (
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs font-medium">
                          {plan.badge}
                        </span>
                      )}
                      {!plan.isActive && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Price</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(plan.priceInINR)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Coins</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {plan.totalCoins.toLocaleString()}
                        </p>
                        {plan.bonusCoins > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            +{plan.bonusCoins} bonus
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Order</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          #{plan.displayOrder}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      title="Edit plan"
                    >
                      <MaterialSymbol name="edit" size={20} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${plan.name}?`)) {
                          onDelete(plan.id);
                        }
                      }}
                      className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      title="Delete plan"
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
      {editingPlan && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isAddingNew ? 'Add New Coin Plan' : 'Edit Coin Plan'}
            </h3>

            <div className="space-y-4">
              {/* Plan Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, name: e.target.value })
                  }
                  placeholder="e.g., Basic Plan"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tier
                </label>
                <select
                  value={editingPlan.tier}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      tier: e.target.value as CoinPlan['tier'],
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="basic">Basic</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                </select>
              </div>

              {/* Price and Coins Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (INR)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.priceInINR}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        priceInINR: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Base Coins
                  </label>
                  <input
                    type="number"
                    value={editingPlan.baseCoins}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        baseCoins: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Bonus Coins and Display Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bonus Coins
                  </label>
                  <input
                    type="number"
                    value={editingPlan.bonusCoins}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        bonusCoins: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingPlan.displayOrder}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        displayOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    min="1"
                    step="1"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Total Coins Preview */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Coins:</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(editingPlan.baseCoins + editingPlan.bonusCoins).toLocaleString()}
                </p>
                {editingPlan.bonusCoins > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Base: {editingPlan.baseCoins.toLocaleString()} + Bonus: {editingPlan.bonusCoins.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Badge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Badge (Optional)
                </label>
                <select
                  value={editingPlan.badge || ''}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      badge: e.target.value || undefined,
                    } as CoinPlan)
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No Badge</option>
                  <option value="POPULAR">Popular</option>
                  <option value="BEST VALUE">Best Value</option>
                </select>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingPlan.isActive}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, isActive: e.target.checked })
                  }
                  className="size-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Plan is active (visible to users)
                </label>
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
                disabled={!editingPlan.name || editingPlan.priceInINR <= 0 || editingPlan.baseCoins <= 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingNew ? 'Add Plan' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

