import express from 'express'
import { createPayment, paymentVerification, paymentWebhook } from '../controllers/paymentController.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/createpayment', verifyToken, createPayment);
router.post('/verifypayment', verifyToken, paymentVerification);
router.post('/webhook', paymentWebhook);

export default router;
