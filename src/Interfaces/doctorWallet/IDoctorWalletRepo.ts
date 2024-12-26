

export interface IDoctorWalletRepo{
    createWalletRepo(doctorId:string):Promise<any>
    deductAmountFromWallet(data: { doctorId: string; amount: number; transactionType: string }): Promise<any>
    getWalletBalance(doctorId: string): Promise<any>
    addAmountToTheWallet(data: { doctorId: string; amount: number; transactionType: string }): Promise<any> 
}