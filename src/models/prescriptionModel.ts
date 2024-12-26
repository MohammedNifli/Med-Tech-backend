import mongoose, { Schema, Document, model } from "mongoose";

// Define the Medicine interface for the medicines array
interface Medicine {
  name: string;
  dosage: string;
  timing: string;
}

// Define the Prescription interface extending Mongoose's Document
export interface PrescriptionDocument extends Document {
  appointmentId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  userId:mongoose.Types.ObjectId;
  diagnosis: string;
  medicines: Medicine[];
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for medicines
const MedicineSchema: Schema = new Schema<Medicine>({
  name: { type: String, },
  dosage: { type: String, },
  timing: { type: String, },
});

// Define the Prescription schema
const PrescriptionSchema: Schema = new Schema<PrescriptionDocument>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    userId:{type:Schema.Types.ObjectId,ref:'User'},
    diagnosis: { type: String,},
    medicines: { type: [MedicineSchema] },
    followUpDate: { type: Date },
  },
  {
    timestamps: true, // Automatically creates `createdAt` and `updatedAt`
  }
);

// Create the Prescription model
const PrescriptionModel = model<PrescriptionDocument>("Prescription", PrescriptionSchema);

export default PrescriptionModel;

