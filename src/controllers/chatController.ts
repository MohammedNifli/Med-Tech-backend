import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import { IChatService } from "../Interfaces/chatInterface/IChatService.js";
import { Request, Response } from "express";
import { IChatController } from "../Interfaces/chatInterface/IChatController.js";

class ChatController implements IChatController {
  private chatService: IChatService;
  constructor(chatService: IChatService) {
    this.chatService = chatService;
  }

  public async createChat(req: Request, res: Response): Promise<Response> {
    try {
      const { participants } = req.body;
      
      if (
        !participants ||
        !Array.isArray(participants) ||
        participants.length < 2
      ) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({
            message:
              "Invalide participants . provide atleast two user IDs in an array",
          });
      }

      const existingChat = await this.chatService.checkExistingChat(
        participants
      );
      if (existingChat) {
        return res.status(HttpStatusCode.CONFLICT).json({
          message: "Chat already exists between these participants.",
          chat: existingChat,
        });
      }
      const newChat = await this.chatService.createChat(participants);

      return res
        .status(HttpStatusCode.CREATED)
        .json({ message: "chat created succesfully completed", newChat });
    } catch (error) {
      console.log(error);
     return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: "Internal server error occuring in the create Chat method",
        });
    }
  }

  public async fetchChatsController(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.query.id as string;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const fetchedChats = await this.chatService.fetchChatsService(userId);
      
      return res.status(HttpStatusCode.OK).json({ data: fetchedChats });
    } catch (error) {
      console.log(error);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error occurred in the fetchChatsController",
      });
    }
  }


  public async fetchChatById(req:Request,res:Response):Promise<Response>{
    const chatId=req.query.chatId as string;
    
    if(!chatId){
     return res.status(HttpStatusCode.BAD_REQUEST).json({message:"chat ID is missing in the request"})
    }
    try{
      const fetchedChatById=await this.chatService.fetchChatByIdService(chatId)
      return res.status(HttpStatusCode.OK).json({messsage:"chat fetched succesfully completed",fetchedChatById})

    }catch(error){
      
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"internal server error in fetchChatById controller"})
    }
  }


  public async lastMessageUpdate(req: Request, res: Response): Promise<Response> {
    try {
      const { chatId, senderId } = req.body;

      
      if (!chatId || !senderId) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          message: 'chatId and senderId are required.',
        });
      }

      const updatedChat = await this.chatService.lastMessageUpdateService(chatId, senderId);

      if (!updatedChat) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          message: 'Chat not found or could not be updated.',
        });
      }

      return res.status(HttpStatusCode.OK).json({
        message: 'Last message updated successfully',
        updatedChat,
      });
    } catch (error) {
    
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error in the lastMessageController',
      });
    }
  }


}

export default ChatController;
