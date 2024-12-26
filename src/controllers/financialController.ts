
import { IFinancialService } from "../Interfaces/finance/IFinancialService.js";
import { Request, Response } from "express";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";

class FinancialController {
    private financialService: IFinancialService;

    constructor(financialService: IFinancialService) {
        this.financialService = financialService;  
    }

    public async addOnlinePayment(req:Request,res:Response):Promise<any>{
        try{
            const {amount}=req.body;

            const addedOnlineAmount=await this.financialService.addOnlineAmount(amount)
            return res.status(HttpStatusCode.CREATED).json({message:"online amount added ",addedOnlineAmount})


        }catch(error){
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"Internal Server Error"})
        }
    }

    public async addOfflinePayment(req:Request,res:Response):Promise<any>{
        try{
            const {amount}=req.body;

            const addedOfflineAmount=await this.financialService.addOfflineAmount(amount)
            return res.status(HttpStatusCode.CREATED).json({message:"online amount added ",addedOfflineAmount})


        }catch(error){
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"Internal Server Error"})
        }
    }

    public async premiumPayment(req:Request,res:Response):Promise<any>{
        try{
            const {amount}=req.body;
            console.log('amoutn',amount)

            const addedPremiumAmount=await this.financialService.addPremiumAmount(amount)
            console.log('addedPremiumAmount',addedPremiumAmount)
            return res.status(HttpStatusCode.CREATED).json({message:"online amount added ",addedPremiumAmount})


        }catch(error){
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"Internal Server Error"})
        }
    }

    public async showAmounts(req:Request,res:Response):Promise<any>{
        try{
            const amounts=await this.financialService.showAmountsService()
            return res.status(HttpStatusCode.OK).json({message:"data fetched succefully completed",amounts})

        }catch(error){
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"Internal Server Error"})
        }
    }


    public async addIntoTotalAmount(req: Request, res: Response): Promise<any> {
        try {
          const { amount, userId } = req.body;
          console.log('woo',req.body)
      
          if (!amount || !userId) {
            return res.status(400).json({ success: false, message: 'Amount and userId are required' });
          }
      
          // Call service to add the amount
          const updatedRevenue = await this.financialService.addAmount(userId, amount);
          console.log('ngn',updatedRevenue)
      
          return res.status(200).json({
            success: true,
            message: 'Amount added successfully',
            data: updatedRevenue,
          });
        } catch (error: any) {
          console.error('Error in controller:', error.message);
          return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
          });
        }
      }


      public async RevenueGraphDataController(req:Request,res:Response):Promise<any>{
        try{
            const time=req.query.time as string;
            const graphData=await this.financialService.financialService(time);
            return res.status(HttpStatusCode.OK).json({message:"data fetched succesfully completed",graphData})

        }catch(error:any){
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"Internal server error",error})
        }
      }

}


export default FinancialController;