import express from 'express';
import { createAdmin, deleteAdminById, getAllAdmins } from '../controllers/adminController.js';
import { getPaymentAlerts, resolvePaymentAlert } from '../controllers/paymentAlertController.js';
import { verifyToken } from '../utils/verifyUser.js';
import { verifyAdmin } from '../utils/verifyAdmin.js';

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.post('/', createAdmin);
router.get('/', getAllAdmins);
router.delete('/:id', deleteAdminById);
router.get('/payment-alerts', getPaymentAlerts);
router.patch('/payment-alerts/:alertId/resolve', resolvePaymentAlert);

export default router;
