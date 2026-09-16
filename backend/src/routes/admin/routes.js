/**
 * Admin Routes
 * @owner: Sujal
 */

import express from 'express';
import * as adminController from '../../controllers/admin/adminController.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import * as reportController from '../../controllers/user/reportController.js';
import * as faqController from '../../controllers/faq/faqController.js';
import * as aiCompanionController from '../../controllers/admin/aiCompanionController.js';

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard Stats
router.get('/dashboard/stats', adminController.getDashboardStats);

// Female Approval Routes
router.get('/females/pending', adminController.getPendingFemales);
router.patch('/females/:id/approve', adminController.approveFemale);
router.patch('/females/:id/reject', adminController.rejectFemale);
router.patch('/females/:id/request-resubmit', adminController.requestResubmitFemale);

// User Management
router.get('/users', adminController.listUsers);
router.patch('/users/:id/toggle-block', adminController.toggleBlockUser);
router.patch('/users/:id/toggle-verify', adminController.toggleVerifyUser);
router.delete('/users/:id', adminController.deleteUser);

// AI Companions
router.get('/ai-companions', aiCompanionController.listAiCompanions);
router.post('/ai-companions', aiCompanionController.createAiCompanion);
router.get('/ai-companions/:id', aiCompanionController.getAiCompanion);
router.patch('/ai-companions/:id', aiCompanionController.updateAiCompanion);
router.delete('/ai-companions/:id', aiCompanionController.deleteAiCompanion);

// Transaction Management
router.get('/transactions', adminController.listTransactions);

// Referral (Refer & Earn) Management
router.get('/referrals', adminController.listReferrals);

// Support Ticket Management
router.get('/support-tickets', adminController.listSupportTickets);
router.get('/support-tickets/user/:userId', adminController.listSupportTicketsForUser);
router.get('/support-tickets/:id', adminController.getSupportTicket);
router.post('/support-tickets/:id/messages', adminController.sendSupportMessage);
router.patch('/support-tickets/:id/status', adminController.updateSupportTicketStatus);

// Platform Settings
router.get('/settings', adminController.getAppSettings);
router.patch('/settings', adminController.updateAppSettings);

// Gift Management
router.get('/gifts', adminController.listGifts);
router.post('/gifts', adminController.createGift);
router.patch('/gifts/:id/cost', adminController.updateGiftCost);
router.delete('/gifts/:id', adminController.deleteGift);

// Daily Task Management
router.get('/tasks', adminController.listTasks);
router.post('/tasks', adminController.createTask);
router.patch('/tasks/:id', adminController.updateTask);
router.delete('/tasks/:id', adminController.deleteTask);

// Report Management
router.get('/reports', reportController.getAllReports);
router.patch('/reports/:id', reportController.updateReportStatus);

// Deleted Accounts
router.get('/deleted-accounts', adminController.getDeletedAccounts);

// Admin Profile Management
router.get('/profile', adminController.getAdminProfile);
router.post('/profile/request-otp', adminController.requestAdminOtp);
router.patch('/profile/update-phone', adminController.updateAdminPhone);
router.patch('/profile/update-secret', adminController.updateAdminSecret);

// FAQs Management Routes
router.get('/faqs', faqController.listFaqsAdmin);
router.post('/faqs', faqController.createFaqAdmin);
router.put('/faqs/:id', faqController.updateFaqAdmin);
router.delete('/faqs/:id', faqController.deleteFaqAdmin);

export default router;
