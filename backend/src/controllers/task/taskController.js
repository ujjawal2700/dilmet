/**
 * Task Controller - Daily Tasks for male users
 */

import taskService from '../../services/task/taskService.js';

/**
 * GET /api/tasks - Current user's tasks + today's progress
 */
export const getMyTasks = async (req, res, next) => {
    try {
        const tasks = await taskService.getTasksForUser(req.user.id);
        res.status(200).json({
            status: 'success',
            data: { tasks },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/tasks/checkin - Daily check-in (idempotent, safe to call once per app load)
 */
export const checkin = async (req, res, next) => {
    try {
        const io = req.app.get('io');
        const tasks = await taskService.checkin(req.user.id, io);
        res.status(200).json({
            status: 'success',
            data: { tasks },
        });
    } catch (error) {
        next(error);
    }
};
