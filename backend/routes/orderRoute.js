import express from 'express'
import { getAllAdminOrders, getAllOrders, updateStatus, createOrder, getOrderById, requestReturn, cancelReturn, cancelOrder } from '../controllers/orderController.js';
import { verifyToken } from '../utils/verifyUser.js';
import { verifyAdmin } from '../utils/verifyAdmin.js';

const router = express.Router();

router.post('/create', verifyToken, createOrder);
router.get('/getorder/:orderId', verifyToken, getOrderById);
router.get('/getorders/:userId', verifyToken, getAllOrders);
router.post('/:orderId/return', verifyToken, requestReturn);
router.patch('/:orderId/return/cancel', verifyToken, cancelReturn);
router.patch('/cancel/:orderId', verifyToken, cancelOrder);
router.patch('/updatestatus/:orderId', verifyToken, verifyAdmin, updateStatus);
router.get('/getadminorders', verifyToken, verifyAdmin, getAllAdminOrders);

export default router;
