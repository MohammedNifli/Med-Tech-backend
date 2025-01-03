import { IFinancialService } from "../Interfaces/finance/IFinancialService.js";
import { Request, Response } from "express";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import { IFinancialController } from "../Interfaces/finance/IFinancialController.js";

class FinancialController  implements IFinancialController{
  private financialService: IFinancialService;

  constructor(financialService: IFinancialService) {
    this.financialService = financialService;
  }

  public async addOnlinePayment(req: Request, res: Response): Promise<Response> {
    try {
      const { amount } = req.body;

      const addedOnlineAmount = await this.financialService.addOnlineAmount(
        amount
      );
      return res
        .status(HttpStatusCode.CREATED)
        .json({ message: "online amount added ", addedOnlineAmount });
    } catch (error) {
     return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  }

  public async addOfflinePayment(req: Request, res: Response): Promise<Response> {
    try {
      const { amount } = req.body;

      const addedOfflineAmount = await this.financialService.addOfflineAmount(
        amount
      );
      return res
        .status(HttpStatusCode.CREATED)
        .json({ message: "online amount added ", addedOfflineAmount });
    } catch (error) {
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  }

  public async premiumPayment(req: Request, res: Response): Promise<Response> {
    try {
      const { amount } = req.body;
    

      const addedPremiumAmount = await this.financialService.addPremiumAmount(
        amount
      );
      
      return res
        .status(HttpStatusCode.CREATED)
        .json({ message: "online amount added ", addedPremiumAmount });
    } catch (error) {
     return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  }

  public async showAmounts(req: Request, res: Response): Promise<Response> {
    try {
      const amounts = await this.financialService.showAmountsService();
      return res
        .status(HttpStatusCode.OK)
        .json({ message: "data fetched succefully completed", amounts });
    } catch (error) {
     return  res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  }

  public async addIntoTotalAmount(req: Request, res: Response): Promise<Response> {
    try {
      const { amount, userId } = req.body;

      if (!amount || !userId) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ success: false, message: "Amount and userId are required" });
      }

      
      const updatedRevenue = await this.financialService.addAmount(
        userId,
        amount
      );
      

      return res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Amount added successfully",
        data: updatedRevenue,
      });
    } catch (error: any) {
      
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  public async RevenueGraphDataController(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const time = req.query.time as string;
      const graphData = await this.financialService.financialService(time);
      return res
        .status(HttpStatusCode.OK)
        .json({ message: "data fetched succesfully completed", graphData });
    } catch (error: any) {
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error", error });
    }
  }
}

export default FinancialController;
