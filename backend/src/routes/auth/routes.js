/**
 * Auth Routes
 * @owner: Sujal
 */

import express from 'express';
import * as authController from '../../controllers/auth/authController.js';

const router = express.Router();

router.post('/login-request', authController.requestLoginOtp);
router.post('/login-verify', authController.verifyLoginOtp);
router.post('/signup-request', authController.requestSignupOtp);
router.post('/signup-verify', authController.verifySignupOtp);

export default router;
