import Payment from '../models/paymentModel.js';
class PaymentRepo {
    async addPaymentRepo(userId, appointmentId, amount, status) {
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
        }
        catch (error) {
            console.error(error);
            throw new Error('Error occurred in addPaymentRepo');
        }
    }
}
export default PaymentRepo;
