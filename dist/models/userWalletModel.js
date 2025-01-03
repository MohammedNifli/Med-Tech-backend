import mongoose, { Schema } from 'mongoose';
// Create the Wallet schema
const walletSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User collection
        required: true,
    },
    balance: {
        type: Number,
        default: 0, // Initial balance is 0
    },
    transactions: [
        {
            amount: {
                type: Number,
                required: true,
            },
            transactionType: {
                type: String,
                enum: ['deposit', 'withdrawal', 'payment', 'refund'],
                required: true,
            },
            date: {
                type: Date,
                default: Date.now,
            },
            referenceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Appointment', // You can change this if you need a different reference
                required: false,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true, // Automatically handle createdAt and updatedAt
});
// Update `updatedAt` field before saving
walletSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
// Create the Wallet model
const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;
