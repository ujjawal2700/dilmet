import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { MaterialSymbol } from "./MaterialSymbol";
import { useTranslation } from "../../core/hooks/useTranslation";
import { useGlobalState } from "../../core/context/GlobalStateContext";
import { useBodyScrollLock } from "../../core/hooks/useBodyScrollLock";

export interface CompletedTaskInfo {
  taskKey: string;
  title: string;
  icon: string;
  rewardCoins: number;
  newBalance: number;
  description?: string;
}

// Gentle, celebratory melodic chime using Web Audio API
const playCelebrationChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    // Major chord arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + i * 0.08 + 0.45,
      );
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.45);
    });
  } catch {
    // Silently catch audio policy blocks
  }
};

export const TaskCompletedModal = () => {
  const { t } = useTranslation();
  const { completedTask: task, clearCompletedTask: onClose } = useGlobalState();
  const [showConfetti, setShowConfetti] = useState(false);

  // Prevent background scrolling while task celebration modal is open
  useBodyScrollLock(Boolean(task));

  useEffect(() => {
    if (task) {
      setShowConfetti(true);
      playCelebrationChime();
      const timer = setTimeout(() => onClose(), 5500);
      return () => clearTimeout(timer);
    }
  }, [task, onClose]);

  // Generate confetti pieces
  const confettiPieces = useMemo(() => {
    const colors = [
      "#f59e0b",
      "#10b981",
      "#ec4899",
      "#8b5cf6",
      "#3b82f6",
      "#eab308",
      "#06b6d4",
      "#f43f5e",
      "#a855f7",
    ];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${(i * 2 + Math.random() * 5) % 100}%`,
      delay: `${(i % 10) * 0.15}s`,
      duration: `${2.2 + (i % 5) * 0.4}s`,
      color: colors[i % colors.length],
      size:
        i % 3 === 0
          ? "w-2 h-4 rounded-sm"
          : i % 3 === 1
            ? "w-2.5 h-2.5 rounded-full"
            : "w-2 h-2 rotate-45",
    }));
  }, []);

  if (!task) return null;

  const content = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300 select-none overscroll-contain touch-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
      {/* Confetti Celebration Rain */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confettiPieces.map((p) => (
            <div
              key={p.id}
              className="absolute animate-task-confetti"
              style={{
                left: p.left,
                top: "-8%",
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}>
              <div className={p.size} style={{ backgroundColor: p.color }} />
            </div>
          ))}
        </div>
      )}

      {/* Modal Card */}
      <div className="relative bg-gradient-to-b from-white via-white to-amber-50/40 dark:from-[#18181b] dark:via-[#18181b] dark:to-[#221c10] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full border-2 border-amber-300/80 dark:border-amber-500/40 animate-in zoom-in-95 slide-in-from-bottom-6 duration-400 overflow-hidden">
        {/* Background celebration shimmer rays */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 size-72 bg-gradient-to-r from-amber-400/20 via-yellow-300/30 to-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 size-9 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-all active:scale-90 z-20">
          <MaterialSymbol name="close" size={20} />
        </button>

        {/* Top Celebration Tag */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-amber-500/30 animate-bounce">
            <MaterialSymbol name="stars" size={16} filled />
            <span>{t("taskCompletedBanner") || "Task Completed!"}</span>
          </div>
        </div>

        {/* Central Celebration Graphic */}
        <div className="relative flex justify-center mb-5">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="size-28 rounded-full border-4 border-amber-400/40 animate-ping opacity-60" />
          </div>

          <div className="relative size-24 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 p-1 shadow-xl shadow-amber-500/40">
            <div className="size-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center">
              <div className="size-16 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white shadow-inner">
                <MaterialSymbol
                  name={task.icon || "military_tech"}
                  size={40}
                  filled
                  className="animate-pulse"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Heading & Task Name */}
        <div className="text-center mb-5">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("congratulations") || "Congratulations! 🎉"}
          </h2>
          <p className="text-base font-bold text-slate-700 dark:text-zinc-200 mt-1">
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {task.description}
            </p>
          )}
        </div>

        {/* Reward Callout Box */}
        <div className="relative rounded-2xl bg-gradient-to-br from-amber-400/15 via-yellow-400/20 to-amber-500/10 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-amber-950/20 border-2 border-amber-400/60 dark:border-amber-500/40 p-4 mb-4 text-center overflow-hidden shadow-inner">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-1">
            {t("rewardEarned") || "Reward Earned"}
          </p>
          <div className="flex items-center justify-center gap-2">
            <MaterialSymbol
              name="diamond"
              size={32}
              filled
              className="text-amber-500 animate-bounce"
            />
            <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              +{task.rewardCoins}
            </span>
            <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
              {t("coins") || "Coins"}
            </span>
          </div>
          <p className="text-[11px] font-semibold text-amber-700/80 dark:text-amber-300/80 mt-1">
            {t("addedToWallet") || "Added to your wallet balance"}
          </p>
        </div>

        {/* New Balance Row */}
        {task.newBalance !== undefined && task.newBalance !== null && (
          <div className="rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 px-4 py-2.5 mb-5 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              {t("newBalanceLabel") || "Updated Balance"}
            </span>
            <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white">
              <MaterialSymbol
                name="account_balance_wallet"
                size={18}
                className="text-emerald-500"
                filled
              />
              <span className="text-base">{task.newBalance}</span>
              <span className="text-xs font-bold text-slate-400">
                {t("coins") || "coins"}
              </span>
            </div>
          </div>
        )}

        {/* Claim / Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white font-black text-base shadow-lg shadow-amber-500/35 hover:shadow-xl hover:shadow-amber-500/45 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2">
          <span>{t("awesomeThanks") || "Awesome, Thanks!"}</span>
          <MaterialSymbol name="check_circle" size={20} filled />
        </button>
      </div>

      <style>{`
                @keyframes task-confetti {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
                }
                .animate-task-confetti { animation: task-confetti linear forwards; }
            `}</style>
    </div>
  );

  return createPortal(content, document.body);
};

export default TaskCompletedModal;
