class DoctorWalletService {
    doctorWalletRepo;
    constructor(doctorWalletRepo) {
        this.doctorWalletRepo = doctorWalletRepo;
    }
    async createWalletservice(doctorId) {
        try {
            const createdWallet = await this.doctorWalletRepo.createWalletRepo(doctorId);
            return createdWallet;
        }
        catch (error) {
            throw Error("error occured in the createWalletSrvice");
        }
    }
    async addAmountToTheWallet(data) {
        try {
            const { doctorId, amount, transactionType } = data;
            const updatedWallet = await this.doctorWalletRepo.addAmountToTheWallet({
                doctorId,
                amount,
                transactionType,
            });
            return updatedWallet;
        }
        catch (error) {
            throw new Error("Failed to add amount to wallet");
        }
    }
    async getWalletDetails(doctorId) {
        try {
            const wallet = await this.doctorWalletRepo.getWalletBalance(doctorId);
            return wallet;
        }
        catch (error) {
            throw new Error("Failed to fetch wallet details");
        }
    }
    async deductAmount(data) {
        try {
            const { doctorId, amount, transactionType } = data;
            const deductedAmount = await this.doctorWalletRepo.deductAmountFromWallet({ amount, doctorId, transactionType });
            return deductedAmount;
        }
        catch (error) {
            throw error;
        }
    }
}
export default DoctorWalletService;
