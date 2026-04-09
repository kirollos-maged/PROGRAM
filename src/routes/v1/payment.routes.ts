import { Router } from 'express';
import { PaymentController } from '../../controllers/payment.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.post('/checkout', authMiddleware, PaymentController.createPayment);
router.post('/webhook', PaymentController.handleWebhook);
router.post('/:paymentId/refund', authMiddleware, PaymentController.requestRefund);

export default router;

