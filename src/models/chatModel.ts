import mongoose, { Schema, model, Document } from "mongoose";


export interface ChatData extends Document {
  participants: mongoose.Schema.Types.ObjectId[]; 
  lastMessage: mongoose.Schema.Types.ObjectId; 
  updatedAt: Date; 
}

// Chat Schema
const chatSchema = new Schema<ChatData>(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    ],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  {
    timestamps: true, 
  }
);

// chat Model
const ChatModel = model<ChatData>("Chat", chatSchema);
export default ChatModel;
