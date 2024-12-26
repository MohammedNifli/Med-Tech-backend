import { model, Document, Schema } from "mongoose";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
  isVerified: boolean;
}

export interface IAdminInput {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role?: string;
  isVerified?: boolean;
}

const AdminSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const Admin = model<IAdmin>('Admin', AdminSchema);

export default Admin;