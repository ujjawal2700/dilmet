import { useState, useEffect } from "react";
import { AdminTopNavbar } from "../components/AdminTopNavbar";
import { AdminSidebar } from "../components/AdminSidebar";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { MaterialSymbol } from "../../../shared/components/MaterialSymbol";
import { AdminNumberInput } from "../components/AdminNumberInput";
import adminService from "../../../core/services/admin.service";
import type {
  AdminReferral,
  AdminReferralSummary,
  AdminSettings,
} from "../types/admin.types";

export const ReferralsPage = () => {
  const [referrals, setReferrals] = useState<AdminReferral[]>([]);
  const [summary, setSummary] = useState<AdminReferralSummary>({
    totalReferrals: 0,
    pending: 0,
    rewarded: 0,
    totalCoinsPaid: 0,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", status: "all" });

  // Reward configuration
  const [referralSettings, setReferralSettings] = useState<
    AdminSettings["referral"] | null
  >(null);
  const [rewardDraft, setRewardDraft] = useState(0);
  const [isSavingReward, setIsSavingReward] = useState(false);
  const [rewardSaved, setRewardSaved] = useState(false);

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

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchReferrals();
    fetchReferralSettings();
  }, [page, filters]);

  const fetchReferrals = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.listReferrals(filters, page, 20);
      setReferrals(data.referrals);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSummary(data.summary);
    } catch (error) {
      console.error("Failed to fetch referrals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReferralSettings = async () => {
    try {
      const settings = await adminService.getAppSettings();
      setReferralSettings(settings.referral);
      setRewardDraft(settings.referral?.rewardAmount ?? 0);
    } catch (error) {
      console.error("Failed to fetch referral settings:", error);
    }
  };

  const handleSaveRewardSettings = async () => {
    if (!referralSettings) return;
    try {
      setIsSavingReward(true);
      const updated = await adminService.updateAppSettings({
        referral: { ...referralSettings, rewardAmount: rewardDraft },
      });
      setReferralSettings(updated.referral);
      setRewardDraft(updated.referral?.rewardAmount ?? rewardDraft);
      setRewardSaved(true);
      setTimeout(() => setRewardSaved(false), 2500);
    } catch (error) {
      console.error("Failed to save referral reward settings:", error);
      alert("Failed to save reward settings. Please try again.");
    } finally {
      setIsSavingReward(false);
    }
  };

  const handleToggleReferralEnabled = async () => {
    if (!referralSettings) return;
    const nextEnabled = !referralSettings.isEnabled;
    try {
      const updated = await adminService.updateAppSettings({
        referral: { ...referralSettings, isEnabled: nextEnabled },
      });
      setReferralSettings(updated.referral);
    } catch (error) {
      console.error("Failed to toggle referral program:", error);
      alert("Failed to update referral program status. Please try again.");
    }
  };

  const formatDate = (value: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

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

      <div
        className={`flex-1 p-4 md:p-6 mt-[57px] transition-all duration-300 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Refer & Earn
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track every referral and the coin rewards paid out ({total} total)
            </p>
          </div>

          {/* Reward Settings */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MaterialSymbol
                    name="settings"
                    size={18}
                    className="text-pink-600 dark:text-pink-400"
                  />
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Reward Settings
                  </h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Set how many coins a referrer earns once their referred friend
                  completes their first recharge.
                </p>
                <div className="max-w-xs">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reward Amount (coins)
                  </label>
                  <AdminNumberInput
                    value={rewardDraft}
                    onChange={setRewardDraft}
                    min={0}
                    step={1}
                    suffix="coins"
                    disabled={!referralSettings}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Program{" "}
                    {referralSettings?.isEnabled ? "Enabled" : "Disabled"}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleReferralEnabled}
                    disabled={!referralSettings}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50 ${
                      referralSettings?.isEnabled
                        ? "bg-pink-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}>
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        referralSettings?.isEnabled
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </label>

                <button
                  onClick={handleSaveRewardSettings}
                  disabled={
                    !referralSettings ||
                    isSavingReward ||
                    rewardDraft === referralSettings?.rewardAmount
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSavingReward ? (
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : rewardSaved ? (
                    <MaterialSymbol name="check" size={18} />
                  ) : (
                    <MaterialSymbol name="save" size={18} />
                  )}
                  {rewardSaved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Referrals
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {summary.totalReferrals.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <MaterialSymbol
                    name="diversity_3"
                    className="text-blue-600 dark:text-blue-400"
                    size={24}
                  />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Awaiting First Recharge
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {summary.pending.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <MaterialSymbol
                    name="pending"
                    className="text-orange-600 dark:text-orange-400"
                    size={24}
                  />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Rewarded
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {summary.rewarded.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MaterialSymbol
                    name="check_circle"
                    className="text-green-600 dark:text-green-400"
                    size={24}
                  />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Coins Paid Out
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {summary.totalCoinsPaid.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <MaterialSymbol
                    name="monetization_on"
                    className="text-purple-600 dark:text-purple-400"
                    size={24}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <MaterialSymbol
                name="search"
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by referrer or friend name/phone"
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent">
              <option value="all">All Statuses</option>
              <option value="pending">Awaiting First Recharge</option>
              <option value="rewarded">Rewarded</option>
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
                    <th className="px-4 py-3 font-medium">Referrer</th>
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Referred Friend</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Reward</th>
                    <th className="px-4 py-3 font-medium">Signed Up</th>
                    <th className="px-4 py-3 font-medium">Rewarded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {referrals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                        No referrals found
                      </td>
                    </tr>
                  ) : (
                    referrals.map((r) => (
                      <tr key={r.id} className="text-gray-900 dark:text-white">
                        <td className="px-4 py-3">
                          <div className="font-medium">{r.referrerName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {r.referrerPhone} · {r.referrerRole}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {r.referralCode}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{r.refereeName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {r.refereePhone}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              r.status === "rewarded"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                : "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                            }`}>
                            {r.status === "rewarded"
                              ? "Rewarded"
                              : "Awaiting Recharge"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {r.status === "rewarded" ? (
                            <span className="text-green-600 dark:text-green-400 font-bold">
                              +{r.rewardCoins.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(r.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(r.rewardedAt)}
                        </td>
                      </tr>
                    ))
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
                  className={`px-3 py-1 rounded ${page === i + 1 ? "bg-pink-600 text-white" : "bg-gray-200 dark:bg-gray-800"}`}>
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
