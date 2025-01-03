
import { Request,Response } from "express";


export interface IMessageController{
    createMessage(req: Request, res: Response): Promise<Response>;
    fetchLatestMessage(
        req: Request,
        res: Response
      ): Promise<Response> ;
      loadChatMessages(
        req: Request,
        res: Response
      ): Promise<Response>
}