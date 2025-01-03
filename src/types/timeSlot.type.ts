import mongoose from 'mongoose';

export interface ITimeSlotDetails {
  startDateTime: Date; 
  endDateTime: Date; 
  status: 'available' | 'booked' | 'canceled' | 'not available'; 
  consultationMode: string; 
  patient?: mongoose.Types.ObjectId | null; 
  day: string; 
}

export interface ITimeSlot extends mongoose.Document {
  doctor: mongoose.Types.ObjectId; 
  slots: ITimeSlotDetails[]; 
}
