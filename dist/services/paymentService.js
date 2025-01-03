class PaymentService {
    paymentRepo;
    constructor(paymentRepo) {
        this.paymentRepo = paymentRepo;
    }
    async addPaymentService(userId, appointmentId, amount, status) {
        try {
            if (!userId) {
                throw Error('Error happeming in addPaymentService');
            }
            const paymentData = await this.paymentRepo.addPaymentRepo(userId, appointmentId, amount, status);
            return paymentData;
        }
        catch (error) {
            throw new Error('Error occurred in addPaymentService');
        }
    }
}
export default PaymentService;
