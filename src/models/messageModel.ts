import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Schema.Types.ObjectId; 
  sender: mongoose.Schema.Types.ObjectId; 
  content: string; 
  createdAt: Date; 
  updatedAt: Date;
  readBy?: mongoose.Schema.Types.ObjectId[];
  isDeleted?: boolean; 
}

const messageSchema = new Schema<IMessage>(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true, 
  }
);

const MessageModel = mongoose.model<IMessage>('Message', messageSchema);

export default MessageModel;
