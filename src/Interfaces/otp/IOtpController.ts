import {Request,Response} from 'express';

export interface IOtpController{
    sendOTp(req: Request, res: Response):Promise<Response>;
    verifyOTP(req: Request, res: Response): Promise<void>
    verifyDocOTP(req: Request, res: Response) :Promise<Response>
}