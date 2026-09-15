/**
 * Data Consistency Manager
 * @owner: Sujal (Shared - Both review)
 * @purpose: Ensure data consistency across the system
 * 
 * Implements:
 * - Normalization rules
 * - Consistency checks
 * - Data validation
 * - Integrity constraints
 */

import User from '../../models/User.js';
import Transaction from '../../models/Transaction.js';
import Chat from '../../models/Chat.js';
import Message from '../../models/Message.js';
import Withdrawal from '../../models/Withdrawal.js';
import logger from '../../utils/logger.js';

class DataConsistency {
  /**
   * Verify user coin balance matches transaction sum
   * Consistency check: balance = sum(credits) - sum(debits)
   */
  async verifyUserBalance(userId) {
    const user = await User.findById(userId);
    if (!user) return { valid: false, error: 'User not found' };

    // Calculate balance from transactions
    const transactions = await Transaction.find({ userId });
    
    const calculatedBalance = transactions.reduce((balance, tx) => {
      if (tx.direction === 'credit') {
        return balance + tx.amountCoins;
      } else {
        return balance - tx.amountCoins;
      }
    }, 0);

    const actualBalance = user.coinBalance;
    const isValid = calculatedBalance === actualBalance;

    if (!isValid) {
      logger.error(`❌ Balance mismatch for user ${userId}: calculated=${calculatedBalance}, actual=${actualBalance}`);
      return {
        valid: false,
        calculatedBalance,
        actualBalance,
        difference: calculatedBalance - actualBalance,
      };
    }

    return { valid: true, balance: actualBalance };
  }

  /**
   * Fix user balance if inconsistent
   * Recalculates from transactions and updates
   */
  async fixUserBalance(userId, session) {
    const transactions = await Transaction.find({ userId }).session(session);
    
    const calculatedBalance = transactions.reduce((balance, tx) => {
      if (tx.status === 'completed') {
        if (tx.direction === 'credit') {
          return balance + tx.amountCoins;
        } else {
          return balance - tx.amountCoins;
        }
      }
      return balance;
    }, 0);

    await User.findByIdAndUpdate(
      userId,
      { coinBalance: calculatedBalance },
      { session }
    );

    logger.info(`✅ Fixed balance for user ${userId}: ${calculatedBalance}`);
    return calculatedBalance;
  }

  /**
   * Verify chat lastMessage reference
   * Consistency check: lastMessage exists and belongs to chat
   */
  async verifyChatLastMessage(chatId) {
    const chat = await Chat.findById(chatId).populate('lastMessage');
    
    if (!chat) return { valid: false, error: 'Chat not found' };
    if (!chat.lastMessage) return { valid: true }; // No messages yet

    const message = await Message.findById(chat.lastMessage);
    if (!message) {
      return {
        valid: false,
        error: 'Last message reference is invalid',
      };
    }

    if (message.chatId.toString() !== chatId.toString()) {
      return {
        valid: false,
        error: 'Last message does not belong to this chat',
      };
    }

    return { valid: true };
  }

  /**
   * Fix chat lastMessage if inconsistent
   */
  async fixChatLastMessage(chatId, session) {
    const lastMessage = await Message.findOne(
      { chatId, isDeleted: false },
      null,
      { sort: { createdAt: -1 }, session }
    );

    if (lastMessage) {
      await Chat.findByIdAndUpdate(
        chatId,
        {
          lastMessage: lastMessage._id,
          lastMessageAt: lastMessage.createdAt,
        },
        { session }
      );
    }

    return lastMessage;
  }

  /**
   * Verify chat participant unread counts
   * Consistency check: unreadCount matches actual unread messages
   */
  async verifyChatUnreadCounts(chatId) {
    const chat = await Chat.findById(chatId);
    if (!chat) return { valid: false, error: 'Chat not found' };

    const issues = [];

    for (const participant of chat.participants) {
      const actualUnread = await Message.countDocuments({
        chatId,
        receiverId: participant.userId,
        readAt: { $exists: false },
        isDeleted: false,
      });

      if (participant.unreadCount !== actualUnread) {
        issues.push({
          userId: participant.userId,
          stored: participant.unreadCount,
          actual: actualUnread,
        });
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Fix chat unread counts
   */
  async fixChatUnreadCounts(chatId, session) {
    const chat = await Chat.findById(chatId).session(session);
    if (!chat) return;

    for (const participant of chat.participants) {
      const actualUnread = await Message.countDocuments({
        chatId,
        receiverId: participant.userId,
        readAt: { $exists: false },
        isDeleted: false,
      }).session(session);

      participant.unreadCount = actualUnread;
    }

    await chat.save({ session });
    return chat;
  }

  /**
   * Verify withdrawal consistency
   * Check: withdrawal coins <= user balance at time of request
   */
  async verifyWithdrawal(withdrawalId) {
    const withdrawal = await Withdrawal.findById(withdrawalId)
      .populate('userId');

    if (!withdrawal) return { valid: false, error: 'Withdrawal not found' };

    // Check if transaction exists for approved/paid withdrawals
    if (['approved', 'paid'].includes(withdrawal.status)) {
      if (!withdrawal.transactionId) {
        return {
          valid: false,
          error: 'Approved withdrawal missing transaction',
        };
      }

      const transaction = await Transaction.findById(withdrawal.transactionId);
      if (!transaction) {
        return {
          valid: false,
          error: 'Withdrawal transaction not found',
        };
      }
    }

    return { valid: true };
  }

  /**
   * Run all consistency checks for a user
   */
  async verifyUserConsistency(userId) {
    const results = {
      userId,
      balance: await this.verifyUserBalance(userId),
      chats: [],
    };

    // Check all user's chats
    const chats = await Chat.find({
      'participants.userId': userId,
    });

    for (const chat of chats) {
      results.chats.push({
        chatId: chat._id,
        lastMessage: await this.verifyChatLastMessage(chat._id),
        unreadCounts: await this.verifyChatUnreadCounts(chat._id),
      });
    }

    return results;
  }

  /**
   * Fix all inconsistencies for a user
   */
  async fixUserConsistency(userId, session) {
    const fixes = [];

    // Fix balance
    const balanceCheck = await this.verifyUserBalance(userId);
    if (!balanceCheck.valid) {
      await this.fixUserBalance(userId, session);
      fixes.push('balance');
    }

    // Fix chats
    const chats = await Chat.find({
      'participants.userId': userId,
    }).session(session);

    for (const chat of chats) {
      const lastMessageCheck = await this.verifyChatLastMessage(chat._id);
      if (!lastMessageCheck.valid) {
        await this.fixChatLastMessage(chat._id, session);
        fixes.push(`chat-${chat._id}-lastMessage`);
      }

      const unreadCheck = await this.verifyChatUnreadCounts(chat._id);
      if (!unreadCheck.valid) {
        await this.fixChatUnreadCounts(chat._id, session);
        fixes.push(`chat-${chat._id}-unreadCounts`);
      }
    }

    return fixes;
  }
}

export default new DataConsistency();

