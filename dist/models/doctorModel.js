import { Schema, model } from "mongoose";
// Schema Definition
const doctorSchema = new Schema({
    personalInfo: {
        name: { type: String, required: true },
        gender: { type: String, enum: ['Male', 'Female', 'Other'] },
        profilePicture: { type: String },
        dateOfBirth: { type: Date },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            country: { type: String },
            postalCode: { type: String },
        },
    },
    professionalInfo: {
        specialization: { type: String },
        qualifications: [
            {
                degree: { type: String },
                institution: { type: String },
                year: { type: Number },
            },
        ],
        experience: { type: Number, default: 0 },
        licenseNumber: { type: String, unique: false },
        licenseFile: [
            {
                title: { type: String },
                file: { type: String }
            }
        ],
        certificates: [
            {
                title: { type: String },
                file: { type: String },
            },
        ],
        languages: [{ type: String }],
    },
    practiceInfo: {
        clinics: [
            {
                name: { type: String },
                address: { type: String },
                contactNumber: { type: String },
            },
        ],
        consultationModes: {
            online: { type: Boolean, default: false },
            offline: { type: Boolean, default: false },
        },
    },
    financialInfo: {
        consultationFees: {
            online: { type: Number },
            offline: { type: Number },
        },
    },
    accountStatus: {
        isActive: { type: Boolean, default: true },
        verificationStatus: {
            type: String,
            enum: ['Pending', 'Verified', 'Rejected', 'Not Applied'],
            default: 'Not Applied',
        },
    },
    isBlocked: { type: Boolean, default: false },
}, { timestamps: true });
const DoctorModel = model('Doctor', doctorSchema);
export default DoctorModel;
