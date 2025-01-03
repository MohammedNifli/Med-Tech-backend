import {Request,Response} from 'express'

export interface IChatController{
    createChat(req: Request, res: Response): Promise<Response>;
    fetchChatsController(req: Request, res: Response): Promise<Response>;
    fetchChatById(req:Request,res:Response):Promise<Response>;
    lastMessageUpdate(req: Request, res: Response): Promise<Response>

}