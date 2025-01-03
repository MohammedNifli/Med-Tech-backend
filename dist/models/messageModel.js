import mongoose, { Schema } from 'mongoose';
const messageSchema = new Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
});
const MessageModel = mongoose.model('Message', messageSchema);
export default MessageModel;
