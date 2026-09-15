/**
 * Scheduled Jobs for Wallet Operations
 * @owner: Sujal (Wallet Domain)
 * @purpose: Handle automated tasks like withdrawal expiry
 */

import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import logger from '../utils/logger.js';

/**
 * Process expired pending withdrawals
 * Withdrawals pending for more than 48 hours are auto-cancelled
 * and coins are returned to the user's balance
 */
export const processExpiredWithdrawals = async () => {
    try {
        const expiryHours = 48;
        const expiryTime = new Date(Date.now() - expiryHours * 60 * 60 * 1000);

        // Find pending withdrawals older than 48 hours
        const expiredWithdrawals = await Withdrawal.find({
            status: 'pending',
            createdAt: { $lt: expiryTime }
        });

        if (expiredWithdrawals.length === 0) {
            logger.debug('🕐 No expired withdrawals found');
            return { processed: 0 };
        }

        logger.info(`🕐 Found ${expiredWithdrawals.length} expired withdrawal(s) to process`);

        let processed = 0;
        let errors = 0;

        for (const withdrawal of expiredWithdrawals) {
            try {
                // Get user and refund coins
                const user = await User.findById(withdrawal.userId);
                if (!user) {
                    logger.warn(`⚠️ User not found for withdrawal ${withdrawal._id}`);
                    continue;
                }

                const previousBalance = user.coinBalance;
                const newBalance = previousBalance + withdrawal.coinsRequested;

                // Update user balance
                user.coinBalance = newBalance;
                await user.save();

                // Create refund transaction
                await Transaction.create({
                    userId: withdrawal.userId,
                    type: 'bonus', // Using bonus type for refunds
                    direction: 'credit',
                    amountCoins: withdrawal.coinsRequested,
                    status: 'completed',
                    balanceBefore: previousBalance,
                    balanceAfter: newBalance,
                    description: `Withdrawal request expired (48h). Coins refunded.`,
                    relatedWithdrawalId: withdrawal._id,
                });

                // Update withdrawal status
                withdrawal.status = 'cancelled';
                withdrawal.rejectionReason = 'Request expired after 48 hours without admin action. Coins have been refunded to your account.';
                await withdrawal.save();

                processed++;
                logger.info(`✅ Processed expired withdrawal ${withdrawal._id} - Refunded ${withdrawal.coinsRequested} coins to user ${withdrawal.userId}`);

            } catch (err) {
                errors++;
                logger.error(`❌ Error processing expired withdrawal ${withdrawal._id}: ${err.message}`);
            }
        }

        logger.info(`🕐 Expired withdrawals processing complete: ${processed} processed, ${errors} errors`);
        return { processed, errors };

    } catch (error) {
        logger.error(`❌ Error in processExpiredWithdrawals: ${error.message}`);
        throw error;
    }
};

/**
 * Start the scheduler for periodic tasks
 * Runs every hour to check for expired withdrawals
 */
export const startScheduler = () => {
    // Run every hour
    const interval = 60 * 60 * 1000; // 1 hour in milliseconds

    // Run immediately on startup
    setTimeout(() => {
        processExpiredWithdrawals().catch(err => {
            logger.error(`Scheduler error: ${err.message}`);
        });
    }, 5000); // Run 5 seconds after server start

    // Then run every hour
    setInterval(() => {
        processExpiredWithdrawals().catch(err => {
            logger.error(`Scheduler error: ${err.message}`);
        });
    }, interval);

    logger.info('📅 Wallet scheduler started - checking for expired withdrawals every hour');
};

export default {
    processExpiredWithdrawals,
    startScheduler,
};
