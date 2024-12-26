import mongoose, { model, Schema, Document } from 'mongoose';

export interface IAppointmentData {
 
    userId: mongoose.Schema.Types.ObjectId;
    doctorId: mongoose.Schema.Types.ObjectId;
    patientId?: mongoose.Schema.Types.ObjectId;
    appointmentDate: any;
    status?: string;
    timeSlot: string;
    consultationMode: 'online' | 'offline';
    paymentStatus?: string;
    amount:number;
    videoCall:string;
}   
export interface IAppointment extends Document {
       
    userId: mongoose.Schema.Types.ObjectId;
    doctorId: mongoose.Schema.Types.ObjectId;
    patientId?: mongoose.Schema.Types.ObjectId; 
    appointmentDate: Date;
    status: 'pending' | 'confirmed' | 'cancelled';
    timeSlot: string;
    consultationMode: 'online' | 'offline';
    paymentStatus: 'paid' | 'unpaid';
    amount:number;
    videoCall:string;
}


const appointmentSchema = new Schema<IAppointment>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }, 
    appointmentDate: { type: Date, required: true },
    status: { type: String, required: true, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    timeSlot: { type: String, required: true }, 
    consultationMode: { type: String, enum: ['online', 'offline'], required: true },
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    amount:{type:Number},
    videoCall:{type:String}
}, { timestamps: true }); 
// In your Appointment Schema definition
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, timeSlot: 1},{unique:true});


const AppointmentModel = model<IAppointment>('Appointment', appointmentSchema);
export default AppointmentModel;
