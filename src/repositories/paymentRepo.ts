import Payment from '../models/paymentModel.js';

class PaymentRepo {
  // Repository Layer to handle DB operations
  public async addPaymentRepo(userId: string, appointmentId:string,amount: number, status: string): Promise<any> {
    try {
      const paymentData = new Payment({
        userId,
        appointmentId,
        amount,
        status,
        date: new Date(), // Set the date to the current time
      });

      // Save to MongoDB and return the result
      const savedPayment = await paymentData.save();
      return savedPayment;
    } catch (error) {
      console.error(error);
      throw new Error('Error occurred in addPaymentRepo');
    }
  }
}

export default PaymentRepo;
