import { Schema, model } from "mongoose";
const patientSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, },
    dateOfBirth: { type: Date, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    phone: { type: String, required: true },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
const PatientModel = model("Patient", patientSchema);
export default PatientModel;
