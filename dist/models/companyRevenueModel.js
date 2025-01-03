import mongoose, { Schema } from "mongoose";
const companyRevenueSchema = new Schema({
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
}, { timestamps: true });
const CompanyRevenue = mongoose.model("CompanyRevenue", companyRevenueSchema);
export default CompanyRevenue;
