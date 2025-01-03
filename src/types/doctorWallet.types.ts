import { ObjectId } from "mongoose";


interface ITransaction {
  amount: number;
  transactionType: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  date: Date;
  _id?: ObjectId; 
}



export interface IDoctorWallet {
    
    doctorId: ObjectId;
    balance: number;
    transaction: ITransaction[]
    createdAt?:Date;
    updatedAt?:Date;
  }