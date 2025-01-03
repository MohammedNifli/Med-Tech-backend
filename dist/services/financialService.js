class FinancialService {
    financialRepo;
    constructor(financialRepo) {
        this.financialRepo = financialRepo;
    }
    async addOnlineAmount(amount) {
        try {
            const addedAmount = await this.financialRepo.addOnlineAmount(amount);
            return addedAmount;
        }
        catch (error) {
            throw Error(error.message);
        }
    }
    async addOfflineAmount(amount) {
        try {
            const addedAmount = await this.financialRepo.addOfflineAmount(amount);
            return addedAmount;
        }
        catch (error) {
            throw Error(error.message);
        }
    }
    async addPremiumAmount(amount) {
        try {
            const addedAmount = await this.financialRepo.addPremiumAmount(amount);
            return addedAmount;
        }
        catch (error) {
            throw Error(error.message);
        }
    }
    async showAmountsService() {
        try {
            const amounts = await this.financialRepo.showAmounts();
            return amounts;
        }
        catch (error) {
            throw Error(error.message);
        }
    }
    async addAmount(userId, amount) {
        try {
            const updatedRevenue = await this.financialRepo.addAmount(userId, amount);
            if (!updatedRevenue) {
                throw new Error('Failed to update revenue');
            }
            return updatedRevenue;
        }
        catch (error) {
            throw new Error(`Error in service: ${error.message}`);
        }
    }
    async financialService(time) {
        try {
            const data = await this.financialRepo.RevenueGraphData(time);
            return data;
        }
        catch (error) {
            throw new Error('error occured in the ', error);
        }
    }
}
export default FinancialService;
