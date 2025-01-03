import { IMessageService } from "../Interfaces/message/IMessageService.js"
import { IMessageRepo } from "../Interfaces/message/IMessageRepo.js"
import MessageRepo from "../repositories/messageRepo.js"
import { IMessage } from "../types/message.types.js"


class ChatMessageService implements IMessageService{
    private messageRepository:IMessageRepo
    constructor(messageRepository:IMessageRepo){
        this.messageRepository=messageRepository

    }

    public async createMessageService(chatId: string, sender: string, content: string): Promise<IMessage> {
        try {
            const newMessage = await this.messageRepository.createMessageRepo(chatId, sender, content);
            return newMessage;
        } catch (error) {
            console.error("Error in createMessageService:", error);
            throw new Error("Error occurred while creating the message in the service");
        }
    }

    public async fetchLatestMessageService(messageId:string):Promise<IMessage>{
        try{
            const  latestMessage=await this.messageRepository.fetchLatestMessage(messageId);
            return latestMessage;

        }catch(error){
            console.log(error)
            throw Error("error occurin in the fetchLatestMessageService")
        }
    }

    public async loadMessagesService(chatId:string):Promise<IMessage[]>{
        try{
            if(!chatId){
                throw Error('chat id is missing')
            }

            const loadedMessages=await this.messageRepository.loadMessagesRepo(chatId);
            return loadedMessages;

        }catch(error){
            throw Error('error is occuring in the loadMessage service')
        }
    }

}


export default ChatMessageService
