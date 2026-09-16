/**
 * Support Ticket Routes - User-facing (male + female)
 */

import express from 'express';
import * as supportController from '../../controllers/support/supportController.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('male', 'female'));

// GET /api/support - list my tickets
router.get('/', supportController.listMyTickets);

// POST /api/support - create a new ticket
router.post('/', supportController.createTicket);

// GET /api/support/:id - get a ticket + its messages
router.get('/:id', supportController.getTicket);

// POST /api/support/:id/messages - send a message on a ticket
router.post('/:id/messages', supportController.sendMessage);

export default router;
