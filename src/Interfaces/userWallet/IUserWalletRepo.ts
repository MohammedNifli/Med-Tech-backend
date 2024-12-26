

export interface IUserWalletRepo{
    createWallet(userId:string):Promise<any>;
    creditedWalletRepo(amount:number,userId:string,appointmentId:string):Promise<any>;
    findWallet(userId:string):Promise<any>
    findWalletByUserId(userId: string): Promise<any>
}