import { IDoctorWalletRepo } from "../Interfaces/doctorWallet/IDoctorWalletRepo.js";
import DoctorWallet from "../models/doctorWalletModel.js";
import { IDoctorWallet } from "../types/doctorWallet.types.js";
import{IWallet} from '../models/doctorWalletModel.js'

class DoctorWalletRepo implements IDoctorWalletRepo {
  public async createWalletRepo(doctorId: string): Promise<IWallet > {
    try {
      const createdWallet = new DoctorWallet({
        doctorId,
        balance: 0,
        transaction: [],
      });
      if(!createdWallet){
        throw new Error('An error occured in the createWallet ')
      }
      return await createdWallet.save();
    } catch (error) {
      
      throw Error("error occured in the createWallet repository");
    }
  }

  public async addAmountToTheWallet(data: {
    doctorId: string;
    amount: number;
    transactionType: string;
  }): Promise<any> {
    try {
      const { doctorId, amount, transactionType } = data;

      
      const updatedWallet = await DoctorWallet.findOneAndUpdate(
        { doctorId },
        {
          $inc: { balance: amount },
          $push: {
            transactions: {
              amount,
              transactionType,
              date: new Date(),
            },
          },
        },
        { new: true, upsert: true }
      );

      return updatedWallet;
    } catch (error) {
      console.error("Error adding amount to wallet:", error);
      throw new Error("Failed to add amount to wallet");
    }
  }

  public async getWalletBalance(doctorId: string): Promise<IWallet> {
    try {
      const wallet = await DoctorWallet.findOne({ doctorId }).select(
        "balance transactions"
      );
      if (!wallet) {
        throw new Error("Wallet not found for the given doctor ID");
      }
      return wallet;
    } catch (error) {
    
      throw new Error("Failed to fetch wallet balance");
    }
  }

  public async deductAmountFromWallet(data: {
    doctorId: string;
    amount: number;
    transactionType: string;
  }): Promise<any> {
    try {
      const { doctorId, amount, transactionType } = data;

      const wallet = await DoctorWallet.findOne({ doctorId });
      if (!wallet || wallet.balance < amount) {
        throw new Error("Insufficient balance or wallet not found");
      }

      wallet.balance -= amount;
      wallet.transactions.push({
        amount,
        transactionType: "withdrawal",
        date: new Date(),
      });

      await wallet.save();

      return wallet;
    } catch (error) {
      
      throw new Error("Failed to deduct amount from wallet");
    }
  }

  public async getWalletDetails(doctorId: string): Promise<any> {
    try {
      const walletDetails = await DoctorWallet.find({ doctorId: doctorId });
      return walletDetails;
    } catch (error) {
      
      throw Error("error occured in getwaller details repo");
    }
  }
}

export default DoctorWalletRepo;
