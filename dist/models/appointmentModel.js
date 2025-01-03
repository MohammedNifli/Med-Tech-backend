import mongoose, { model, Schema } from 'mongoose';
const appointmentSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    appointmentDate: { type: Date, required: true },
    status: { type: String, required: true, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    timeSlot: { type: String, required: true },
    consultationMode: { type: String, enum: ['online', 'offline'], required: true },
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    amount: { type: Number },
    videoCall: { type: String }
}, { timestamps: true });
// In your Appointment Schema definition
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, timeSlot: 1 }, { unique: true });
const AppointmentModel = model('Appointment', appointmentSchema);
export default AppointmentModel;
