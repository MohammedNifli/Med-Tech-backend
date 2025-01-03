import { Request,Response } from "express";
export interface IUserWalletController{
    createWallet(req: Request, res: Response): Promise<void> ;
    creditInWallet(req: Request, res: Response): Promise<any>;
    fetchWalletDetails(req: Request, res: Response): Promise<void> 

}