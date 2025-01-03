import {Request,Response} from 'express';

export interface IDoctorWalletController {
    createWallet(req: Request, res: Response): Promise<Response> ;
    addAmountToTheWallet(req: Request, res: Response): Promise<Response>;
    getWalletDetails(req: Request, res: Response): Promise<Response> 
    deductAmount(req: Request, res: Response): Promise<Response>
}