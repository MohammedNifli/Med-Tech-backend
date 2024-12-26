import { IChatRepo } from "../Interfaces/chatInterface/IChatRepo.js";
import { IChatService } from "../Interfaces/chatInterface/IChatService.js";

class ChatService implements IChatService {
  private chatRepo: IChatRepo;

  constructor(chatRepository: IChatRepo) {
    this.chatRepo = chatRepository;
  }

  public async checkExistingChat(participants: string[]): Promise<any> {
    try {
      const existingChat = await this.chatRepo.checkExistingChat(participants);
      return existingChat;
    } catch (error) {
      console.log(error);
      throw new Error("Error occurred in the checkExistingChat service");
    }
  }

  public async createChat(participants: string[]): Promise<any> {
    try {
      const newChat = await this.chatRepo.createChat(participants);
      return newChat;
    } catch (error) {
      console.log(error);
      throw new Error("Error occurred in the createChat service");
    }
  }

  public async fetchChatsService(userId: string): Promise<any> {
    try {
      if (!userId) {
        throw new Error(
          "User ID is missing! Please verify the user is logged in."
        );
      }

      const fetchedChats = await this.chatRepo.fetchChatRepository(userId);
      return fetchedChats;
    } catch (error) {
      console.log(error);
      throw new Error("Error occurred in fetchChatsService");
    }
  }

public async fetchChatByIdService(chatId:string):Promise<any>{
  try{
    if(!chatId){
      throw Error("chatId is missing")
    }
    const fetchedChatById=await this.chatRepo.fetchChatByIdRepo(chatId);
    return fetchedChatById

  }catch(error:any){
    console.log(error)
    throw Error(error)
  }

}

public async lastMessageUpdateService(chatId: string, senderId: string): Promise<any> {
  try {
    const updatedChat = await this.chatRepo.lastMessageUpdateRepo(chatId, senderId);
    return updatedChat;
  } catch (error) {
    console.error('Error in lastMessageUpdateService:', error);
    throw new Error('Error occurred while updating the last message.');
  }
}


}

export default ChatService;
