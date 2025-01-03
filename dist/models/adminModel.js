import { model, Schema } from "mongoose";
const AdminSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    role: { type: String, default: 'admin' },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });
const Admin = model('Admin', AdminSchema);
export default Admin;
