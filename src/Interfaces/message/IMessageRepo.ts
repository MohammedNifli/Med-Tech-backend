import { IMessage } from "../../types/message.types.js";

export interface IMessageRepo{

    createMessageRepo(chatId:string,sender:string,content:string):Promise<IMessage>
    fetchLatestMessage(messageId:string):Promise<IMessage>;
    loadMessagesRepo(chatId:string):Promise<IMessage[]>
}