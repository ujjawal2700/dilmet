import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from './MaterialSymbol';

interface InsufficientBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    requiredCoins?: number;
}

export const InsufficientBalanceModal = ({ isOpen, onClose, requiredCoins }: InsufficientBalanceModalProps) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleBuyCoins = () => {
        onClose();
        navigate('/male/buy-coins');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white dark:bg-[#2d1a24] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="relative p-8">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <MaterialSymbol name="close" size={24} />
                    </button>

                    {/* Warning Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center text-pink-600 dark:text-pink-400 ring-8 ring-pink-50 dark:ring-pink-900/10">
                            <MaterialSymbol name="monetization_on" size={48} className="animate-pulse" />
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="text-center space-y-3 mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Insufficient Coins
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 px-2">
                            {requiredCoins
                                ? `You need ${requiredCoins} coins to perform this action. Your current balance is too low.`
                                : "Your balance is too low to perform this action. Please top up your wallet to continue."}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleBuyCoins}
                            className="w-full h-14 bg-gradient-to-r from-primary to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                        >
                            <MaterialSymbol name="add_shopping_cart" size={24} className="group-hover:translate-x-1 transition-transform" />
                            Buy Coins
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full h-12 text-gray-500 dark:text-gray-400 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
