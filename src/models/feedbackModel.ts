import mongoose, { Document, Schema, model } from 'mongoose';

export interface FeedbackType { 
   userId: mongoose.Schema.Types.ObjectId;
   doctorId: mongoose.Schema.Types.ObjectId;
   patientId: mongoose.Schema.Types.ObjectId; // Corrected from pateintId
   feedback: string;
   rating: number;
}

export interface FeedbackDocument extends FeedbackType, Document {
    hasAdded: boolean;
}

const feedbackSchema = new Schema<FeedbackDocument>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    feedback: { type: String, required: true },
    rating: { type: Number, required: true },
    hasAdded: { type: Boolean, default: true }
});

const FeedbackModel = model<FeedbackDocument>('Feedback', feedbackSchema);

export default FeedbackModel;
