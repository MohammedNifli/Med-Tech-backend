import mongoose, { Schema } from 'mongoose';
const timeSlotSchema = new Schema({
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
                    validator: function () {
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
const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);
export { TimeSlot };
