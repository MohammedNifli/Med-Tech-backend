import { model, Schema } from 'mongoose';
const otpSchema = new Schema({
    email: { type: String, required: true },
    otpHash: { type: String, required: true },
    expirationTime: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 15 * 1000),
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});
const otpModel = model('Otp', otpSchema);
export default otpModel;
