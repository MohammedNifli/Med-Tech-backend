class ChatService {
    chatRepo;
    constructor(chatRepository) {
        this.chatRepo = chatRepository;
    }
    async checkExistingChat(participants) {
        try {
            const existingChat = await this.chatRepo.checkExistingChat(participants);
            return existingChat;
        }
        catch (error) {
            console.log(error);
            throw new Error("Error occurred in the checkExistingChat service");
        }
    }
    async createChat(participants) {
        try {
            const newChat = await this.chatRepo.createChat(participants);
            return newChat;
        }
        catch (error) {
            console.log(error);
            throw new Error("Error occurred in the createChat service");
        }
    }
    async fetchChatsService(userId) {
        try {
            if (!userId) {
                throw new Error("User ID is missing! Please verify the user is logged in.");
            }
            const fetchedChats = await this.chatRepo.fetchChatRepository(userId);
            return fetchedChats;
        }
        catch (error) {
            console.log(error);
            throw new Error("Error occurred in fetchChatsService");
        }
    }
    async fetchChatByIdService(chatId) {
        try {
            if (!chatId) {
                throw Error("chatId is missing");
            }
            const fetchedChatById = await this.chatRepo.fetchChatByIdRepo(chatId);
            return fetchedChatById;
        }
        catch (error) {
            console.log(error);
            throw Error(error);
        }
    }
    async lastMessageUpdateService(chatId, senderId) {
        try {
            const updatedChat = await this.chatRepo.lastMessageUpdateRepo(chatId, senderId);
            return updatedChat;
        }
        catch (error) {
            console.error('Error in lastMessageUpdateService:', error);
            throw new Error('Error occurred while updating the last message.');
        }
    }
}
export default ChatService;
