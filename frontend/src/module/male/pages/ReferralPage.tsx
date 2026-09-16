import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/context/AuthContext";
import { useGlobalState } from "../../../core/context/GlobalStateContext";
import { MaterialSymbol } from "../../../shared/components/MaterialSymbol";
import { useTranslation } from "../../../core/hooks/useTranslation";
import walletService from "../../../core/services/wallet.service";

interface ReferralHistoryItem {
  id: string;
  refereeName: string;
  status: "pending" | "rewarded";
  rewardCoins: number;
  createdAt: string;
}

export const ReferralPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { appSettings } = useGlobalState();
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const referralId = user?.referralId || "MATCH101";
  const referralCount = user?.referralCount || 0;
  const rewardAmount = appSettings?.referral?.rewardAmount || 200;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const data = await walletService.getMyReferrals();
      setHistory(data.referrals || []);
      setTotalCoinsEarned(data.totalCoinsEarned || 0);
    } catch (err) {
      console.error("Failed to load referral history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareMessage = `Hey! Join me on Dil Mate and find amazing connections. Use my referral ID: ${referralId} during signup to get a special bonus! 🚀`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Dil Mate",
        text: shareMessage,
        url: window.location.origin,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-[#f8f4f6] min-h-screen pb-24 relative overflow-hidden font-display selection:bg-pink-600 selection:text-white antialiased">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 pt-3 pb-3 bg-white/90 backdrop-blur-xl border-b border-pink-100/50 shadow-xs">
        <button
          onClick={() => navigate(-1)}
          className="size-10 flex items-center justify-center rounded-2xl bg-pink-50 text-pink-600 active:scale-90 transition-all shadow-xs"
          aria-label="Back">
          <MaterialSymbol name="arrow_back" size={22} />
        </button>
        <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-indigo-600 bg-clip-text text-transparent">
          REFER & EARN
        </h1>
        <div className="size-10" />
      </header>

      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full flex flex-col relative z-10">
        <main className="p-4 space-y-6">
          {/* Premium Reward Hero */}
          <div className="relative group">
            <div className="relative bg-gradient-to-br from-pink-600 via-rose-500 to-indigo-600 text-white rounded-[2rem] p-7 overflow-hidden shadow-xl">
              {/* Background watermark icon */}
              <div className="absolute -top-6 -right-6 opacity-15 rotate-12 transition-transform group-hover:scale-110 duration-700 pointer-events-none">
                <MaterialSymbol name="redeem" size={180} filled />
              </div>

              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">
                  {t("Invite Your Circle") || "INVITE YOUR CIRCLE"}
                </span>
                <h2 className="text-3xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
                  {t("Invite & Get") || "Invite & Get"}
                </h2>

                <div className="flex items-center gap-3 py-3">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/30 shadow-inner">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-[#FFD93D] drop-shadow-sm">
                        {rewardAmount}
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-[#FFD93D]">
                        {t("Coins") || "COINS"}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="h-0.5 w-10 bg-white/40 rounded-full mb-1.5" />
                    <p className="text-[11px] font-black leading-snug text-white/95">
                      {t("when your friend makes their first recharge") ||
                        "when your friend makes their first recharge"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[9px] font-black tracking-widest text-white/80 uppercase bg-white/10 px-3 py-1 rounded-full inline-block">
                  Limitless Earning Potential
                </span>
              </div>
            </div>
          </div>

          {/* Referral ID "The Vault" */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-muted uppercase tracking-widest px-1">
              {t("Your Secret Code") || "YOUR SECRET CODE"}
            </h3>

            <div className="bg-white rounded-[1.5rem] p-4 shadow-card border border-pink-50 flex items-center gap-3">
              <div className="flex-1 rounded-2xl py-3 px-4 flex items-center justify-center bg-[#f8f4f6] border border-pink-100">
                <span className="text-2xl font-black tracking-[0.25em] text-pink-600 font-mono select-all">
                  {referralId}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-5 h-12 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-md ${
                  copied
                    ? "bg-emerald-500 text-white shadow-emerald-500/30"
                    : "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-pink-500/30"
                }`}>
                <MaterialSymbol
                  name={copied ? "check" : "content_copy"}
                  size={18}
                  className="text-white"
                />
                <span>
                  {copied ? t("Done") || "COPIED" : t("Copy") || "COPY"}
                </span>
              </button>
            </div>
          </div>

          {/* How it works - Visual Flow */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-muted uppercase tracking-widest px-1">
              {t("How the Magic Happens") || "HOW IT WORKS"}
            </h3>

            <div className="space-y-2.5">
              {[
                {
                  icon: "share",
                  title: t("Broadcast your link") || "1. Share Your Code",
                  desc:
                    t("Send your unique referral code to friends.") ||
                    "Send your unique code to friends and contacts.",
                  iconColor: "text-pink-600",
                  iconBg: "bg-pink-50",
                },
                {
                  icon: "how_to_reg",
                  title: t("The onboarding") || "2. Friend Registers",
                  desc:
                    t("Your contacts register using your secret code.") ||
                    "Your friend signs up using your code.",
                  iconColor: "text-rose-500",
                  iconBg: "bg-rose-50",
                },
                {
                  icon: "monetization_on",
                  title: t("Claim the bounty") || "3. Get Instant Coins",
                  desc: `${t("You receive") || "You receive"} ${rewardAmount} ${t("coins once they complete their first recharge.") || "coins when they make their first recharge."}`,
                  iconColor: "text-indigo-600",
                  iconBg: "bg-indigo-50",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[1.25rem] p-4 flex items-center gap-3.5 shadow-sm border border-pink-50 transition-all hover:border-pink-200">
                  <div
                    className={`size-12 rounded-2xl ${step.iconBg} flex items-center justify-center shrink-0`}>
                    <MaterialSymbol
                      name={step.icon}
                      size={24}
                      className={step.iconColor}
                      filled
                    />
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <h4 className="text-xs font-black text-ink uppercase tracking-tight">
                      {step.title}
                    </h4>
                    <p className="text-[11px] font-semibold text-muted-light leading-snug">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-[1.5rem] p-5 shadow-card border border-pink-50 relative overflow-hidden">
              <span className="text-[10px] font-black text-muted uppercase tracking-wider block">
                {t("Your Referrals") || "REFERRALS"}
              </span>
              <h4 className="text-3xl font-black text-ink tracking-tight mt-1">
                {referralCount}
              </h4>
              <div className="absolute top-4 right-4 size-10 rounded-xl flex items-center justify-center bg-pink-50">
                <MaterialSymbol
                  name="groups"
                  className="text-pink-600"
                  size={22}
                  filled
                />
              </div>
            </div>

            <div className="bg-white rounded-[1.5rem] p-5 shadow-card border border-pink-50 relative overflow-hidden">
              <span className="text-[10px] font-black text-muted uppercase tracking-wider block">
                {t("Coins Earned") || "COINS EARNED"}
              </span>
              <h4 className="text-3xl font-black text-emerald-600 tracking-tight mt-1">
                {totalCoinsEarned}
              </h4>
              <div className="absolute top-4 right-4 size-10 rounded-xl flex items-center justify-center bg-emerald-50">
                <MaterialSymbol
                  name="monetization_on"
                  className="text-emerald-500"
                  size={22}
                  filled
                />
              </div>
            </div>
          </div>

          {/* Referral History */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-muted uppercase tracking-widest px-1">
              {t("Referral History") || "REFERRAL HISTORY"}
            </h3>

            {isLoadingHistory ? (
              <div className="flex justify-center py-6">
                <div className="size-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="bg-white rounded-[1.5rem] p-6 text-center shadow-card border border-pink-50">
                <p className="text-xs font-bold text-muted-light">
                  {t("No referrals yet. Share your code to get started!") ||
                    "No referrals yet. Share your code to get started!"}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-[1.5rem] overflow-hidden divide-y divide-gray-50 shadow-card border border-pink-50">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-pink-50 flex items-center justify-center">
                        <MaterialSymbol
                          name="person"
                          size={20}
                          className="text-pink-500"
                          filled
                        />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-ink">
                          {item.refereeName}
                        </p>
                        <p className="text-[10px] font-bold text-muted-light">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {item.status === "rewarded" ? (
                      <span className="text-xs font-black text-emerald-600">
                        +{item.rewardCoins} {t("Coins") || "Coins"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-wide text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                        {t("Pending Recharge") || "Pending"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main Share CTA Button */}
          <button
            onClick={handleShare}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-indigo-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
            <MaterialSymbol
              name="share"
              size={20}
              className="text-white"
              filled
            />
            <span>{t("INVITE WITH FRIENDS") || "SHARE REFERRAL CODE"}</span>
          </button>
        </main>
      </div>
    </div>
  );
};
