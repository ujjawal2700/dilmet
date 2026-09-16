import { useState, useEffect } from 'react';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { CoinPlanEditor } from '../components/CoinPlanEditor';
import { PayoutSlabEditor } from '../components/PayoutSlabEditor';
import { AdminNumberInput } from '../components/AdminNumberInput';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import walletService from '../../../core/services/wallet.service';
import adminService from '../../../core/services/admin.service';
import type { CoinPlan, PayoutSlab, MessageCosts } from '../types/admin.types';
import type { CoinPlan as WalletCoinPlan, PayoutSlab as WalletPayoutSlab } from '../../../core/types/wallet.types';

// Default values for settings (these would come from an app settings API in production)
const defaultMessageCosts: MessageCosts = {
  costMode: 'perMessage',
  basic: 20,
  silver: 18,
  gold: 16,
  platinum: 12,
  wordCosts: {
    basic: 20,
    silver: 18,
    gold: 16,
    platinum: 14,
  },
  videoCall: 500,
  voiceCall: 300,
};

const defaultWithdrawalSettings = {
  minAmount: 500,
  maxAmount: 50000,
  processingFee: 0,
  dailyLimit: 10000,
  weeklyLimit: 50000,
};

// Helper to convert wallet types to admin types
const mapWalletPlanToAdminPlan = (plan: WalletCoinPlan): CoinPlan => ({
  id: plan._id,
  name: plan.name,
  tier: plan.tier,
  priceInINR: plan.priceInINR,
  baseCoins: plan.baseCoins,
  bonusCoins: plan.bonusCoins,
  totalCoins: plan.totalCoins,
  isActive: plan.isActive,
  displayOrder: plan.displayOrder,
  badge: plan.badge || undefined,
});

const mapWalletSlabToAdminSlab = (slab: WalletPayoutSlab): PayoutSlab => ({
  id: slab._id,
  minCoins: slab.minCoins,
  maxCoins: slab.maxCoins,
  payoutPercentage: slab.payoutPercentage,
  displayOrder: slab.displayOrder,
});

export const CoinEconomyPage = () => {
  const [coinPlans, setCoinPlans] = useState<CoinPlan[]>([]);
  const [payoutSlabs, setPayoutSlabs] = useState<PayoutSlab[]>([]);
  const [messageCosts, setMessageCosts] = useState<MessageCosts>(defaultMessageCosts);
  const [withdrawalSettings, setWithdrawalSettings] = useState(defaultWithdrawalSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useAdminNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [plans, slabs, settings] = await Promise.all([
        walletService.getAllCoinPlans(),
        walletService.getPayoutSlabs(),
        adminService.getAppSettings(),
      ]);

      setCoinPlans(plans.map(mapWalletPlanToAdminPlan));
      setPayoutSlabs(slabs.map(mapWalletSlabToAdminSlab));
      setMessageCosts({
        ...defaultMessageCosts,
        ...settings.messageCosts,
        wordCosts: { ...defaultMessageCosts.wordCosts, ...settings.messageCosts?.wordCosts },
      });
      setWithdrawalSettings(settings.withdrawal);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSaveCoinPlan = async (plan: CoinPlan) => {
    try {
      setIsSaving(true);
      setError(null);

      if (plan.id && coinPlans.find((p) => p.id === plan.id)) {
        // Update existing
        const updated = await walletService.updateCoinPlan(plan.id, {
          name: plan.name,
          tier: plan.tier,
          priceInINR: plan.priceInINR,
          baseCoins: plan.baseCoins,
          bonusCoins: plan.bonusCoins,
          badge: plan.badge || null,
          displayOrder: plan.displayOrder,
          isActive: plan.isActive,
        });
        setCoinPlans((prev) => prev.map((p) => (p.id === plan.id ? mapWalletPlanToAdminPlan(updated) : p)));
        showSuccess('Coin plan updated successfully');
      } else {
        // Add new
        const created = await walletService.createCoinPlan({
          name: plan.name,
          tier: plan.tier,
          priceInINR: plan.priceInINR,
          baseCoins: plan.baseCoins,
          bonusCoins: plan.bonusCoins,
          badge: plan.badge || null,
          displayOrder: plan.displayOrder || coinPlans.length + 1,
        });
        setCoinPlans((prev) => [...prev, mapWalletPlanToAdminPlan(created)]);
        showSuccess('Coin plan created successfully');
      }
    } catch (err: any) {
      console.error('Failed to save coin plan:', err);
      setError(err.response?.data?.message || 'Failed to save coin plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCoinPlan = async (planId: string) => {
    try {
      setIsSaving(true);
      setError(null);
      await walletService.deleteCoinPlan(planId);
      setCoinPlans((prev) => prev.filter((p) => p.id !== planId));
      showSuccess('Coin plan deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete coin plan:', err);
      setError(err.response?.data?.message || 'Failed to delete coin plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePayoutSlab = async (slab: PayoutSlab) => {
    try {
      setIsSaving(true);
      setError(null);

      if (slab.id && payoutSlabs.find((s) => s.id === slab.id)) {
        // Update existing
        const updated = await walletService.updatePayoutSlab(slab.id, {
          minCoins: slab.minCoins,
          maxCoins: slab.maxCoins,
          payoutPercentage: slab.payoutPercentage,
          displayOrder: slab.displayOrder,
        });
        setPayoutSlabs((prev) => prev.map((s) => (s.id === slab.id ? mapWalletSlabToAdminSlab(updated) : s)));
        showSuccess('Payout slab updated successfully');
      } else {
        // Add new
        const created = await walletService.createPayoutSlab({
          minCoins: slab.minCoins,
          maxCoins: slab.maxCoins,
          payoutPercentage: slab.payoutPercentage,
          displayOrder: slab.displayOrder || payoutSlabs.length + 1,
        });
        setPayoutSlabs((prev) => [...prev, mapWalletSlabToAdminSlab(created)]);
        showSuccess('Payout slab created successfully');
      }
    } catch (err: any) {
      console.error('Failed to save payout slab:', err);
      setError(err.response?.data?.message || 'Failed to save payout slab');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePayoutSlab = async (slabId: string) => {
    try {
      setIsSaving(true);
      setError(null);
      await walletService.deletePayoutSlab(slabId);
      setPayoutSlabs((prev) => prev.filter((s) => s.id !== slabId));
      showSuccess('Payout slab deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete payout slab:', err);
      setError(err.response?.data?.message || 'Failed to delete payout slab');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMessageCosts = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await adminService.updateAppSettings({ messageCosts });
      setHasChanges(false);
      showSuccess('Message costs saved successfully');
    } catch (err: any) {
      console.error('Failed to save message costs:', err);
      setError('Failed to save message costs');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWithdrawalSettings = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await adminService.updateAppSettings({ withdrawal: withdrawalSettings });
      setHasChanges(false);
      showSuccess('Withdrawal settings saved successfully');
    } catch (err: any) {
      console.error('Failed to save withdrawal settings:', err);
      setError('Failed to save withdrawal settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = () => {
    handleSaveMessageCosts();
    handleSaveWithdrawalSettings();
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0a0a0a] overflow-x-hidden">
      {/* Top Navbar */}
      <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 mt-[57px] lg:ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Coin Economy</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage coin plans, payout slabs, message costs, and withdrawal settings
              </p>
            </div>
            {hasChanges && (
              <button
                onClick={handleSaveAll}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <MaterialSymbol name="save" size={20} />
                Save All Changes
              </button>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl">
              <MaterialSymbol name="error" className="text-red-500" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto"><MaterialSymbol name="close" size={18} /></button>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 flex items-center gap-2 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl">
              <MaterialSymbol name="check_circle" className="text-green-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Saving Overlay */}
          {isSaving && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            </div>
          )}

          {/* Coin Plans Section */}
          {!isLoading && (
            <div className="mb-6">
              <CoinPlanEditor
                plans={coinPlans}
                onSave={handleSaveCoinPlan}
                onDelete={handleDeleteCoinPlan}
                onAdd={() => { }}
              />
            </div>
          )}

          {/* Payout Slabs Section */}
          {!isLoading && (
            <div className="mb-6">
              <PayoutSlabEditor
                slabs={payoutSlabs}
                onSave={handleSavePayoutSlab}
                onDelete={handleDeletePayoutSlab}
                onAdd={() => { }}
              />
            </div>
          )}

          {/* Message Costs Section */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Message Costs</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Configure coin costs for messages and video calls by tier
            </p>

            {/* Cost Calculation Mode Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cost Calculation Mode
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Choose whether coins are deducted as a flat cost per message, or based on the number of words in each message.
              </p>
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-1">
                <button
                  type="button"
                  onClick={() => setMessageCosts({ ...messageCosts, costMode: 'perMessage' })}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    messageCosts.costMode === 'perMessage'
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Per Message
                </button>
                <button
                  type="button"
                  onClick={() => setMessageCosts({ ...messageCosts, costMode: 'perWord' })}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    messageCosts.costMode === 'perWord'
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Per Word
                </button>
              </div>
            </div>

            {messageCosts.costMode === 'perMessage' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Basic Tier
                  </label>
                  <div className="relative">
                    <AdminNumberInput
                      value={messageCosts.basic}
                      onChange={(val) =>
                        setMessageCosts({ ...messageCosts, basic: val })
                      }
                      min={0}
                      step={1}
                      suffix="coins"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Silver Tier
                  </label>
                  <div className="relative">
                    <AdminNumberInput
                      value={messageCosts.silver}
                      onChange={(val) =>
                        setMessageCosts({ ...messageCosts, silver: val })
                      }
                      min={0}
                      step={1}
                      suffix="coins"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gold Tier
                  </label>
                  <div className="relative">
                    <AdminNumberInput
                      value={messageCosts.gold}
                      onChange={(val) =>
                        setMessageCosts({ ...messageCosts, gold: val })
                      }
                      min={0}
                      step={1}
                      suffix="coins"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Platinum Tier
                  </label>
                  <div className="relative">
                    <AdminNumberInput
                      value={messageCosts.platinum}
                      onChange={(val) =>
                        setMessageCosts({ ...messageCosts, platinum: val })
                      }
                      min={0}
                      step={1}
                      suffix="coins"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Video Call
                  </label>
                  <div className="relative">
                    <AdminNumberInput
                      value={messageCosts.videoCall}
                      onChange={(val) =>
                        setMessageCosts({ ...messageCosts, videoCall: val })
                      }
                      min={0}
                      step={1}
                      suffix="coins"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Voice Call
                  </label>
                  <div className="relative">
                    <AdminNumberInput
                      value={messageCosts.voiceCall}
                      onChange={(val) =>
                        setMessageCosts({ ...messageCosts, voiceCall: val })
                      }
                      min={0}
                      step={1}
                      suffix="coins"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Basic Tier
                    </label>
                    <div className="relative">
                      <AdminNumberInput
                        value={messageCosts.wordCosts.basic}
                        onChange={(val) =>
                          setMessageCosts({
                            ...messageCosts,
                            wordCosts: { ...messageCosts.wordCosts, basic: val },
                          })
                        }
                        min={0}
                        step={1}
                        suffix="coins/word"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Silver Tier
                    </label>
                    <div className="relative">
                      <AdminNumberInput
                        value={messageCosts.wordCosts.silver}
                        onChange={(val) =>
                          setMessageCosts({
                            ...messageCosts,
                            wordCosts: { ...messageCosts.wordCosts, silver: val },
                          })
                        }
                        min={0}
                        step={1}
                        suffix="coins/word"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gold Tier
                    </label>
                    <div className="relative">
                      <AdminNumberInput
                        value={messageCosts.wordCosts.gold}
                        onChange={(val) =>
                          setMessageCosts({
                            ...messageCosts,
                            wordCosts: { ...messageCosts.wordCosts, gold: val },
                          })
                        }
                        min={0}
                        step={1}
                        suffix="coins/word"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Platinum Tier
                    </label>
                    <div className="relative">
                      <AdminNumberInput
                        value={messageCosts.wordCosts.platinum}
                        onChange={(val) =>
                          setMessageCosts({
                            ...messageCosts,
                            wordCosts: { ...messageCosts.wordCosts, platinum: val },
                          })
                        }
                        min={0}
                        step={1}
                        suffix="coins/word"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Video Call
                    </label>
                    <div className="relative">
                      <AdminNumberInput
                        value={messageCosts.videoCall}
                        onChange={(val) =>
                          setMessageCosts({ ...messageCosts, videoCall: val })
                        }
                        min={0}
                        step={1}
                        suffix="coins"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Voice Call
                    </label>
                    <div className="relative">
                      <AdminNumberInput
                        value={messageCosts.voiceCall}
                        onChange={(val) =>
                          setMessageCosts({ ...messageCosts, voiceCall: val })
                        }
                        min={0}
                        step={1}
                        suffix="coins"
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Example: at {messageCosts.wordCosts.basic} coins/word, a 5-word message from a Basic tier sender costs {messageCosts.wordCosts.basic * 5} coins.
                </p>
              </div>
            )}

            <button
              onClick={handleSaveMessageCosts}
              className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
            >
              Save Message Costs
            </button>
          </div>

          {/* Withdrawal Settings Section */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Withdrawal Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Configure withdrawal limits and processing fees
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Amount (coins)
                </label>
                <AdminNumberInput
                  value={withdrawalSettings.minAmount}
                  onChange={(val) =>
                    setWithdrawalSettings({
                      ...withdrawalSettings,
                      minAmount: val,
                    })
                  }
                  min={0}
                  step={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Amount (coins)
                </label>
                <AdminNumberInput
                  value={withdrawalSettings.maxAmount}
                  onChange={(val) =>
                    setWithdrawalSettings({
                      ...withdrawalSettings,
                      maxAmount: val,
                    })
                  }
                  min={0}
                  step={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Processing Fee (coins)
                </label>
                <AdminNumberInput
                  value={withdrawalSettings.processingFee}
                  onChange={(val) =>
                    setWithdrawalSettings({
                      ...withdrawalSettings,
                      processingFee: val,
                    })
                  }
                  min={0}
                  step={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Daily Limit (coins)
                </label>
                <AdminNumberInput
                  value={withdrawalSettings.dailyLimit}
                  onChange={(val) =>
                    setWithdrawalSettings({
                      ...withdrawalSettings,
                      dailyLimit: val,
                    })
                  }
                  min={0}
                  step={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weekly Limit (coins)
                </label>
                <AdminNumberInput
                  value={withdrawalSettings.weeklyLimit}
                  onChange={(val) =>
                    setWithdrawalSettings({
                      ...withdrawalSettings,
                      weeklyLimit: val,
                    })
                  }
                  min={0}
                  step={1}
                />
              </div>
            </div>

            <button
              onClick={handleSaveWithdrawalSettings}
              className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
            >
              Save Withdrawal Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

