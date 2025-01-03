import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    gender: { type: String },
    role: { type: String },
    photo: { type: String },
    isBlocked: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
});
const User = mongoose.model('User', userSchema);
export default User;
