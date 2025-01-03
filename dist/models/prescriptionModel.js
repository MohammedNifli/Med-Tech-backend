import { Schema, model } from "mongoose";
// Define the schema for medicines
const MedicineSchema = new Schema({
    name: { type: String, },
    dosage: { type: String, },
    timing: { type: String, },
});
// Define the Prescription schema
const PrescriptionSchema = new Schema({
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    diagnosis: { type: String, },
    medicines: { type: [MedicineSchema] },
    followUpDate: { type: Date },
}, {
    timestamps: true, // Automatically creates `createdAt` and `updatedAt`
});
// Create the Prescription model
const PrescriptionModel = model("Prescription", PrescriptionSchema);
export default PrescriptionModel;
