import { Request, Response } from 'express';
import { IPaymentService } from '../Interfaces/payment/IPaymentService.js';
import { HttpStatusCode } from '../enums/httpStatusCodes.js';

import { IPaymentController } from '../Interfaces/payment/IPaymentController.js';

class PaymentController implements IPaymentController {
  private paymentService: IPaymentService;

  constructor(paymentService: IPaymentService) {
    this.paymentService = paymentService;
  }

  
  public async addPayment(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      
      
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: 'An error occurred while processing the payment.',
      });
    }
  }


}

export default PaymentController;
