

export interface IMessageService{
    createMessageService(chatId:string,sender:string,content:string):Promise<any>;
    fetchLatestMessageService(messageId:string):Promise<any>;
    loadMessagesService(chatId:string):Promise<any>
}
