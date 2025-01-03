import { HttpStatusCode } from '../enums/httpStatusCodes.js';
class PaymentController {
    paymentService;
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async addPayment(req, res) {
        try {
            const { userId, email, amount, status } = req.body;
            if (!userId || !email || !amount || !status) {
                res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Missing required fields' });
                return;
            }
            const paymentData = await this.paymentService.addPaymentService(userId, email, amount, status);
            res.status(HttpStatusCode.CREATED).json({
                message: 'Payment created successfully',
                paymentData,
            });
        }
        catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: 'An error occurred while processing the payment.',
            });
        }
    }
}
export default PaymentController;
