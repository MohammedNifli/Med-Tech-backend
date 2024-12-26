
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import { IMessageService } from "../Interfaces/message/IMessageService.js"
import { Request,Response } from "express";



class MessageController{
    private messageService:IMessageService;

    constructor(messageService:IMessageService){
        this.messageService=messageService
    }

    public async createMessage(req: Request, res: Response): Promise<any> {
        try {
            const { chatId, sender, content } = req.body;
           
    
            // Validate input (optional but recommended)
            if (!chatId || !sender || !content) {
                return res.status(400).json({ message: "chatId, sender, and content are required" });
            }
    
            const newSavedMessage = await this.messageService.createMessageService(chatId, sender, content);
    
            // Send the saved message as a response
            res.status(201).json({ message: "Message created successfully", data: newSavedMessage });
        } catch (error:any) {
            console.error("Error in createMessage:", error);
    
            // Send error response
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error: error.message });
        }
    }

    public async fetchLatestMessage(req:Request,res:Response):Promise<any>{
        try{

            const messageId=req.query.chatId as string;
            if(!messageId){
                res.status(HttpStatusCode.BAD_REQUEST).json({message:"messageId is missing"})
            }
            const lastMessage= await this.messageService.fetchLatestMessageService(messageId)
            return res.status(HttpStatusCode.OK).json({message:"message fetched succesfully",lastMessage})

        }catch(error){
            console.log(error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"Internal Server Error occured"})
        }
    }

    public async loadChatMessages(req:Request,res:Response):Promise<any>{
        try{
            const chatId=req.query.chatId as string;
            if(!chatId){
                res.status(HttpStatusCode.BAD_REQUEST).json({message:"chatID is missing"})
            }

            const loadedMessages=await this.messageService.loadMessagesService(chatId)
            return res.status(HttpStatusCode.OK).json({message:"message loaded succesfully completed",loadedMessages})



        }catch(error){
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:'intenral server error'})
        }
    }

    
}


export default  MessageController