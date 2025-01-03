import mongoose, { Schema } from 'mongoose';
const PaymentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    appointmentId: {
        type: String,
        required: true,
        ref: "Appointment"
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    amount: {
        type: Number,
        required: true,
    },
    onlineAmount: {
        type: Number,
    },
    offlineAmount: {
        type: String,
    },
    goPremiumForChat: {
        type: String
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed'],
    },
});
const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;
