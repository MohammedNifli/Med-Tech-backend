import {Request,Response} from 'express'

export interface IFinancialController{
    addIntoTotalAmount(req: Request, res: Response): Promise<Response>
    addOnlinePayment(req: Request, res: Response): Promise<Response>;
    addOfflinePayment(req: Request, res: Response): Promise<Response> ;
    premiumPayment(req: Request, res: Response): Promise<Response>
    showAmounts(req: Request, res: Response): Promise<Response> ;
    addIntoTotalAmount(req: Request, res: Response): Promise<Response> ;
    RevenueGraphDataController(
        req: Request,
        res: Response
      ): Promise<Response> ;
}