

export interface IDoctorWalletService{
    createWalletservice(doctorId:string):Promise<any>
    addAmountToTheWallet(data: { doctorId: string; amount: number; transactionType: string }): Promise<any>
    getWalletDetails(doctorId: string): Promise<any>
    deductAmount(data:{amount:number,doctorId:string,transactionType:string}):Promise<any>
}