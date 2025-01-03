import FinancialModel from "../models/companyRevenueModel.js";
class FinancialRepository {
    async addOnlineAmount(amount) {
        try {
            const currentDate = new Date();
            const addedAmount = await FinancialModel.findOneAndUpdate({}, {
                $inc: { onlineShare: amount },
                $push: {
                    transactionHistory: { userId: "admin", amount: amount, date: currentDate },
                },
            }, {
                new: true,
                upsert: true,
            });
            return addedAmount;
        }
        catch (error) {
            throw new Error(`Error adding online amount: ${error.message}`);
        }
    }
    async addOfflineAmount(amount) {
        try {
            const updatedAmount = await FinancialModel.findOneAndUpdate({}, {
                $inc: { offlineShare: amount },
                $push: {
                    transactionHistory: {
                        userId: "admin",
                        amount,
                        date: new Date(),
                    },
                },
            }, {
                new: true,
                upsert: true,
            });
            if (!updatedAmount) {
                throw new Error("Failed to update offline amount.");
            }
            return updatedAmount;
        }
        catch (error) {
            throw new Error(`Error adding offline amount: ${error.message}`);
        }
    }
    async addPremiumAmount(amount) {
        try {
            const addedAmount = await FinancialModel.findOneAndUpdate({}, {
                premiumAmount: amount,
                $push: {
                    transactionHistory: { userId: "admin", amount: amount },
                },
            }, {
                new: true,
                upsert: true,
            });
            return addedAmount;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async showAmounts() {
        try {
            const amounts = await FinancialModel.findOne({}, { totalRevenue: 1, onlineShare: 1, offlineShare: 1, premiumAmount: 1 }).lean();
            return amounts;
        }
        catch (error) {
            throw new Error(error.message || "Failed to fetch financial amounts from the repository");
        }
    }
    async addAmount(userId, amount) {
        try {
            const result = await FinancialModel.findOneAndUpdate({}, {
                $inc: { totalRevenue: amount },
                $push: {
                    transactionHistory: {
                        userId,
                        amount,
                    },
                },
            }, { new: true });
            return result;
        }
        catch (error) {
            throw new Error(`Error in repository: ${error.message}`);
        }
    }
    async RevenueGraphData(time) {
        try {
            const timeFormats = {
                yearly: "%Y",
                monthly: "%Y-%m",
                daily: "%Y-%m-%d",
            };
            const format = timeFormats[time];
            if (!format)
                throw new Error("Invalid time parameter");
            const result = await FinancialModel.aggregate([
                { $unwind: "$transactionHistory" },
                {
                    $group: {
                        _id: { $dateToString: { format, date: "$createdAt" } },
                        totalRevenue: { $sum: "$transactionHistory.amount" },
                    },
                },
                { $sort: { _id: 1 } },
            ]);
            return result.map((item) => ({
                date: item._id,
                totalRevenue: item.totalRevenue,
            }));
        }
        catch (error) {
            console.error("Error fetching revenue data:", error);
            throw error;
        }
    }
}
export default FinancialRepository;
