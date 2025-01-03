import { IPaymentRepo } from '../Interfaces/payment/IPaymentRepo.js';

class PaymentService {
  private paymentRepo: IPaymentRepo;

  constructor(paymentRepo: IPaymentRepo) {
    this.paymentRepo = paymentRepo;
  }
    

  

  public async addPaymentService(userId: string, appointmentId:string,amount: number, status: string): Promise<any> {
    try {


        if(!userId){
            throw Error('Error happeming in addPaymentService')
        }
      
      const paymentData = await this.paymentRepo.addPaymentRepo(userId, appointmentId,amount, status);
      return paymentData;
    } catch (error) {
      
      throw new Error('Error occurred in addPaymentService');
    }
  }
  
}

export default PaymentService;