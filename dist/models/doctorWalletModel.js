import mongoose, { Schema } from 'mongoose';
const walletSchema = new Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    transactions: [
        {
            amount: {
                type: Number,
                required: true,
            },
            transactionType: {
                type: String,
                enum: ['credited', 'debited', 'payment', 'refund'],
                required: true,
            },
            date: {
                type: Date,
                default: Date.now,
            },
            referenceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Appointment',
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
    timestamps: true,
});
walletSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const Wallet = mongoose.model('Doctor-Wallet', walletSchema);
export default Wallet;
