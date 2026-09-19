/**
 * AI Reply Scheduler
 * @purpose: Poll the AiReplyJob queue and send delayed AI companion replies
 */

import aiCompanionService from '../services/ai/aiCompanionService.js';
import AiReplyJob from '../models/AiReplyJob.js';
import logger from '../utils/logger.js';

const POLL_INTERVAL_MS = 1500;

let running = false;

export const tick = async () => {
    if (running) return;
    running = true;
    try {
        // Keep draining while there are due jobs, in batches
        let processed;
        do {
            processed = await aiCompanionService.processDueReplies(5);
        } while (processed === 5);
    } catch (error) {
        logger.error(`AI reply scheduler error: ${error.message}`);
    } finally {
        running = false;
    }
};

export const startAiReplyScheduler = (io) => {
    aiCompanionService.setIO(io);

    // Fast-forward any legacy pending jobs that were scheduled minutes in the future
    AiReplyJob.updateMany(
        { status: 'pending', runAt: { $gt: new Date(Date.now() + 5 * 1000) } },
        { $set: { runAt: new Date() } }
    ).catch(() => {});

    setInterval(tick, POLL_INTERVAL_MS);
    logger.info('🤖 AI reply scheduler started - polling every 1.5 seconds');
};

export default { startAiReplyScheduler, tick };
