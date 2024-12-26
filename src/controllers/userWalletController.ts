import { Request,Response } from 'express';
import { IUserWalletService } from '../Interfaces/userWallet/IUserWalletService.js';
import { HttpStatusCode } from '../enums/httpStatusCodes.js';


class userWalletController{
    private userWalletService:IUserWalletService;
    constructor(userWalletService:IUserWalletService){
        this.userWalletService=userWalletService

    }

   public  async createWallet(req: Request, res: Response): Promise<void> {
        try {
          const  userId  = req.query.id as string; 
          const wallet = await this.userWalletService.createWalletService(userId);
          res.status(201).json({message:"wallet created",wallet});
        } catch (error:any) {
          res.status(400).json({ message: error.message });
        }
      }



      public async creditInWallet(req: Request, res: Response): Promise<any> {
        try {
            const { amount, userId, appointmentId } = req.body;
    
            if (!amount || !userId || !appointmentId) {
                return res.status(400).json({ message: "Amount, userId, and appointmentId are required." });
            }
    
            const creditedWallet = await this.userWalletService.creditInWalletService(amount, userId, appointmentId);
    
            if (creditedWallet) {
                res.status(200).json({ message: "Wallet credited successfully", wallet: creditedWallet });
            } else {
                res.status(500).json({ message: "Failed to credit wallet." });
            }
        } catch (error) {
            console.error("Error in creditInWallet controller:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    public async fetchWalletDetails(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.query.id as string;
            console.log("id heeerrrrrrrreeeeee",userId)
            const walletData = await this.userWalletService.fetchWalletDetails(userId);

            if (!walletData) {
                res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Wallet not found' });
            } else {
                res.status(HttpStatusCode.OK).json({ walletData });
            }
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error occurred in fetchWalletDetails' });
            console.error(error);
        }
    }
    
}

export  default userWalletController;