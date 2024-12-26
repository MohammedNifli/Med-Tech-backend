

export interface  IUserWalletService{

 createWalletService(userId:string):Promise<any>
 creditInWalletService(amount:number,userId:string,appointmentId:string):Promise<any>
 fetchWalletDetails(userId: string): Promise<any>

}