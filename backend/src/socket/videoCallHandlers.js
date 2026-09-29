/**
 * Video Call Socket Handlers - WebRTC Signaling & Call Events
 * @owner: Video Call Feature
 * @purpose: Handle real-time video call signaling via Socket.IO
 * 
 * NOTE: This is a NEW handler that integrates with existing socket setup.
 * Does NOT modify existing chat handlers.
 * 
 * UPDATED: Uses Socket.IO rooms (user joins room with their userId) instead of
 * maintaining a separate socket mapping. This is more reliable.
 */

import videoCallService from '../services/videoCall/videoCallService.js';
import agoraService from '../services/agora/agoraService.js';
import logger from '../utils/logger.js';
import User from '../models/User.js';

// In-memory store for active calls and timers
const activeCallTimers = new Map(); // callId -> { timer, startTime, ... }
const processingCalls = new Set(); // To prevent concurrent processing of same callId
const connectedCallUsers = new Map(); // callId -> Set<userId>; billing starts after both join Agora

/**
 * Helper: Safely clear and set a timer for a call
 */
const setCallTimer = (callId, type, durationMs, callback) => {
    // 1. Clear ANY existing timer for this call ID (duration or interruption)
    const existing = activeCallTimers.get(callId);
    if (existing) {
        clearTimeout(existing.timer);
        activeCallTimers.delete(callId);
    }
    const interKey = `${callId}_interruption`;
    const existingInter = activeCallTimers.get(interKey);
    if (existingInter) {
        clearTimeout(existingInter.timer);
        activeCallTimers.delete(interKey);
    }

    // 2. Set new timer
    const timer = setTimeout(callback, durationMs);

    // 3. Store reference
    activeCallTimers.set(type === 'interruption' ? interKey : callId, {
        timer,
        type,
        startTime: Date.now(),
        durationMs
    });

    return timer;
};

/**
 * Setup video call handlers for a socket connection
 * @param {Socket} socket - Socket.IO socket instance
 * @param {Server} io - Socket.IO server instance
 * @param {string} userId - Authenticated user ID
 */
export const setupVideoCallHandlers = (socket, io, userId) => {
    // 🏷️ IMPORTANT: Join user-specific room for targeted notifications
    socket.join(userId);
    logger.debug(`👤 Socket ${socket.id} joined user room ${userId}`);

    // Helper: Validate call belongs to this user
    const validateCallOwnership = async (callId) => {
        const call = await videoCallService.getCall(callId);
        if (!call) {
            logger.warn(`Call not found: ${callId}`);
            return null;
        }
        const callerId = call.callerId._id ? call.callerId._id.toString() : call.callerId.toString();
        const receiverId = call.receiverId._id ? call.receiverId._id.toString() : call.receiverId.toString();

        const isParticipant = callerId === userId || receiverId === userId;
        if (!isParticipant) {
            logger.warn(`User ${userId} is not a participant of call ${callId}`);
            return null;
        }
        socket.join(callId);
        return call;
    };

    // ====================
    // CALL REQUEST (Male → Female)
    // ====================
    socket.on('call:request', async (data) => {
        try {
            const { receiverId, chatId } = data;
            const callType = data.callType === 'voice' ? 'voice' : 'video';
            logger.info(`📞 Call request (${callType}) from ${userId} to ${receiverId}`);

            // Initiate call (validates and locks coins)
            const videoCall = await videoCallService.initiateCall(userId, receiverId, callType);

            // Join the call room
            const callId = videoCall._id.toString();
            socket.join(callId);

            // Notify caller of success
            socket.emit('call:outgoing', {
                callId: videoCall._id.toString(),
                receiverId,
                status: 'ringing',
                callType,
                coinAmount: videoCall.coinAmount,
                duration: videoCall.callDurationSeconds,
            });

            // Notify receiver of incoming call (using room named by receiverId)
            io.to(receiverId).emit('call:incoming', {
                callId: videoCall._id.toString(),
                callerId: userId,
                callerName: data.callerName || 'User',
                callerAvatar: data.callerAvatar || '',
                chatId: videoCall.chatId.toString(),
                callType,
                coinAmount: videoCall.coinAmount,
                duration: videoCall.callDurationSeconds,
            });

            logger.info(`📞 Sent call:incoming to room ${receiverId}`);

            // Start ringing timeout
            const callConfig = await videoCallService.getDynamicConfig(callType);
            const timeoutId = setTimeout(async () => {
                try {
                    await videoCallService.handleMissedCall(videoCall._id.toString());
                    connectedCallUsers.delete(videoCall._id.toString());

                    // Notify both users
                    socket.emit('call:missed', { callId: videoCall._id.toString() });
                    io.to(receiverId).emit('call:ended', {
                        callId: videoCall._id.toString(),
                        reason: 'missed',
                    });
                } catch (error) {
                    logger.error(`Missed call handling error: ${error.message}`);
                }
            }, (callConfig.connectionTimeoutSeconds || 20) * 1000);

            activeCallTimers.set(videoCall._id.toString(), {
                timer: timeoutId,
                type: 'ringing',
                receiverId: receiverId,
            });
        } catch (error) {
            logger.error(`Call request error: ${error.message}`);
            socket.emit('call:error', {
                message: error.message,
                refunded: error.message.includes('Insufficient') ? false : true,
            });
        }
    });

    // ====================
    // CALL ACCEPTED (Female)
    // ====================
    socket.on('call:accept', async (data) => {
        try {
            const { callId } = data;

            // CONCURRENCY GUARD: Prevent multiple accept processing
            if (processingCalls.has(`accept_${callId}`)) {
                logger.warn(`Ignoring duplicate accept request for ${callId}`);
                return;
            }
            processingCalls.add(`accept_${callId}`);

            logger.info(`📞 Call accepted: ${callId}`);

            const requestedCall = await validateCallOwnership(callId);
            if (!requestedCall) {
                socket.emit('call:error', { message: 'Call not found or you are not a participant' });
                return;
            }
            const receiverId = requestedCall.receiverId._id
                ? requestedCall.receiverId._id.toString()
                : requestedCall.receiverId.toString();
            if (receiverId !== userId) {
                socket.emit('call:error', { message: 'Only the receiver can accept this call' });
                return;
            }

            // Generate credentials before changing the call to accepted. If Agora
            // is misconfigured, the ringing timeout remains able to refund and
            // release both users instead of leaving an accepted call stuck forever.
            const channelName = callId;
            const callerObjectId = requestedCall.callerId._id
                ? requestedCall.callerId._id.toString()
                : requestedCall.callerId.toString();
            const callerIdHex = callerObjectId.slice(-8);
            const receiverIdHex = receiverId.slice(-8);

            // Convert hex to decimal for Agora UID (must be positive 32-bit integer)
            const callerUid = parseInt(callerIdHex, 16) % 2147483647; // Max 32-bit signed int
            const receiverUid = parseInt(receiverIdHex, 16) % 2147483647;

            logger.info(`🎥 Generating tokens - Caller UID: ${callerUid}, Receiver UID: ${receiverUid}`);

            const callerToken = agoraService.generateRtcToken(channelName, callerUid.toString(), 'publisher');
            const receiverToken = agoraService.generateRtcToken(channelName, receiverUid.toString(), 'publisher');

            logger.info(`🎥 Agora tokens generated for channel: ${channelName}`);

            // Credentials are valid, so the ringing timeout can now be cleared and
            // the call atomically moved into the accepted state.
            const timerData = activeCallTimers.get(callId);
            if (timerData) {
                clearTimeout(timerData.timer);
                activeCallTimers.delete(callId);
            }
            const videoCall = await videoCallService.acceptCall(callId);

            // Notify caller that call was accepted with Agora credentials
            io.to(videoCall.callerId.toString()).emit('call:accepted', {
                callId,
                receiverId: videoCall.receiverId.toString(),
                callType: videoCall.callType,
                agora: {
                    channelName,
                    token: callerToken,
                    uid: callerUid,
                    appId: agoraService.getAppId(),
                },
            });

            // Notify receiver (self) to proceed with Agora credentials
            socket.emit('call:proceed', {
                callId,
                callerId: videoCall.callerId.toString(),
                callType: videoCall.callType,
                agora: {
                    channelName,
                    token: receiverToken,
                    uid: receiverUid,
                    appId: agoraService.getAppId(),
                },
            });
        } catch (error) {
            logger.error(`Call accept error: ${error.message}`);
            socket.emit('call:error', { message: error.message });
        } finally {
            processingCalls.delete(`accept_${data.callId}`);
        }
    });

    // ====================
    // CALL REJECTED (Female)
    // ====================
    socket.on('call:reject', async (data) => {
        try {
            const { callId } = data;
            logger.info(`📞 Call rejected: ${callId}`);

            const requestedCall = await validateCallOwnership(callId);
            if (!requestedCall) {
                socket.emit('call:error', { message: 'Call not found or you are not a participant' });
                return;
            }
            const receiverId = requestedCall.receiverId._id
                ? requestedCall.receiverId._id.toString()
                : requestedCall.receiverId.toString();
            if (receiverId !== userId) {
                socket.emit('call:error', { message: 'Only the receiver can reject this call' });
                return;
            }

            // Clear ringing timeout
            const timerData = activeCallTimers.get(callId);
            if (timerData) {
                clearTimeout(timerData.timer);
                activeCallTimers.delete(callId);
            }

            // End call with rejection (refunds coins)
            const videoCall = await videoCallService.rejectCall(callId);
            connectedCallUsers.delete(callId);

            // Notify caller (using room named by callerId)
            io.to(videoCall.callerId.toString()).emit('call:rejected', {
                callId,
                refunded: true,
            });

            // Confirm to receiver
            socket.emit('call:ended', {
                callId,
                reason: 'rejected',
            });
        } catch (error) {
            logger.error(`Call reject error: ${error.message}`);
            socket.emit('call:error', { message: error.message });
        }
    });

    // ====================
    // CALL CANCELLED (Caller, before connection)
    // ====================
    socket.on('call:cancel', async (data) => {
        try {
            const { callId } = data;
            const call = await validateCallOwnership(callId);
            if (!call) {
                socket.emit('call:error', { message: 'Call not found or you are not a participant' });
                return;
            }

            const callerId = call.callerId._id ? call.callerId._id.toString() : call.callerId.toString();
            const receiverId = call.receiverId._id ? call.receiverId._id.toString() : call.receiverId.toString();
            if (callerId !== userId) {
                socket.emit('call:error', { message: 'Only the caller can cancel this call' });
                return;
            }
            if (!['ringing', 'accepted'].includes(call.status) || call.billingStatus !== 'locked') {
                socket.emit('call:error', { message: 'This call can no longer be cancelled' });
                return;
            }

            const timerData = activeCallTimers.get(callId);
            if (timerData) {
                clearTimeout(timerData.timer);
                activeCallTimers.delete(callId);
            }

            await videoCallService.cancelCall(callId);
            connectedCallUsers.delete(callId);
            const endData = { callId, reason: 'cancelled', canRejoin: false, refunded: true };
            io.to(callerId).emit('call:ended', endData);
            io.to(receiverId).emit('call:ended', endData);
        } catch (error) {
            logger.error(`Call cancel error: ${error.message}`);
            socket.emit('call:error', { message: error.message });
        }
    });

    // ====================
    // WEBRTC CONNECTED
    // ====================
    socket.on('call:connected', async (data) => {
        try {
            const { callId } = data;

            // CONCURRENCY GUARD: Prevent multiple connection processing
            const processingKey = `connect_${callId}_${userId}`;
            if (processingCalls.has(processingKey)) {
                logger.warn(`Ignoring duplicate connect notification for ${callId}`);
                return;
            }
            processingCalls.add(processingKey);

            logger.info(`📞 WebRTC connected: ${callId}`);

            const call = await validateCallOwnership(callId);
            if (!call) {
                socket.emit('call:error', { message: 'Call not found or you are not a participant' });
                return;
            }
            if (!['accepted', 'interrupted', 'connected'].includes(call.status)) {
                socket.emit('call:error', { message: `Call cannot connect from status: ${call.status}` });
                return;
            }

            const connectedUsers = connectedCallUsers.get(callId) || new Set();
            connectedUsers.add(userId);
            connectedCallUsers.set(callId, connectedUsers);

            // The call is billable only after both participants have joined Agora.
            // Starting it after the first join made the other client appear connected
            // even when its own media/channel setup subsequently failed.
            if (connectedUsers.size < 2) {
                logger.info(`Waiting for the other participant to connect: ${callId}`);
                return;
            }

            // If a timer ALREADY exists for this callId (and it's a duration timer), don't restart it
            const existingTimer = activeCallTimers.get(callId);
            if (existingTimer && existingTimer.type === 'duration') {
                logger.info(`Timer already active for call ${callId}, skipping restart`);
                return;
            }

            // Mark call as connected (credits coins to receiver)
            const videoCall = await videoCallService.markCallConnected(callId);

            // If this was a rejoin/reconnect (already charged), don't restart the timer or notify started
            if (videoCall.billingStatus === 'charged' && existingTimer) {
                logger.debug(`Call ${callId} already billed and timer active, skipping restart logic`);
                return;
            }

            const callerId = videoCall.callerId.toString();
            const receiverId = videoCall.receiverId.toString();

            // Start 5-minute call timer (AUTHORITATIVE)
            const duration = videoCall.callDurationSeconds * 1000;
            setCallTimer(callId, 'duration', duration, async () => {
                try {
                    logger.info(`⏰ Call timer expired: ${callId}`);
                    await videoCallService.endCall(callId, 'timer_expired', null);
                    connectedCallUsers.delete(callId);

                    const forceEndData = { callId, reason: 'timer_expired' };
                    io.to(callerId).emit('call:force-end', forceEndData);
                    io.to(receiverId).emit('call:force-end', forceEndData);

                    activeCallTimers.delete(callId);
                } catch (error) {
                    logger.error(`Call timer end error: ${error.message}`);
                }
            });

            // Update timer data with role info for the helper
            const tData = activeCallTimers.get(callId);
            if (tData) {
                tData.callerId = callerId;
                tData.receiverId = receiverId;
            }

            // Notify both users that call is now active
            const callStartData = {
                callId,
                duration: videoCall.callDurationSeconds,
                startTime: Date.now(),
            };

            io.to(callerId).emit('call:started', callStartData);
            io.to(receiverId).emit('call:started', callStartData);
        } catch (error) {
            logger.error(`Call connected error: ${error.message}`);
            socket.emit('call:error', { message: error.message });
        } finally {
            processingCalls.delete(`connect_${data.callId}_${userId}`);
        }
    });

    // ====================
    // CALL END (Either user)
    // ====================
    socket.on('call:end', async (data) => {
        try {
            const { callId } = data;
            logger.info(`📞 Call end requested: ${callId} by ${userId}`);

            // Validate call ownership
            const call = await validateCallOwnership(callId);
            if (!call) {
                socket.emit('call:error', { message: 'Call not found or you are not a participant' });
                return;
            }

            // Check if call is already truly ended
            if (call.status === 'ended' || call.status === 'cancelled') {
                logger.warn(`Ignoring end request for already ended call: ${callId}`);
                // Don't emit again to avoid duplicates
                return;
            }

            // identify roles (getCall populates participants, so read their _id)
            const callerId = call.callerId._id ? call.callerId._id.toString() : call.callerId.toString();
            const receiverId = call.receiverId._id ? call.receiverId._id.toString() : call.receiverId.toString();
            const otherUserId = callerId === userId ? receiverId : callerId;

            // 1. Calculate remaining time
            const timerData = activeCallTimers.get(callId);
            let remainingTime = 0;
            if (timerData && timerData.type === 'duration') {
                const elapsedMs = Date.now() - timerData.startTime;
                remainingTime = Math.max(0, call.callDurationSeconds - Math.floor(elapsedMs / 1000));

                // PAUSE: Use our helper logic implicitly by manually clearing here for precision
                clearTimeout(timerData.timer);
                activeCallTimers.delete(callId);
            }

            // 2. Determine if rejoin is possible
            // CRITICAL FIX FOR SMARTPHONE "BLACKOUT": An intentional call:end request 
            // should ALWAYS be a hard end. We only allow soft ends (canRejoin=true) 
            // during accidental disconnects. This prevents users from being stuck 
            // on an "Interrupted" screen when they explicitly wanted to finish.
            const canRejoin = false;
            logger.info(`🔍 Call end decision (Intentional): callId=${callId}, userId=${userId}, canRejoin=false`);

            if (canRejoin) {
                logger.info(`⏸️ Call Soft Ended (Rejoin Active): ${callId}. Remainning: ${remainingTime}s`);

                try {
                    // Update DB to interrupted state
                    call.status = 'interrupted';
                    call.endedAt = new Date();
                    await call.save();

                    // Free up users - wrapped in try-catch
                    await User.updateMany(
                        { _id: { $in: [call.callerId, call.receiverId] } },
                        { $set: { isOnCall: false } }
                    );
                } catch (dbError) {
                    logger.error(`DB update error during soft end: ${dbError.message}`);
                    // Continue with notification even if DB fails
                }

                // Notify sender they can rejoin
                socket.emit('call:ended', {
                    callId,
                    reason: 'soft_end',
                    canRejoin: true,
                    remainingTime,
                });

                // Notify other user to WAIT
                logger.info(`⏳ Sending call:waiting to ${otherUserId} in room ${callId} for call ${callId}`);
                // Emit to the specific user AND the room for maximum reliability
                io.to(otherUserId).emit('call:waiting', {
                    callId,
                    disconnectedUserId: userId,
                });
                socket.to(callId).emit('call:waiting', {
                    callId,
                    disconnectedUserId: userId,
                });

                // Start INTERRUPTION TIMEOUT (60s grace period) using helper
                setCallTimer(callId, 'interruption', 60000, async () => {
                    try {
                        logger.info(`❌ Interruption (Soft End) timeout expired: ${callId}`);
                        const reason = 'interruption_timeout'; // Define reason here
                        const videoCall = await videoCallService.endCall(callId, reason, userId);
                        connectedCallUsers.delete(callId);

                        // Notify both users
                        const endData = {
                            callId,
                            reason,
                            canRejoin: false, // Hard end
                        };

                        io.to(videoCall.callerId.toString()).emit('call:ended', endData);
                        io.to(videoCall.receiverId.toString()).emit('call:ended', endData);

                        // Clean up timers
                        activeCallTimers.delete(callId); // This clears the main call timer if it somehow wasn't cleared before.
                        activeCallTimers.delete(`${callId}_interruption`); // This clears the interruption timer.

                        // FORCE CLEAR after a hard end to be absolutely sure
                        setTimeout(() => {
                            io.to(videoCall.callerId.toString()).emit('call:clear-all');
                            io.to(videoCall.receiverId.toString()).emit('call:clear-all');
                        }, 2000);
                    } catch (err) {
                        logger.error(`Soft end timeout error: ${err.message}`);
                    }
                });

                // Add transition data for resumption
                const interData = activeCallTimers.get(`${callId}_interruption`);
                if (interData) {
                    interData.disconnectedUserId = userId;
                    interData.remainingTimeWhenPaused = remainingTime;
                }

            } else {
                // HARD END (No time left or already rejoined once)
                logger.info(`🧹 Call Hard Ended: ${callId}`);

                // Clear any existing interruption timer
                const interData = activeCallTimers.get(`${callId}_interruption`);
                if (interData) {
                    clearTimeout(interData.timer);
                    activeCallTimers.delete(`${callId}_interruption`);
                }

                const endReason = callerId === userId ? 'caller_ended' : 'receiver_ended';
                const videoCall = await videoCallService.endCall(callId, endReason, userId);
                connectedCallUsers.delete(callId);

                const endData = {
                    callId,
                    reason: endReason,
                    canRejoin: false,
                    duration: videoCall.connectedAt
                        ? Math.floor((Date.now() - new Date(videoCall.connectedAt).getTime()) / 1000)
                        : 0,
                };

                io.to(videoCall.callerId.toString()).emit('call:ended', endData);
                io.to(videoCall.receiverId.toString()).emit('call:ended', endData);

                // FORCE CLEAR after a hard end
                setTimeout(() => {
                    io.to(videoCall.callerId.toString()).emit('call:clear-all');
                    io.to(videoCall.receiverId.toString()).emit('call:clear-all');
                }, 2000);
            }
        } catch (error) {
            logger.error(`Call end error: ${error.message}`);
            socket.emit('call:error', { message: error.message });
        }
    });

    // ====================
    // CALL REJOIN (Either user)
    // ====================
    socket.on('call:rejoin', async (data) => {
        try {
            const { callId } = data;
            logger.info(`🔄 Call rejoin requested: ${callId} by ${userId}`);

            // A. Check for INTERRUPTION STATE (Peer was waiting)
            const interruptionData = activeCallTimers.get(`${callId}_interruption`);
            let remainingSeconds = 0;

            if (interruptionData) {
                // Fetch call to check per-user rejoin eligibility
                const videoCall = await videoCallService.getCall(callId);
                if (!videoCall) {
                    socket.emit('call:error', { message: 'Call record not found' });
                    return;
                }

                // PER-USER REJOIN LIMIT: Only one rejoin per participant
                const userAlreadyRejoined = (videoCall.rejoinedUserIds || []).includes(userId);
                if (userAlreadyRejoined) {
                    logger.warn(`🛑 User ${userId} already used their rejoin for call ${callId}. Blocking second attempt.`);
                    socket.emit('call:error', { message: 'You have already used your rejoin attempt for this call.' });

                    // Actually, if they are trying to rejoin but shouldn't be allowed, we should probably hard-end it now
                    return;
                }

                // We are recovering from an interruption
                logger.info(`🔄 Resuming from interruption state for call ${callId}`);
                clearTimeout(interruptionData.timer);
                activeCallTimers.delete(`${callId}_interruption`);

                // Use the time that was saved when pause happened
                remainingSeconds = interruptionData.remainingTimeWhenPaused;

                // Re-use already fetched videoCall or update reference
                // videoCall is already fetched at line 517
                const callerId = videoCall.callerId._id ? videoCall.callerId._id.toString() : videoCall.callerId.toString();
                const receiverId = videoCall.receiverId._id ? videoCall.receiverId._id.toString() : videoCall.receiverId.toString();

                const otherUserId = callerId === userId ? receiverId : callerId;

                // Reset DB state - wrapped in try-catch
                try {
                    videoCall.status = 'connected';
                    videoCall.endedAt = null;

                    // Track this user's rejoin
                    if (!videoCall.rejoinedUserIds.includes(userId)) {
                        videoCall.rejoinedUserIds.push(userId);
                    }
                    videoCall.rejoinCount = (videoCall.rejoinCount || 0) + 1;

                    await videoCall.save();

                    await User.updateMany(
                        { _id: { $in: [videoCall.callerId, videoCall.receiverId] } },
                        { $set: { isOnCall: true } }
                    );
                } catch (dbError) {
                    logger.error(`DB update error during rejoin: ${dbError.message}`);
                }

                // Notify other user: "Partner is back!"
                logger.info(`✅ [REJOIN] Notifying partner ${otherUserId} to resume. Remaining: ${remainingSeconds}s`);
                io.to(otherUserId).emit('call:peer-rejoined', {
                    callId,
                    remainingTime: remainingSeconds
                });
                socket.to(callId).emit('call:peer-rejoined', {
                    callId,
                    remainingTime: remainingSeconds
                });

                logger.info(`✅ [REJOIN] Resuming call ${callId} for user ${userId}`);
                // Helper to setup timer & token
                await setupCallResumption(videoCall, remainingSeconds, userId);
                return;
            } else {
                logger.warn(`⚠️ [REJOIN] No interruption data found for ${callId} in memory. Falling back to DB/Service fallback.`);
            }

            // B. Normal Rejoin (e.g. browser crash where disconnect event might not have handled everything perfectly, or manual rejoin)
            const result = await videoCallService.rejoinCall(callId, userId);
            const videoCall = result.videoCall;
            remainingSeconds = result.remainingSeconds;

            await setupCallResumption(videoCall, remainingSeconds, userId);

        } catch (error) {
            logger.error(`Call rejoin error: ${error.message}`);
            socket.emit('call:error', { message: error.message });
        }
    });

    // Helper to restart timer and send tokens
    const setupCallResumption = async (videoCall, remainingSeconds, requestingUserId) => {
        const callId = videoCall._id.toString();
        const channelName = callId;
        const callerId = videoCall.callerId._id ? videoCall.callerId._id.toString() : videoCall.callerId.toString();
        const receiverId = videoCall.receiverId._id ? videoCall.receiverId._id.toString() : videoCall.receiverId.toString();

        // Start NEW timer with remaining duration using helper
        const durationMs = remainingSeconds * 1000;
        setCallTimer(callId, 'duration', durationMs, async () => {
            try {
                logger.info(`⏰ Rejoined call timer expired: ${callId}`);
                await videoCallService.endCall(callId, 'timer_expired', null);
                connectedCallUsers.delete(callId);

                const forceEndData = { callId, reason: 'timer_expired' };
                io.to(callerId).emit('call:force-end', forceEndData);
                io.to(receiverId).emit('call:force-end', forceEndData);
                activeCallTimers.delete(callId);

                // FORCE CLEAR after a hard end to be absolutely sure
                setTimeout(() => {
                    io.to(callerId).emit('call:clear-all');
                    io.to(receiverId).emit('call:clear-all');
                }, 2000);
            } catch (error) {
                logger.error(`Rejoin timer end error: ${error.message}`);
            }
        });

        // Set additional data for resumption calculation
        const tData = activeCallTimers.get(callId);
        if (tData) {
            tData.startTime = Date.now() - (videoCall.callDurationSeconds - remainingSeconds) * 1000;
            tData.callerId = callerId;
            tData.receiverId = receiverId;
        }

        // Generate tokens
        const callerIdHex = callerId.slice(-8);
        const receiverIdHex = receiverId.slice(-8);
        const callerUid = parseInt(callerIdHex, 16) % 2147483647;
        const receiverUid = parseInt(receiverIdHex, 16) % 2147483647;

        const callerToken = agoraService.generateRtcToken(channelName, callerUid.toString(), 'publisher');
        const receiverToken = agoraService.generateRtcToken(channelName, receiverUid.toString(), 'publisher');

        // Notify both (or just the rejoining one? Ideally both to refresh token/sync time)
        const rejoinData = {
            callId,
            remainingSeconds,
            startTime: Date.now() - (videoCall.callDurationSeconds - remainingSeconds) * 1000,
        };

        // If resuming from interruption, the other user is ALREADY waiting in the call
        // They just need to know the waiting is over (handled by peer-rejoined)
        // BUT they might need a token refresh if token expired? 
        // For simplicity, send updated state to both.

        // Notify ONLY the person who requested the rejoin
        const targetRoom = requestingUserId === callerId ? callerId : receiverId;
        const targetToken = requestingUserId === callerId ? callerToken : receiverToken;
        const targetUid = requestingUserId === callerId ? callerUid : receiverUid;

        io.to(targetRoom).emit('call:rejoin-proceed', {
            ...rejoinData,
            agora: {
                channelName,
                token: targetToken,
                uid: targetUid,
                appId: agoraService.getAppId(),
            },
        });

        logger.info(`✅ Call Resumed/Rejoined: ${callId} (Remaining: ${remainingSeconds}s)`);
    };

    // ====================
    // WEBRTC SIGNALING: OFFER
    // ====================
    socket.on('webrtc:offer', async (data) => {
        const { callId, targetUserId, offer } = data;
        logger.debug(`🔗 WebRTC offer from ${userId} to ${targetUserId}`);

        // Emit to target user's room
        io.to(targetUserId).emit('webrtc:offer', {
            callId,
            fromUserId: userId,
            offer,
        });
    });

    // ====================
    // WEBRTC SIGNALING: ANSWER
    // ====================
    socket.on('webrtc:answer', async (data) => {
        const { callId, targetUserId, answer } = data;
        logger.debug(`🔗 WebRTC answer from ${userId} to ${targetUserId}`);

        // Emit to target user's room
        io.to(targetUserId).emit('webrtc:answer', {
            callId,
            fromUserId: userId,
            answer,
        });
    });

    // ====================
    // WEBRTC SIGNALING: ICE CANDIDATE
    // ====================
    socket.on('webrtc:ice-candidate', async (data) => {
        const { callId, targetUserId, candidate } = data;
        logger.debug(`🔗 ICE candidate from ${userId} to ${targetUserId}`);

        // Emit to target user's room
        io.to(targetUserId).emit('webrtc:ice-candidate', {
            callId,
            fromUserId: userId,
            candidate,
        });
    });

    // ====================
    // CONNECTION FAILED
    // ====================
    socket.on('call:connection-failed', async (data) => {
        try {
            const { callId } = data;
            logger.warn(`📞 WebRTC connection failed: ${callId}`);

            const call = await validateCallOwnership(callId);
            if (!call) {
                socket.emit('call:error', { message: 'Call not found or you are not a participant' });
                return;
            }

            // Clear timers
            const timerData = activeCallTimers.get(callId);
            if (timerData) {
                clearTimeout(timerData.timer);
                activeCallTimers.delete(callId);
            }

            // End call with failure (refunds if not connected yet)
            const videoCall = await videoCallService.endCall(callId, 'connection_failed', null);
            connectedCallUsers.delete(callId);

            const failData = {
                callId,
                reason: 'connection_failed',
                refunded: videoCall.billingStatus === 'refunded',
            };

            // Notify both users using rooms
            io.to(videoCall.callerId.toString()).emit('call:ended', failData);
            io.to(videoCall.receiverId.toString()).emit('call:ended', failData);

            // FORCE CLEAR traces
            setTimeout(() => {
                io.to(videoCall.callerId.toString()).emit('call:clear-all');
                io.to(videoCall.receiverId.toString()).emit('call:clear-all');
            }, 2000);
        } catch (error) {
            logger.error(`Connection failed handling error: ${error.message}`);
        }
    });

    // ====================
    // HANDLE DISCONNECT
    // ====================
    socket.on('disconnect', async () => {
        logger.info(`📞 User disconnected: ${userId}`);

        try {
            // Check if user had an active call
            const activeCall = await videoCallService.getActiveCallForUser(userId);
            if (activeCall) {
                logger.info(`📞 User disconnected during active call: ${activeCall._id}`);

                // 1. Identify roles
                const callId = activeCall._id.toString();
                const otherUserId = activeCall.callerId.toString() === userId
                    ? activeCall.receiverId.toString()
                    : activeCall.callerId.toString();

                // A call that never became billable cannot be rejoined. End it as
                // a connection failure so locked coins are refunded and neither
                // user remains stuck with isOnCall=true.
                if (['pending', 'ringing', 'accepted'].includes(activeCall.status)) {
                    const pendingTimer = activeCallTimers.get(callId);
                    if (pendingTimer) {
                        clearTimeout(pendingTimer.timer);
                        activeCallTimers.delete(callId);
                    }
                    const videoCall = await videoCallService.endCall(callId, 'connection_failed', userId);
                    connectedCallUsers.delete(callId);
                    const endData = {
                        callId,
                        reason: 'connection_failed',
                        canRejoin: false,
                        refunded: videoCall.billingStatus === 'refunded',
                    };
                    io.to(videoCall.callerId.toString()).emit('call:ended', endData);
                    io.to(videoCall.receiverId.toString()).emit('call:ended', endData);
                    return;
                }

                // 2. Clear MAIN duration timer (PAUSE THE CALL)
                const timerData = activeCallTimers.get(callId);
                let remainingTime = 0;

                if (timerData && timerData.type === 'duration') {
                    clearTimeout(timerData.timer);
                    // Calculate remaining time for resumption
                    const elapsedMs = Date.now() - timerData.startTime;
                    const originalDurationMs = activeCall.callDurationSeconds * 1000;
                    const remainingMs = Math.max(0, originalDurationMs - elapsedMs);
                    remainingTime = Math.ceil(remainingMs / 1000);

                    activeCallTimers.delete(callId);
                    logger.info(`⏸️ Call paused. Remaining: ${remainingTime}s`);
                }

                // 3. Determine if SOFT END is allowed (one rejoin per user)
                const userAlreadyRejoined = (activeCall.rejoinedUserIds || []).includes(userId);
                const canSoftEnd = remainingTime > 10 && !userAlreadyRejoined;

                if (canSoftEnd) {
                    logger.info(`⏸️ Accidental disconnect - allowing rejoin for ${userId}`);
                    // 3.1 Notify other user to WAIT
                    io.to(otherUserId).emit('call:waiting', {
                        callId,
                        disconnectedUserId: userId,
                    });

                    // 3.2 Mark call as interrupted in DB
                    try {
                        activeCall.status = 'interrupted';
                        activeCall.endedAt = new Date();
                        await activeCall.save();

                        await User.updateMany(
                            { _id: { $in: [activeCall.callerId, activeCall.receiverId] } },
                            { $set: { isOnCall: false } }
                        );
                    } catch (dbError) {
                        logger.error(`DB update error during disconnect: ${dbError.message}`);
                    }

                    // 3.3 Start INTERRUPTION TIMEOUT (60s grace period)
                    const interruptionTimerId = setTimeout(async () => {
                        try {
                            logger.info(`❌ Interruption timeout expired for call: ${callId}`);
                            const endReason = activeCall.callerId.toString() === userId
                                ? 'caller_disconnected'
                                : 'receiver_disconnected';

                            const videoCall = await videoCallService.endCall(callId, endReason, userId);
                            connectedCallUsers.delete(callId);

                            const endData = {
                                callId,
                                reason: endReason,
                                canRejoin: false,
                                refunded: videoCall.billingStatus === 'refunded',
                            };

                            io.to(videoCall.callerId.toString()).emit('call:ended', endData);
                            io.to(videoCall.receiverId.toString()).emit('call:ended', endData);
                            activeCallTimers.delete(`${callId}_interruption`);
                        } catch (err) {
                            logger.error(`Interruption timeout error: ${err.message}`);
                        }
                    }, 60000);

                    activeCallTimers.set(`${callId}_interruption`, {
                        timer: interruptionTimerId,
                        type: 'interruption',
                        disconnectedUserId: userId,
                        remainingTimeWhenPaused: remainingTime || activeCall.callDurationSeconds,
                    });
                } else {
                    // HARD END on disconnect (already rejoined or no time left)
                    logger.info(`🧹 Disconnect Hard End (Already rejoined or no time): ${callId}`);

                    const endReason = activeCall.callerId.toString() === userId
                        ? 'caller_disconnected'
                        : 'receiver_disconnected';

                    const videoCall = await videoCallService.endCall(callId, endReason, userId);
                    connectedCallUsers.delete(callId);

                    const endData = {
                        callId,
                        reason: endReason,
                        canRejoin: false,
                        duration: videoCall.connectedAt
                            ? Math.floor((Date.now() - new Date(videoCall.connectedAt).getTime()) / 1000)
                            : 0,
                    };

                    io.to(videoCall.callerId.toString()).emit('call:ended', endData);
                    io.to(videoCall.receiverId.toString()).emit('call:ended', endData);

                    // Force clear after hard end
                    setTimeout(() => {
                        io.to(videoCall.callerId.toString()).emit('call:clear-all');
                        io.to(videoCall.receiverId.toString()).emit('call:clear-all');
                    }, 2000);
                }
            }
        } catch (error) {
            logger.error(`Disconnect handling error: ${error.message}`);
        }
    });
};

/**
 * Sync user socket mapping (kept for backward compatibility, but not used anymore)
 * @param {string} userId - User ID
 * @param {string} socketId - Socket ID  
 */
export const syncUserSocket = (userId, socketId) => {
    // Not needed anymore since we use rooms
    // Kept for backward compatibility
};

/**
 * Get connected socket ID for user (deprecated - use rooms instead)
 * @param {string} userId - User ID
 * @returns {string|undefined}
 */
export const getUserSocketId = (userId) => {
    // Not used anymore
    return undefined;
};

export default {
    setupVideoCallHandlers,
    syncUserSocket,
    getUserSocketId,
};
