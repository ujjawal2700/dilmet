/**
 * Gift Model - Gift Catalog
 * @owner: Sujal (Shared - Harsh uses for chat, Sujal manages catalog)
 * @purpose: Define available gifts that can be sent in chats
 */

import mongoose from 'mongoose';

const giftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Gift name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['romantic', 'funny', 'celebration', 'appreciation', 'special'],
      required: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Gift image is required'],
    },
    cost: {
      type: Number,
      required: [true, 'Gift cost is required'],
      min: [0, 'Gift cost cannot be negative'],
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
giftSchema.index({ isActive: 1, displayOrder: 1 });
giftSchema.index({ category: 1, isActive: 1 });

const Gift = mongoose.model('Gift', giftSchema);

export default Gift;

