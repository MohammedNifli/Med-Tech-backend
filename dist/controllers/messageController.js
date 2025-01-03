import { HttpStatusCode } from "../enums/httpStatusCodes.js";
class MessageController {
    messageService;
    constructor(messageService) {
        this.messageService = messageService;
    }
    async createMessage(req, res) {
        try {
            const { chatId, sender, content } = req.body;
            if (!chatId || !sender || !content) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "chatId, sender, and content are required" });
            }
            const newSavedMessage = await this.messageService.createMessageService(chatId, sender, content);
            return res
                .status(HttpStatusCode.CREATED)
                .json({
                message: "Message created successfully",
                data: newSavedMessage,
            });
        }
        catch (error) {
            console.error("Error in createMessage:", error);
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal server error", error: error.message });
        }
    }
    async fetchLatestMessage(req, res) {
        try {
            const messageId = req.query.chatId;
            if (!messageId) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "messageId is missing" });
            }
            const lastMessage = await this.messageService.fetchLatestMessageService(messageId);
            return res
                .status(HttpStatusCode.OK)
                .json({ message: "message fetched succesfully", lastMessage });
        }
        catch (error) {
            console.log(error);
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal Server Error occured" });
        }
    }
    async loadChatMessages(req, res) {
        try {
            const chatId = req.query.chatId;
            if (!chatId) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "chatID is missing" });
            }
            const loadedMessages = await this.messageService.loadMessagesService(chatId);
            return res
                .status(HttpStatusCode.OK)
                .json({
                message: "message loaded succesfully completed",
                loadedMessages,
            });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "intenral server error" });
        }
    }
}
export default MessageController;
