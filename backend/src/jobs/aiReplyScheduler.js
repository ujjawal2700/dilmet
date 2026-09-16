/**
 * AI Reply Scheduler
 * @purpose: Poll the AiReplyJob queue and send delayed AI companion replies
 */

import aiCompanionService from '../services/ai/aiCompanionService.js';
import logger from '../utils/logger.js';

const POLL_INTERVAL_MS = 15 * 1000;

let running = false;

const tick = async () => {
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
    setInterval(tick, POLL_INTERVAL_MS);
    logger.info('🤖 AI reply scheduler started - polling every 15 seconds');
};

export default { startAiReplyScheduler };
