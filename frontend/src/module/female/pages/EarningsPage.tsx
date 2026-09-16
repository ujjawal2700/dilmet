import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialSymbol } from "../../../shared/components/MaterialSymbol";
import walletService from "../../../core/services/wallet.service";
import type { Transaction } from "../../../core/types/wallet.types";
import { useTranslation } from "../../../core/hooks/useTranslation";

export const EarningsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedPeriod, setSelectedPeriod] = useState<
    "daily" | "weekly" | "monthly"
  >("monthly");
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleEarningsCount, setVisibleEarningsCount] = useState(10);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [summaryData, txData] = await Promise.all([
        walletService.getEarningsSummary().catch(() => null),
        walletService
          .getMyTransactions({ direction: "credit", limit: 50 })
          .catch(() => ({ transactions: [] })),
      ]);

      if (summaryData) {
        setSummary(summaryData);
        setBalance(summaryData.availableBalance || 0);
      }
      setTransactions(txData.transactions || []);
    } catch (err: any) {
      console.error("Failed to fetch earnings data:", err);
      setError(t("errorLoadEarnings")); // Fallback to a generic error message if specific one not found
    } finally {
      setIsLoading(false);
    }
  };

  // Get total earnings based on selected period
  const displayTotalEarnings = summary
    ? selectedPeriod === "daily"
      ? summary.periodStats.daily
      : selectedPeriod === "weekly"
        ? summary.periodStats.weekly
        : summary.periodStats.monthly
    : 0;

  // Get earnings breakdown by type
  const earningsByType = summary?.earningsByType || {};

  // Get icon for transaction type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "message_earned":
        return "mail";
      case "video_call_earned":
        return "videocam";
      case "voice_call_earned":
        return "call";
      case "gift_received":
        return "redeem";
      default:
        return "monetization_on";
    }
  };

  // Get accent color for transaction type (matches FemaleStatsGrid's per-type color coding)
  const getTypeColor = (type: string) => {
    switch (type) {
      case "message_earned":
        return "text-blue-500";
      case "video_call_earned":
        return "text-purple-500";
      case "voice_call_earned":
        return "text-indigo-500";
      case "gift_received":
        return "text-pink-500";
      default:
        return "text-amber-500";
    }
  };

  // Format transaction type for display
  const formatType = (type: string) => {
    switch (type) {
      case "message_earned":
        return t("typeMessage");
      case "video_call_earned":
        return t("typeVideoCall");
      case "voice_call_earned":
        return t("typeVoiceCall");
      case "gift_received":
        return t("typeGift");
      default:
        return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  // Filter earnings transactions
  const earningsTransactions = transactions.filter(
    (t) => t.direction === "credit" && t.type !== "purchase",
  );
  const hasMoreEarnings = earningsTransactions.length > visibleEarningsCount;

  return (
    <div className="font-display text-slate-900 dark:text-white antialiased selection:bg-pink-500 selection:text-white min-h-screen relative lg:pl-60 overflow-hidden flex flex-col bg-background-light dark:bg-[#0a0a0a] pb-24">
      <header className="relative z-20 flex items-center justify-between px-6 pb-5 pt-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800/80 shadow-sm">
        <div className="space-y-0.5">
          <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 leading-none">
            {t("finance")}
          </h1>
          <h2 className="text-2xl font-black tracking-tight">
            {t("earnings")}
          </h2>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-16 rounded-2xl bg-slate-200 dark:bg-slate-800"
                />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-3xl text-center space-y-2">
            <MaterialSymbol name="error" className="text-red-500" size={32} />
            <p className="text-xs font-bold text-red-500">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Earnings Summary Card */}
            <div className="group relative w-full overflow-hidden skeuo-card bg-mesh-glass rounded-[2rem] p-6 border-white/60 dark:border-white/5 shadow-xl transition-all hover:translate-y-[-2px]">
              {/* Glossy Reflection Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <MaterialSymbol
                      name="account_balance_wallet"
                      className="text-pink-500"
                      size={36}
                      filled
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-0.5">
                        {t("totalEarnings")}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                          {displayTotalEarnings.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">
                          {t("coins")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="skeuo-inset bg-gray-50/30 dark:bg-black/20 rounded-2xl p-4 flex items-center justify-between border border-white/10">
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                    {t("availableToWithdraw")}
                  </span>
                  <span className="text-lg font-black text-emerald-500 dark:text-emerald-400 tracking-tight leading-none">
                    ₹{balance.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/female/withdrawal")}
                  className="relative w-full h-14 skeuo-button bg-pink-500 rounded-2xl flex items-center justify-center gap-3 group/btn overflow-hidden transition-all active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  <MaterialSymbol name="payments" size={22} className="text-white drop-shadow-md" filled />
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-white drop-shadow-sm">
                    {t("withdrawFunds") || t("withdraw")}
                  </span>
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(earningsByType).map(([type, amount]) => (
                <div
                  key={type}
                  className="group flex flex-col items-center justify-center gap-2 rounded-3xl bg-white/70 dark:bg-black/40 backdrop-blur-md p-4 transition-all duration-300"
                >
                  <MaterialSymbol
                    name={getTypeIcon(type)}
                    size={26}
                    filled
                    className={`${getTypeColor(type)} transition-transform group-hover:scale-110 duration-500`}
                  />
                  <div className="space-y-0.5 text-center">
                    <p className="text-lg font-black text-slate-900 dark:text-white leading-none">
                      {amount as number}
                    </p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {formatType(type)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Period Selector Tabs */}
            <div className="bg-white/70 dark:bg-black/40 backdrop-blur-md rounded-2xl p-1.5 flex gap-1 relative overflow-hidden">
              {(["daily", "weekly", "monthly"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative z-10 ${
                    selectedPeriod === period
                      ? "bg-pink-500 text-white shadow-md shadow-pink-500/20"
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {t(period)}
                </button>
              ))}
            </div>

            {/* Recent History */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <MaterialSymbol name="history" size={20} className="text-pink-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white">
                  {t("recentEarnings")}
                </h3>
              </div>

              <div className="skeuo-card bg-mesh-glass rounded-[2rem] overflow-hidden border-white/60 dark:border-white/5 shadow-lg divide-y divide-white/10">
                {earningsTransactions.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <MaterialSymbol
                      name="wallet"
                      size={44}
                      className="text-slate-300 dark:text-slate-600"
                    />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {t("noEarningsYet")}
                    </p>
                  </div>
                ) : (
                  <>
                    {earningsTransactions
                      .slice(0, visibleEarningsCount)
                      .map((tx) => (
                        <div
                          key={tx._id}
                          className="flex items-center justify-between p-5 group transition-colors hover:bg-white/20 dark:hover:bg-white/5"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="size-11 rounded-2xl flex items-center justify-center bg-white/70 dark:bg-black/30">
                              <MaterialSymbol
                                name={getTypeIcon(tx.type)}
                                size={22}
                                filled
                                className={getTypeColor(tx.type)}
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-black text-slate-900 dark:text-white">
                                {formatType(tx.type)}
                              </p>
                              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                {new Date(tx.createdAt).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-black text-emerald-500 dark:text-emerald-400 tracking-tight">
                              +{tx.amountCoins}
                            </p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                              {t("coins")}
                            </p>
                          </div>
                        </div>
                      ))}

                    {hasMoreEarnings && (
                      <button
                        onClick={() =>
                          setVisibleEarningsCount((prev) => prev + 10)
                        }
                        className="w-full py-5 text-[10px] font-black uppercase tracking-[0.3em] text-pink-500 hover:bg-white/20 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                      >
                        {t("showMoreHistory")}
                        <MaterialSymbol name="expand_more" size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
