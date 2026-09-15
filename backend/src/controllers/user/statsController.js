/**
 * Stats Controller - Aggregate user statistics
 */

import mongoose from 'mongoose';
import Chat from '../../models/Chat.js';
import Message from '../../models/Message.js';
import Transaction from '../../models/Transaction.js';
import User from '../../models/User.js';
import autoMessageService from '../../services/user/autoMessageService.js';

/**
 * Get current user statistics
 */
export const getMeStats = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Trigger auto-messages for male users (non-blocking)
        if (req.user.role === 'male') {
            autoMessageService.processAutoMessagesForMale(userId).catch(err => {
                // Log error but don't block the response
                console.error('Auto-message processing error:', err);
            });
        }

        // 1. Matches (Count of unique chats)
        const matches = await Chat.countDocuments({
            'participants.userId': userId,
            isActive: true
        });

        // 2. Messages Sent
        const sent = await Message.countDocuments({
            senderId: userId
        });

        // 3. Profile Views (Mock for now as no tracking implemented)
        // In a real app, this would query a ProfileViews collection or a counter in User model
        const views = 0;

        // 4. Coins Spent (Sum of debit transactions)
        const coinSpentData = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    direction: 'debit'
                }
            },
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: '$amountCoins' }
                }
            }
        ]);

        const coinsSpent = coinSpentData.length > 0 ? coinSpentData[0].totalSpent : 0;

        res.status(200).json({
            status: 'success',
            data: {
                stats: {
                    matches,
                    sent,
                    views,
                    coinsSpent
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
