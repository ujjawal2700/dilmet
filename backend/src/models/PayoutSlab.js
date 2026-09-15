/**
 * Payout Slab Model - Earnings Payout Configuration
 * @owner: Sujal (Wallet Domain)
 * @purpose: Define payout percentages based on coin earnings ranges
 */

import mongoose from 'mongoose';

const payoutSlabSchema = new mongoose.Schema(
  {
    minCoins: {
      type: Number,
      required: [true, 'Minimum coins is required'],
      min: [0, 'Minimum coins cannot be negative'],
    },
    maxCoins: {
      type: Number,
      default: null, // null means unlimited
      validate: {
        validator: function (value) {
          return value === null || value > this.minCoins;
        },
        message: 'Maximum coins must be greater than minimum coins',
      },
    },
    payoutPercentage: {
      type: Number,
      required: [true, 'Payout percentage is required'],
      min: [0, 'Payout percentage cannot be negative'],
      max: [100, 'Payout percentage cannot exceed 100'],
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
payoutSlabSchema.index({ minCoins: 1, maxCoins: 1 });
payoutSlabSchema.index({ isActive: 1, displayOrder: 1 });

// Static method: Find applicable slab for coin amount
payoutSlabSchema.statics.findApplicableSlab = function (coinAmount) {
  return this.findOne({
    isActive: true,
    minCoins: { $lte: coinAmount },
    $or: [{ maxCoins: { $gte: coinAmount } }, { maxCoins: null }],
  }).sort({ displayOrder: 1 });
};

const PayoutSlab = mongoose.model('PayoutSlab', payoutSlabSchema);

export default PayoutSlab;

