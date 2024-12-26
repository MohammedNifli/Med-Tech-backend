import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the interface for transaction history
interface TransactionHistory {
  userId: string;
  amount: number;
  date:Date;
}

// Define the Company Revenue interface
interface ICompanyRevenue extends Document {
  totalRevenue: number;
  transactionHistory: TransactionHistory[];
  onlineShare: number;
  offlineShare: number;
  premiumAmount: number;
}

// Define the Company Revenue schema
const companyRevenueSchema = new Schema<ICompanyRevenue>({
  totalRevenue: {
    type: Schema.Types.Number,
    
  },
  transactionHistory: [{
    userId: { type: Schema.Types.String,  },
    amount: { type: Schema.Types.Number,  },
    date:{type:Schema.Types.Date,default:Date.now}
  }],
  onlineShare: {
    type: Schema.Types.Number,
    
  },
  offlineShare: {
    type: Schema.Types.Number,
   
  },
  premiumAmount: {
    type: Schema.Types.Number,
     // Required field
  },
}, { timestamps: true }); // Optionally add timestamps for creation and updates

// Create and export the Company Revenue model
const CompanyRevenue: Model<ICompanyRevenue> = mongoose.model<ICompanyRevenue>(
  'CompanyRevenue',
  companyRevenueSchema
);

export default CompanyRevenue;
