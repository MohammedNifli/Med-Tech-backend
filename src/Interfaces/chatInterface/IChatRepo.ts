export interface IChatRepo{

   checkExistingChat(participants:string[]):Promise<any>;
    createChat(participants:string[]):Promise<any>;
    fetchChatRepository(userId: string): Promise<any> 
    fetchChatByIdRepo(chatId:string):Promise<any>
    lastMessageUpdateRepo(chatId:string,senderId:string):Promise<any>
}