/**
 * Razorpay Payment Gateway Configuration
 * @owner: Sujal
 * @purpose: Initialize and configure Razorpay for payment processing
 */

import Razorpay from 'razorpay';
import logger from '../utils/logger.js';

let razorpayInstance = null;

/**
 * Initialize Razorpay instance
 * @returns {Razorpay}
 */
export const initializeRazorpay = () => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not found in environment variables');
    }

    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    logger.info('✅ Razorpay initialized successfully');
    return razorpayInstance;
  } catch (error) {
    logger.error('❌ Razorpay initialization failed:', error);
    throw error;
  }
};

/**
 * Get Razorpay instance
 * @returns {Razorpay}
 */
export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    return initializeRazorpay();
  }
  return razorpayInstance;
};

export default getRazorpayInstance;

