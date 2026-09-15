import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MaterialSymbol } from './MaterialSymbol';
import { useTranslation } from '../../core/hooks/useTranslation';
import { useGlobalState } from '../../core/context/GlobalStateContext';

export interface CompletedTaskInfo {
    taskKey: string;
    title: string;
    icon: string;
    rewardCoins: number;
    newBalance: number;
}

export const TaskCompletedModal = () => {
    const { t } = useTranslation();
    const { completedTask: task, clearCompletedTask: onClose } = useGlobalState();
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (task) {
            setShowConfetti(true);
            const timer = setTimeout(() => onClose(), 4500);
            return () => clearTimeout(timer);
        }
    }, [task, onClose]);

    if (!task) return null;

    const content = (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(40)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-task-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10%',
                                animationDelay: `${Math.random() * 1.5}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                            }}
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: ['#f59e0b', '#22c55e', '#8b5cf6', '#ec4899', '#3b82f6'][i % 5],
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            <div className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-[#0f2a24] dark:via-[#1a1a1a] dark:to-[#0f2a24] rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-emerald-200 dark:border-emerald-900/30 animate-in zoom-in slide-in-from-bottom-4 duration-500">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <MaterialSymbol name="close" size={24} />
                </button>

                <div className="flex justify-center mb-6 animate-in zoom-in duration-700 delay-100">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-xl opacity-50 animate-pulse" />
                        <div className="relative bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full p-6 shadow-lg">
                            <MaterialSymbol name={task.icon || 'task_alt'} className="text-white" size={56} filled />
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-black text-center mb-1 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent animate-in slide-in-from-bottom-2 duration-500 delay-200">
                    {t('taskCompletedTitle') || 'Task Completed!'}
                </h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6 font-medium animate-in fade-in duration-500 delay-300">
                    {task.title}
                </p>

                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-2xl p-6 mb-6 border-2 border-yellow-300 dark:border-yellow-700/50 animate-in zoom-in duration-500 delay-400">
                    <div className="flex items-center justify-center gap-3">
                        <MaterialSymbol name="diamond" className="text-yellow-600 dark:text-yellow-400 animate-bounce" size={36} />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('youEarned') || 'You earned'}</p>
                            <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">
                                +{task.rewardCoins} <span className="text-xl">{t('coins') || 'coins'}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6 animate-in slide-in-from-bottom-2 duration-500 delay-500">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{t('newBalanceLabel') || 'New Balance'}</span>
                        <div className="flex items-center gap-2">
                            <MaterialSymbol name="account_balance_wallet" className="text-emerald-600 dark:text-emerald-400" size={20} />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">{task.newBalance} {t('coins') || 'coins'}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 animate-in fade-in duration-500 delay-600"
                >
                    {t('awesomeThanks') || 'Awesome, Thanks!'}
                </button>
            </div>

            <style>{`
                @keyframes task-confetti {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
                .animate-task-confetti { animation: task-confetti linear forwards; }
            `}</style>
        </div>
    );

    return createPortal(content, document.body);
};

export default TaskCompletedModal;
