
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import { IDoctorWalletService } from "../Interfaces/doctorWallet/IDoctorWalletService.js"
import { Request,Response } from "express";

class DoctorWalletController{

    private doctorWalletService:IDoctorWalletService;
    constructor(doctorWalletService:IDoctorWalletService){
        this.doctorWalletService=doctorWalletService
    }


    public async createWallet(req:Request,res:Response):Promise<any>{
        try{

            const doctorId=req.query.id as string;
            console.log('doctorId',doctorId)
            const createdWallet=await this.doctorWalletService.createWalletservice(doctorId);
            return res.status(HttpStatusCode.CREATED).json({message:"wallet created successfully ",createdWallet})

        }catch(error){
            console.log(error);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"internal server error occured in the create wallet"})
        }
    }


    public async addAmountToTheWallet(req: Request, res: Response): Promise<any> {
        try {
          const { doctorId, amount, transactionType } = req.body;
    
          if (!doctorId || !amount || !transactionType) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Missing required fields" });
          }
    
          const updatedWallet = await this.doctorWalletService.addAmountToTheWallet({
            doctorId,
            amount,
            transactionType,
          });
    
          res.status(HttpStatusCode.OK).json({
            message: "Amount added successfully",
            wallet: updatedWallet,
          });
        } catch (error) {
          console.error("Error in addAmountToTheWallet:", error);
          res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
        }
      }
    
      // Fetch wallet balance and transactions
      public async getWalletDetails(req: Request, res: Response): Promise<any> {
        try {
          const  doctorId  = req.query.id as string;
    
          if (!doctorId) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Doctor ID is required" });
          }
    
          const wallet = await this.doctorWalletService.getWalletDetails(doctorId);
          res.status(HttpStatusCode.OK).json({ wallet });
        } catch (error) {
          console.error("Error in getWalletDetails:", error);
          res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
        }
      }


      public async deductAmount(req:Request,res:Response):Promise<any>{
        try{
            const{doctorId,amount,transactionType}=req.body
            const deductedAmount=await this.doctorWalletService.deductAmount({amount,doctorId,transactionType});
            return res.status(HttpStatusCode.OK).json({message:"ok",deductedAmount})

        }catch(error){
            console.log(error)
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"Internal server error"})
        }
      }

    
    
}

export default DoctorWalletController