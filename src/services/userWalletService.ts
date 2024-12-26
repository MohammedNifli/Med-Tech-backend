
import { IUserWalletRepo } from "../Interfaces/userWallet/IUserWalletRepo.js";

class userWalletService{
private userWalletRepo:IUserWalletRepo;
constructor(userWalletRepo:IUserWalletRepo){
    this.userWalletRepo=userWalletRepo;
}

public async createWalletService(userId:string):Promise<any>{

    try{
        const createdWallet=await this.userWalletRepo.createWallet(userId);
        return createdWallet

    }catch(error){
        console.log(error)
    }

}

public async creditInWalletService(amount: number, userId: string, appointmentId: string): Promise<any> {
    try {
        const currentBalance = await this.userWalletRepo.findWallet(userId);
        const totalAmount = amount + (currentBalance || 0);

        const creditedWallet = await this.userWalletRepo.creditedWalletRepo(totalAmount, userId, appointmentId);
        return creditedWallet;
    } catch (error) {
        console.error("Error in creditInWalletService:", error);
        throw error;
    }
}


public async fetchWalletDetails(userId: string): Promise<any> {
    try {
        const walletData = await this.userWalletRepo.findWalletByUserId(userId);
        return walletData;
    } catch (error) {
        console.error('Error in fetchWalletDetails service:', error);
        throw error;
    }
}

}

export default userWalletService