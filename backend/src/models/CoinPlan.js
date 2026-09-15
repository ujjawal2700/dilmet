/**
 * Coin Plan Model - Coin Purchase Plans
 * @owner: Sujal (Wallet Domain)
 * @purpose: Define coin purchase plans with pricing and bonuses
 */

import mongoose from 'mongoose';

const coinPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    tier: {
      type: String,
      enum: ['basic', 'silver', 'gold', 'platinum'],
      required: true,
      index: true,
    },
    priceInINR: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    baseCoins: {
      type: Number,
      required: [true, 'Base coins are required'],
      min: [0, 'Base coins cannot be negative'],
    },
    bonusCoins: {
      type: Number,
      default: 0,
      min: [0, 'Bonus coins cannot be negative'],
    },
    totalCoins: {
      type: Number,
      required: true,
      min: [0, 'Total coins cannot be negative'],
    },
    bonusPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Bonus percentage cannot be negative'],
      max: [100, 'Bonus percentage cannot exceed 100'],
    },
    badge: {
      type: String,
      enum: ['POPULAR', 'BEST_VALUE', null],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    description: String,
  },
  {
    timestamps: true,
  }
);

// Calculate total coins before saving
coinPlanSchema.pre('save', function (next) {
  if (this.isModified('baseCoins') || this.isModified('bonusCoins')) {
    this.totalCoins = this.baseCoins + this.bonusCoins;
  }
  if (this.isModified('baseCoins') && this.baseCoins > 0) {
    this.bonusPercentage = (this.bonusCoins / this.baseCoins) * 100;
  }
  next();
});

// Indexes
coinPlanSchema.index({ isActive: 1, displayOrder: 1 });
coinPlanSchema.index({ tier: 1, isActive: 1 });

const CoinPlan = mongoose.model('CoinPlan', coinPlanSchema);

export default CoinPlan;

