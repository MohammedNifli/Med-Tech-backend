import mongoose, { Schema, Document, Model } from "mongoose";

interface TransactionHistory {
  userId: string;
  amount: number;
  date: Date;
}

interface ICompanyRevenue extends Document {
  totalRevenue: number;
  transactionHistory: TransactionHistory[];
  onlineShare: number;
  offlineShare: number;
  premiumAmount: number;
}

const companyRevenueSchema = new Schema<ICompanyRevenue>(
  {
    totalRevenue: {
      type: Schema.Types.Number,
    },
    transactionHistory: [
      {
        userId: { type: Schema.Types.String },
        amount: { type: Schema.Types.Number },
        date: { type: Schema.Types.Date, default: Date.now },
      },
    ],
    onlineShare: {
      type: Schema.Types.Number,
    },
    offlineShare: {
      type: Schema.Types.Number,
    },
    premiumAmount: {
      type: Schema.Types.Number,
    },
  },
  { timestamps: true }
);

const CompanyRevenue: Model<ICompanyRevenue> = mongoose.model<ICompanyRevenue>(
  "CompanyRevenue",
  companyRevenueSchema
);

export default CompanyRevenue;
