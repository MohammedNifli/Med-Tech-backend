import { HttpStatusCode } from "axios";
import { IFinancialRepository } from "../Interfaces/finance/IFinancialRepository.js";
import FinancialModel from '../models/companyRevenueModel.js'




class FinancialRepository implements IFinancialRepository {

    public async addOnlineAmount(amount: number): Promise<any> {
        try {
            const addedAmount = await FinancialModel.findOneAndUpdate(
                {}, 
                {
                
                       
                        onlineShare: amount,
                
                    $push: {
                        transactionHistory: { userId: "admin", amount: amount }
                    }
                },
                {
                    new: true, 
                    upsert: true 
                }
            );
            return addedAmount;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async addOfflineAmount(amount: number): Promise<any> {
        try {
            
            const addedAmount = await FinancialModel.findOneAndUpdate(
                {}, 
                {
                    
                        
                        offlineShare: amount,
                    
                    $push: {
                        transactionHistory: { userId: "admin", amount: amount }
                    }
                },
                {
                    new: true, 
                    upsert: true 
                }
            );
            return addedAmount;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }


    public async addPremiumAmount(amount: number): Promise<any> {
        try {

            console.log('amount in repo',amount)
            const addedAmount = await FinancialModel.findOneAndUpdate(
                {}, 
                {
                    
                       
                        premiumAmount: amount,
                    
                    $push: {
                        transactionHistory: { userId: "admin", amount: amount }
                    }
                },
                {
                    new: true, 
                    upsert: true 
                }
            );

            console.log('retruned amount',addedAmount)
            return addedAmount;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async showAmountsRepo(): Promise<any> {
        try {
            // Fetch online and offline premium amounts
            const amounts = await FinancialModel.findOne({}, {totalRevenue:1, onlineShare: 1, offlineShare: 1,premiumAmount:1 }).lean();
            return amounts;
        } catch (error: any) {
            throw new Error(error.message || "Failed to fetch financial amounts from the repository");
        }
    }

    public async addAmountToRepo(userId: string, amount: number): Promise<any> {
        try {
          // Find and update the revenue document
          const result = await FinancialModel.findOneAndUpdate(
            {}, // Assuming a single document for revenue
            {
              $inc: { totalRevenue: amount }, // Increment the totalRevenue field
              $push: {
                transactionHistory: {
                  userId,
                  amount,
                },
              }, // Add transaction to history
            },
            { new: true } // Return the updated document
          );
      
          return result;
        } catch (error: any) {
          throw new Error(`Error in repository: ${error.message}`);
        }
      }
      

      public async RevenueGraphData(time: string): Promise<any> {
        try {
            const timeFormats: Record<string, string> = {
                yearly: "%Y",
                monthly: "%Y-%m",
                daily: "%Y-%m-%d"
            };
    
            const format = timeFormats[time];
            if (!format) throw new Error("Invalid time parameter");
    
            const result = await FinancialModel.aggregate([
                // Unwind transactionHistory array
                { $unwind: "$transactionHistory" },
                {
                    $group: {
                        _id: { $dateToString: { format, date: "$createdAt" } },
                        totalRevenue: { $sum: "$transactionHistory.amount" },
                    }
                },
                { $sort: { _id: 1 } } // Sort results by time
            ]);
    
            // Map result to a more usable format
            return result.map(item => ({
                date: item._id,
                totalRevenue: item.totalRevenue
            }));
        } catch (error) {
            console.error("Error fetching revenue data:", error);
            throw error;
        }
    }
    
      
      
    
}

export default FinancialRepository;
