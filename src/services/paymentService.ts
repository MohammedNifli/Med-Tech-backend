import { IPaymentRepo } from '../Interfaces/payment/IPaymentRepo.js';

class PaymentService {
  private paymentRepo: IPaymentRepo;

  constructor(paymentRepo: IPaymentRepo) {
    this.paymentRepo = paymentRepo;
  }
    

  

  public async addPaymentService(userId: string, appointmentId:string,amount: number, status: string): Promise<any> {
    try {

        console.log("helllllllloooooooo",userId,appointmentId,amount,status)
        if(!userId){
            throw Error('Error happeming in addPaymentService')
        }
      // Call the repository to add payment
      const paymentData = await this.paymentRepo.addPaymentRepo(userId, appointmentId,amount, status);
      return paymentData;
    } catch (error) {
      console.error(error);
      throw new Error('Error occurred in addPaymentService');
    }
  }
  
}

export default PaymentService;