import { IMessageRepo } from '../Interfaces/message/IMessageRepo.js'
import Message from '../models/messageModel.js'

class MessageRepo implements IMessageRepo{
  
    public async createMessageRepo(chatId: string, sender: string, content: string): Promise<any> {
        try {
            const newSavedMessage = await Message.create({ chatId, sender, content });
            return newSavedMessage;
        } catch (error) {
            console.error("Error in createMessageRepo:", error);
            throw new Error("Error occurred while creating the message in the repository");
        }
    }



    //Message fetching repository
    public async fetchLatestMessage(messageId:string):Promise<any>{
        try{

            const latestMessage=await Message.find({_id:messageId}).sort({createdAt:-1}).limit(1);
            return latestMessage;

        }catch(error){
            console.log(error);
            throw Error('error is hitting the messge fetching reposritory')
        }
    }

    public async loadMessagesRepo(chatId:string):Promise<any>{
        try{
            const loadedMessages=await Message.find({chatId:chatId});
            return loadedMessages

        }catch(error){
            throw Error('error happened in loadMessages Repository')
            console.log(error)
        }
    }

    
}


export default MessageRepo