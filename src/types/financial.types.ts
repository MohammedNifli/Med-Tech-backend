import { ObjectId } from "mongoose";


interface TransactionHistory {
    userId: string;
    amount: number;
    date: Date;
  }


export interface IFinance{
    _id:ObjectId;
    totalRevenue: number;
    transactionHistory: TransactionHistory[];
    onlineShare: number;
    offlineShare: number;
    premiumAmount: number;
    createdAt?:Date

}