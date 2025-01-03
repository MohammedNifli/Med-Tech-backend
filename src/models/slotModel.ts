import mongoose, { Schema, Document } from 'mongoose';

interface ITimeSlotDetails {
  startDateTime: Date; 
  endDateTime: Date; 
  status: 'available' | 'booked' | 'canceled' | 'not available'; 
  consultationMode: string; 
  patient?: mongoose.Types.ObjectId | null; 
  day: string; 
}


interface ITimeSlot extends Document {
  doctor: mongoose.Types.ObjectId; 
  slots: ITimeSlotDetails[];
}


const timeSlotSchema: Schema<ITimeSlot> = new Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor', 
    required: true,
  },
  slots: [
    {
      startDateTime: {
        type: Date,
        required: true,
      },
      endDateTime: {
        type: Date,
        required: true,
        validate: {
          validator: function (this: ITimeSlotDetails) {
            return this.endDateTime > this.startDateTime; 
          },
          message: 'End date/time must be greater than start date/time',
        },
      },
      day: {
        type: String,
        required: true,
      },
      consultationMode: {
        type: String, 
        required: true,
      },
      status: {
        type: String,
        enum: ['available', 'booked', 'canceled', 'not available'], 
        default: 'available', 
      },
      patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient', 
        default: null, 
      },
    },
  ],
});


const TimeSlot = mongoose.model<ITimeSlot>('TimeSlot', timeSlotSchema);

export { TimeSlot, ITimeSlot, ITimeSlotDetails };
