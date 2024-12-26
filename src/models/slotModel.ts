import mongoose, { Schema, Document } from 'mongoose';

interface ITimeSlotDetails {
  startDateTime: Date; 
  endDateTime: Date; 
  status: 'available' | 'booked' | 'canceled' | 'not available'; 
  consultationMode: string; 
  patient?: mongoose.Types.ObjectId | null; 
  day: string; 
}

// Define the main TimeSlot interface
interface ITimeSlot extends Document {
  doctor: mongoose.Types.ObjectId; // Reference to Doctor model
  slots: ITimeSlotDetails[]; // Array of time slot details
}

// Create the TimeSlot schema
const timeSlotSchema: Schema<ITimeSlot> = new Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor', // Reference to the Doctor model
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
            return this.endDateTime > this.startDateTime; // Ensure the end time is after the start time
          },
          message: 'End date/time must be greater than start date/time',
        },
      },
      day: {
        type: String,
        required: true,
      },
      consultationMode: {
        type: String, // New field
        required: true,
      },
      status: {
        type: String,
        enum: ['available', 'booked', 'canceled', 'not available'], // Status of the time slot
        default: 'available', // Default status is 'available'
      },
      patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient', // Optional reference to the Patient model
        default: null, // Initially, there might not be a patient assigned
      },
    },
  ],
});

// Create the TimeSlot model using the schema
const TimeSlot = mongoose.model<ITimeSlot>('TimeSlot', timeSlotSchema);

export { TimeSlot, ITimeSlot, ITimeSlotDetails };
