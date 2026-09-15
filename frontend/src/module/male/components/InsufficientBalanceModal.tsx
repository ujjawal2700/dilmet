import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface InsufficientBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBuyCoins: () => void;
    requiredCoins: number;
    currentBalance: number;
    action?: 'send a message' | 'send a Hi' | 'send a gift' | string;
}

export const InsufficientBalanceModal = ({
    isOpen,
    onClose,
    onBuyCoins,
    requiredCoins,
    currentBalance,
    action = 'perform this action',
}: InsufficientBalanceModalProps) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const shortfall = requiredCoins - currentBalance;

    // Map action string to translation key
    const getActionTranslation = (act: string) => {
        switch (act) {
            case 'send a message': return t('actionSendMessage');
            case 'send a Hi': return t('actionSendHi');
            case 'send a gift': return t('actionSendGift');
            case 'perform this action': return t('actionPerform');
            default: return act;
        }
    };

    const translatedAction = getActionTranslation(action);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white dark:bg-[#342d18] rounded-2xl shadow-2xl max-w-sm w-full p-6 pointer-events-auto transform transition-all">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <MaterialSymbol name="account_balance_wallet" size={32} className="text-red-600 dark:text-red-400" />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                        {t('insufficientBalanceTitle')}
                    </h2>

                    {/* Message */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-4">
                        {t('requiredCoinsToPerform', { count: requiredCoins, action: translatedAction })}
                    </p>

                    {/* Shortfall Info */}
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{t('currentBalanceLabel')}</span>
                            <div className="flex items-center gap-1">
                                <span className="text-lg font-bold text-red-600 dark:text-red-400">{currentBalance}</span>
                                <MaterialSymbol name="monetization_on" filled size={18} className="text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-red-100 dark:border-red-800/50">
                            <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                {t('shortfallText', { count: shortfall })}
                            </span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-[#4a212f] text-gray-700 dark:text-white font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-[#5e2a3c] transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={onBuyCoins}
                            className="flex-1 px-4 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors shadow-lg flex items-center justify-center gap-2"
                        >
                            <MaterialSymbol name="shopping_cart" size={20} />
                            {t('buyCoins')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
