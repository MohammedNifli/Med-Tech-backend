class userWalletService {
    userWalletRepo;
    constructor(userWalletRepo) {
        this.userWalletRepo = userWalletRepo;
    }
    async createWalletService(userId) {
        try {
            const createdWallet = await this.userWalletRepo.createWallet(userId);
            return createdWallet;
        }
        catch (error) {
            console.log(error);
        }
    }
    async creditInWalletService(amount, userId, appointmentId) {
        try {
            const currentBalance = await this.userWalletRepo.findWallet(userId);
            const totalAmount = amount + (currentBalance || 0);
            const creditedWallet = await this.userWalletRepo.creditedWalletRepo(totalAmount, userId, appointmentId);
            return creditedWallet;
        }
        catch (error) {
            console.error("Error in creditInWalletService:", error);
            throw error;
        }
    }
    async fetchWalletDetails(userId) {
        try {
            const walletData = await this.userWalletRepo.findWalletByUserId(userId);
            return walletData;
        }
        catch (error) {
            console.error('Error in fetchWalletDetails service:', error);
            throw error;
        }
    }
}
export default userWalletService;
