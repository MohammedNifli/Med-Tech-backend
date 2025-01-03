import mongoose, { Schema, model } from 'mongoose';
const feedbackSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    feedback: { type: String, required: true },
    rating: { type: Number, required: true },
    hasAdded: { type: Boolean, default: true }
});
const FeedbackModel = model('Feedback', feedbackSchema);
export default FeedbackModel;
