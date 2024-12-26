export interface IPaymentService {
    addPaymentService(userId: string, appointmentId:string, amount: number, status: string): Promise<any>;
  }
  