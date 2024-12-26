import { Document, Schema, model } from "mongoose";


interface IPatient extends Document {
    name: string;
    email: string;
    dateOfBirth:Date,
    age: number;
    gender: "Male" | "Female" | "Other";
    phone:string;
    address: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
    };
    createdAt: Date;
    updatedAt: Date; 
}


const patientSchema = new Schema<IPatient>({
    name: { type: String, required: true },
    email: { type: String, }, 
    dateOfBirth:{type:Date,required:true},
    age: { type: Number, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    phone:{type:String,required:true},
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String }
    },
    createdAt: { type: Date, default: Date.now }, 
    updatedAt: { type: Date, default: Date.now }  
}, { timestamps: true }); 


const PatientModel = model<IPatient>("Patient", patientSchema);
export default PatientModel;
