import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface HiSentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGoToChat: () => void;
    recipientName: string;
}

export const HiSentModal = ({
    isOpen,
    onClose,
    onGoToChat,
    recipientName,
}: HiSentModalProps) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white dark:bg-[#342d18] rounded-2xl shadow-2xl max-w-sm w-full p-6 pointer-events-auto transform transition-all animate-bounce-in">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
                            <MaterialSymbol name="check_circle" size={48} className="text-green-600 dark:text-green-400 relative z-10" filled />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                        {t('hiSentTitle')}
                    </h2>

                    {/* Message */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6">
                        {t('hiSentMessage', { name: recipientName })}
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onGoToChat}
                            className="w-full px-4 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors shadow-lg flex items-center justify-center gap-2"
                        >
                            <MaterialSymbol name="chat" size={20} />
                            {t('goToChat')}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-3 bg-gray-200 dark:bg-[#4a212f] text-gray-700 dark:text-white font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-[#5e2a3c] transition-colors"
                        >
                            {t('close')}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
        </>
    );
};
