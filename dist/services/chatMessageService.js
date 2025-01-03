class ChatMessageService {
    messageRepository;
    constructor(messageRepository) {
        this.messageRepository = messageRepository;
    }
    async createMessageService(chatId, sender, content) {
        try {
            const newMessage = await this.messageRepository.createMessageRepo(chatId, sender, content);
            return newMessage;
        }
        catch (error) {
            console.error("Error in createMessageService:", error);
            throw new Error("Error occurred while creating the message in the service");
        }
    }
    async fetchLatestMessageService(messageId) {
        try {
            const latestMessage = await this.messageRepository.fetchLatestMessage(messageId);
            return latestMessage;
        }
        catch (error) {
            console.log(error);
            throw Error("error occurin in the fetchLatestMessageService");
        }
    }
    async loadMessagesService(chatId) {
        try {
            if (!chatId) {
                throw Error('chat id is missing');
            }
            const loadedMessages = await this.messageRepository.loadMessagesRepo(chatId);
            return loadedMessages;
        }
        catch (error) {
            throw Error('error is occuring in the loadMessage service');
        }
    }
}
export default ChatMessageService;
