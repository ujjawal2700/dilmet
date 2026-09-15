/**
 * Daily Task Routes
 */

import express from 'express';
import * as taskController from '../../controllers/task/taskController.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('male'));

// GET /api/tasks - list tasks with today's progress
router.get('/', taskController.getMyTasks);

// POST /api/tasks/checkin - daily check-in
router.post('/checkin', taskController.checkin);

export default router;
