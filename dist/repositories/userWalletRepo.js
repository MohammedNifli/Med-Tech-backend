import WalletModel from '../models/userWalletModel.js';
class walletRepo {
    async createWallet(userId) {
        try {
            const createdWallet = new WalletModel({
                userId,
                balance: 0,
                transactions: [],
            });
            return await createdWallet.save();
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async findWallet(userId) {
        try {
            const data = await WalletModel.findById({ userId: userId });
            const totalBalance = data?.balance;
            return totalBalance;
        }
        catch (error) {
            console.log(error);
        }
    }
    async creditedWalletRepo(amount, userId, appointmentId) {
        try {
            const updatedWallet = await WalletModel.findOneAndUpdate({ userId }, {
                $set: { balance: amount },
                $push: { transactions: { appointmentId, amount, date: new Date() } }
            }, { new: true, upsert: true } // `upsert` ensures a wallet is created if none exists
            );
            return updatedWallet;
        }
        catch (error) {
            console.error("Error in creditedWalletRepo:", error);
            throw error;
        }
    }
    async findWalletByUserId(userId) {
        try {
            const walletData = await WalletModel.findOne({ userId });
            return walletData;
        }
        catch (error) {
            console.error('Error in findWalletByUserId repository:', error);
            throw error;
        }
    }
}
export default walletRepo;
