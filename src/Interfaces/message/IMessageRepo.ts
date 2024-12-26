
export interface IMessageRepo{

    createMessageRepo(chatId:string,sender:string,content:string):Promise<any>
    fetchLatestMessage(messageId:string):Promise<any>;
    loadMessagesRepo(chatId:string):Promise<any>
}