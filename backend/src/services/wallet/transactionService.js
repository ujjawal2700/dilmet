/**
 * Transaction Service - Coin Transaction Management
 * @owner: Sujal (Wallet Domain)
 * @purpose: Handle all coin transactions (purchases, spending, earnings)
 * 
 * NOTE: This service is used by Harsh's chat service for coin deduction/addition
 */

import Transaction from '../../models/Transaction.js';
import User from '../../models/User.js';
import logger from '../../utils/logger.js';
import { InternalServerError, BadRequestError } from '../../utils/errors.js';
import transactionManager from '../../core/transactions/transactionManager.js';
import relationshipManager from '../../core/relationships/relationshipManager.js';
import dataValidation from '../../core/validation/dataValidation.js';

/**
 * Create a transaction and update user balance
 * ACID Compliant - Uses transaction manager
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Transaction>}
 */
export const createTransaction = async (transactionData) => {
  // Use relationship manager for atomic balance update
  return await transactionManager.executeTransaction([
    async (session) => {
      return await relationshipManager.updateUserBalanceWithTransaction(
        transactionData.userId,
        transactionData,
        session
      );
    },
  ]).then(result => result.transaction);
};

/**
 * Deduct coins for message (called by Harsh's chat service)
 * ACID Compliant with validation
 * @param {string} userId - Male user ID
 * @param {string} relatedMessageId - Message ID
 * @param {number} coins - Coins to deduct (default: 50)
 * @returns {Promise<Transaction>}
 */
export const deductForMessage = async (userId, relatedMessageId, coins = 50) => {
  // Validate before transaction
  await dataValidation.validateMessageSend(userId, coins);

  return createTransaction({
    userId,
    type: 'message_spent',
    direction: 'debit',
    amountCoins: coins,
    relatedMessageId,
    status: 'completed',
    description: `Spent ${coins} coins for message`,
  });
};

/**
 * Credit coins for message received (called by Harsh's chat service)
 * @param {string} userId - Female user ID
 * @param {string} relatedMessageId - Message ID
 * @param {number} coins - Coins to credit (default: 50)
 * @returns {Promise<Transaction>}
 */
export const creditForMessage = async (userId, relatedMessageId, coins = 50) => {
  return createTransaction({
    userId,
    type: 'message_earned',
    direction: 'credit',
    amountCoins: coins,
    relatedMessageId,
    description: `Earned ${coins} coins from message`,
  });
};

/**
 * Deduct coins for video call (called by Harsh's chat service)
 * ACID Compliant with validation
 * @param {string} userId - Male user ID
 * @param {string} relatedMessageId - Message ID (video call message)
 * @param {number} coins - Coins to deduct (default: 500)
 * @returns {Promise<Transaction>}
 */
export const deductForVideoCall = async (userId, relatedMessageId, coins = 500) => {
  // Validate before transaction
  await dataValidation.validateVideoCall(userId, coins);

  return createTransaction({
    userId,
    type: 'video_call_spent',
    direction: 'debit',
    amountCoins: coins,
    relatedMessageId,
    status: 'completed',
    description: `Spent ${coins} coins for video call`,
  });
};

/**
 * Credit coins for video call (called by Harsh's chat service)
 * @param {string} userId - Female user ID
 * @param {string} relatedMessageId - Message ID (video call message)
 * @param {number} coins - Coins to credit (default: 500)
 * @returns {Promise<Transaction>}
 */
export const creditForVideoCall = async (userId, relatedMessageId, coins = 500) => {
  return createTransaction({
    userId,
    type: 'video_call_earned',
    direction: 'credit',
    amountCoins: coins,
    relatedMessageId,
    description: `Earned ${coins} coins from video call`,
  });
};

/**
 * Deduct coins for gift (called by Harsh's chat service)
 * @param {string} userId - Male user ID
 * @param {string} relatedMessageId - Message ID (gift message)
 * @param {number} coins - Gift cost
 * @returns {Promise<Transaction>}
 */
export const deductForGift = async (userId, relatedMessageId, coins) => {
  return createTransaction({
    userId,
    type: 'gift_sent',
    direction: 'debit',
    amountCoins: coins,
    relatedMessageId,
    description: `Spent ${coins} coins for gift`,
  });
};

/**
 * Credit coins for gift received (called by Harsh's chat service)
 * @param {string} userId - Female user ID
 * @param {string} relatedMessageId - Message ID (gift message)
 * @param {number} coins - Gift value
 * @returns {Promise<Transaction>}
 */
export const creditForGift = async (userId, relatedMessageId, coins) => {
  return createTransaction({
    userId,
    type: 'gift_received',
    direction: 'credit',
    amountCoins: coins,
    relatedMessageId,
    description: `Earned ${coins} coins from gift`,
  });
};

/**
 * Get user transactions
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Transaction[]>}
 */
export const getUserTransactions = async (userId, filters = {}) => {
  const { type, direction, limit = 50, skip = 0 } = filters;

  const query = { userId };

  if (type) query.type = type;
  if (direction) query.direction = direction;

  return Transaction.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('relatedUserId', 'profile.name profile.photos')
    .populate('relatedChatId')
    .populate('coinPlanId');
};

export default {
  createTransaction,
  deductForMessage,
  creditForMessage,
  deductForVideoCall,
  creditForVideoCall,
  deductForGift,
  creditForGift,
  getUserTransactions,
};

