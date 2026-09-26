import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { requireUserAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public User Authentication & Registration Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/demo-login', authController.demoLogin);
router.post('/verify-otp', authController.verifyOtp);
router.post('/register/verify-otp', authController.verifyOtp);
router.post('/login/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);

// Password Reset Routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Authenticated User Session & Profile Routes
router.get('/me', requireUserAuth as any, authController.getMe as any);
router.patch('/me', requireUserAuth as any, authController.updateMe as any);
router.post('/logout', requireUserAuth as any, authController.logout as any);
router.get('/dashboard/:role', requireUserAuth as any, authController.getRoleDashboardData as any);

export default router;
