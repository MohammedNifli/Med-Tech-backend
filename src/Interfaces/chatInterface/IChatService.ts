export interface IChatService {
    checkExistingChat(participants: string[]): Promise<any>;
    createChat(participants: string[]): Promise<any>;
    fetchChatsService(userId: string): Promise<any>
    fetchChatByIdService(chatId:string):Promise<any>;
    lastMessageUpdateService(chatId:string,senderId:string):Promise<any>
}
