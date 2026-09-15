import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialSymbol } from "../../../shared/components/MaterialSymbol";
import { useTranslation } from "../../../core/hooks/useTranslation";
import taskService, { DailyTask } from "../../../core/services/task.service";
import { msUntilNextISTMidnight, formatCountdown } from "../../../core/utils/dayBoundary";

export const TasksPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(() => formatCountdown(msUntilNextISTMidnight()));

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await taskService.getMyTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  // Live countdown to the next 12 AM IST reset
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = msUntilNextISTMidnight();
      setCountdown(formatCountdown(remaining));
      // Rolled over to a new day while the page was open - refresh the list
      if (remaining > 24 * 60 * 60 * 1000 - 1500) {
        fetchTasks();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTaskClick = useCallback(
    (task: DailyTask) => {
      if (task.deepLink) navigate(task.deepLink);
    },
    [navigate],
  );

  const totalEarnableCoins = tasks.reduce((sum, t) => sum + t.rewardCoins, 0);
  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <div className="font-display text-ink antialiased min-h-screen relative lg:pl-60 overflow-x-hidden bg-background-light pb-24">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate(-1)}
              className="size-9 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-all"
              aria-label="Back"
            >
              <MaterialSymbol name="arrow_back" size={20} />
            </button>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t("Daily Tasks") || "Daily Tasks"}
            </h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">
            {t("Complete tasks anywhere in the app to earn coins") ||
              "Complete tasks anywhere in the app to earn coins"}
          </p>
        </div>

        {/* Summary + Countdown Card */}
        <div className="mx-4 mb-5 rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 p-6 text-white shadow-lg shadow-pink-500/25 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 opacity-10 rotate-12">
            <MaterialSymbol name="task_alt" size={140} filled />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">
                {t("Resets In") || "Resets In"}
              </p>
              <p className="text-3xl font-black font-mono tracking-tight mt-0.5">{countdown}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">
                {t("Completed") || "Completed"}
              </p>
              <p className="text-3xl font-black mt-0.5">
                {completedCount}/{tasks.length}
              </p>
            </div>
          </div>
          <div className="relative z-10 mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
            <MaterialSymbol name="diamond" size={18} className="text-yellow-300" />
            <span className="text-sm font-bold">
              {t("Earn up to")} {totalEarnableCoins} {t("coins")} {t("today")}
            </span>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="mx-4 p-4 bg-red-100 text-red-700 rounded-xl text-sm">{error}</div>
        )}

        {/* Task List */}
        {!isLoading && !error && (
          <div className="px-4 space-y-3">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className={`w-full text-left rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-[0.98] ${
                  task.isCompleted
                    ? "bg-emerald-50 border border-emerald-200"
                    : "bg-white border border-slate-100 shadow-sm hover:shadow-md"
                }`}
              >
                <div
                  className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    task.isCompleted ? "bg-emerald-500" : "bg-pink-50"
                  }`}
                >
                  <MaterialSymbol
                    name={task.isCompleted ? "check_circle" : task.icon}
                    size={24}
                    filled
                    className={task.isCompleted ? "text-white" : "text-pink-600"}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-bold text-slate-900 truncate">{task.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{task.description}</p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          task.isCompleted ? "bg-emerald-500" : "bg-pink-500"
                        }`}
                        style={{
                          width: `${Math.min(100, (task.progressCount / task.targetCount) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 shrink-0">
                      {task.progressCount}/{task.targetCount}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50">
                    <MaterialSymbol name="diamond" size={14} className="text-amber-500" />
                    <span className="text-xs font-black text-amber-600">+{task.rewardCoins}</span>
                  </div>
                  {!task.isCompleted && (
                    <MaterialSymbol name="chevron_right" size={20} className="text-slate-300" />
                  )}
                </div>
              </button>
            ))}

            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MaterialSymbol name="task_alt" size={48} className="text-slate-300 mb-3" />
                <p className="text-slate-400 text-sm font-medium">
                  {t("No tasks available right now") || "No tasks available right now"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
