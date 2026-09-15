/**
 * Payment Routes - Razorpay Payment API Endpoints
 * @owner: Sujal (Wallet Domain)
 * @purpose: Define routes for coin purchase payment flow
 */

import express from 'express';
import * as paymentController from '../../controllers/payment/paymentController.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

// Webhook endpoint (no auth - called by Razorpay servers)
router.post('/webhook', paymentController.handleWebhook);

// ========================
// PROTECTED ROUTES (require authentication)
// ========================
router.use(protect);

// Create order for coin purchase (Male users primarily)
router.post('/create-order', paymentController.createOrder);

// Verify payment after Razorpay checkout
router.post('/verify', paymentController.verifyPayment);

// Get purchase history
router.get('/history', paymentController.getPaymentHistory);

export default router;
