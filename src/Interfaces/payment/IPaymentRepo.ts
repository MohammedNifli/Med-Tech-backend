export interface IPaymentRepo {
    addPaymentRepo(userId: string,appointmentId:string, amount: number, status: string): Promise<any>
  }
  