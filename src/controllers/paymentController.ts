import { Request, Response } from 'express';
import { IPaymentService } from '../Interfaces/payment/IPaymentService.js';
import { HttpStatusCode } from '../enums/httpStatusCodes.js';

class PaymentController {
  private paymentService: IPaymentService;

  constructor(paymentService: IPaymentService) {
    this.paymentService = paymentService;
  }

  // Method to handle adding payment
  public async addPayment(req: Request, res: Response): Promise<void> {
    try {
      // Extracting parameters from the request body
      const { userId, email, amount, status } = req.body;

      // Input validation
      if (!userId || !email || !amount || !status) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Missing required fields' });
        return;
      }

      // Call the service to add the payment
      const paymentData = await this.paymentService.addPaymentService(userId, email, amount, status);

      // Return the saved payment data
      res.status(HttpStatusCode.CREATED).json({
        message: 'Payment created successfully',
        paymentData,
      });
    } catch (error) {
      // Log error and send response
      console.error(error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: 'An error occurred while processing the payment.',
      });
    }
  }


}

export default PaymentController;
