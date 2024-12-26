import WalletModel from '../models/userWalletModel.js'
class walletRepo{

    public async createWallet(userId: string): Promise<any> {
        try {
            
            const createdWallet = new WalletModel({
                userId,  
                balance: 0, 
                transactions: [],
            });
            return await createdWallet.save();
        } catch (error) {
            console.log(error);
            throw error; 
        }
    }

    public async findWallet(userId:string):Promise<any>{
        try{
            const data=await WalletModel.findById({userId:userId})
            const totalBalance=data?.balance;
            return totalBalance;


        }catch(error){
            console.log(error)
        }
    }

    public async creditedWalletRepo(amount: number, userId: string, appointmentId: string): Promise<any> {
        try {
            const updatedWallet = await WalletModel.findOneAndUpdate(
                { userId },
                { 
                    $set: { balance: amount },
                    $push: { transactions: { appointmentId, amount, date: new Date() } }
                },
                { new: true, upsert: true }  // `upsert` ensures a wallet is created if none exists
            );
    
            return updatedWallet;
        } catch (error) {
            console.error("Error in creditedWalletRepo:", error);
            throw error;
        }
    }

    public async findWalletByUserId(userId: string): Promise<any> {
        try {
            const walletData = await WalletModel.findOne({ userId });
            return walletData;
        } catch (error) {
            console.error('Error in findWalletByUserId repository:', error);
            throw error;
        }
    }
    

}

export default walletRepo