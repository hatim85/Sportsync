import express from 'express'
import { signup, signin, checkUser, addPhone, firebaseSignin, sendOtp, verifyOtpAndSignup, forgotPasswordSendOtp, forgotPasswordVerifyOtp, forgotPasswordReset } from '../controllers/authController.js'

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/checkuser', checkUser);
router.post('/addphone', addPhone);
router.post('/firebasesignin', firebaseSignin);
router.post('/send-otp', sendOtp);
router.post('/verify-otp-signup', verifyOtpAndSignup);
router.post('/forgot-password-send-otp', forgotPasswordSendOtp);
router.post('/forgot-password-verify-otp', forgotPasswordVerifyOtp);
router.post('/forgot-password-reset', forgotPasswordReset);

export default router;