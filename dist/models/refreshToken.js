import mongoose, { Schema } from "mongoose";
// Define the refresh token schema
const refreshTokenSchema = new Schema({
    token: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
});
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
