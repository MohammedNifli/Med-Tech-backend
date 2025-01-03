import mongoose, { Schema, model } from "mongoose";
// Chat Schema
const chatSchema = new Schema({
    participants: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    ],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
}, {
    timestamps: true,
});
// chat Model
const ChatModel = model("Chat", chatSchema);
export default ChatModel;
