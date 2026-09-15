/**
 * Consistency Middleware
 * @owner: Sujal (Shared - Both review)
 * @purpose: Apply consistency checks to requests
 */

import dataConsistency from '../consistency/dataConsistency.js';
import logger from '../../utils/logger.js';

/**
 * Middleware to verify data consistency after operations
 */
export const verifyConsistency = async (req, res, next) => {
  // Store original send function
  const originalSend = res.send;

  // Override send to run consistency checks
  res.send = function (data) {
    // Run checks in background (non-blocking)
    if (req.user?.id) {
      dataConsistency.verifyUserConsistency(req.user.id)
        .then(result => {
          if (!result.valid) {
            logger.warn(`⚠️ Consistency issues detected for user ${req.user.id}`);
          }
        })
        .catch(err => {
          logger.error(`Error in consistency check: ${err.message}`);
        });
    }

    // Call original send
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Middleware to ensure ACID compliance
 */
export const ensureACID = (req, res, next) => {
  // Add transaction flag to request
  req.requireTransaction = true;
  next();
};

