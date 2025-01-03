import Payment from '../models/paymentModel.js';

class PaymentRepo {

  public async addPaymentRepo(userId: string, appointmentId:string,amount: number, status: string): Promise<any> {
    try {
      const paymentData = new Payment({
        userId,
        appointmentId,
        amount,
        status,
        date: new Date(), 
      });

  
      const savedPayment = await paymentData.save();
      return savedPayment;
    } catch (error) {
      console.error(error);
      throw new Error('Error occurred in addPaymentRepo');
    }
  }
}

export default PaymentRepo;
