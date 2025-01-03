import { IDoctorWallet } from "../../types/doctorWallet.types.js";


export interface IDoctorWalletService{
    createWalletservice(doctorId:string):Promise<IDoctorWallet>
    addAmountToTheWallet(data: { doctorId: string; amount: number; transactionType: string }): Promise<any>
    getWalletDetails(doctorId: string): Promise<IDoctorWallet>
    deductAmount(data:{amount:number,doctorId:string,transactionType:string}):Promise<number>
}