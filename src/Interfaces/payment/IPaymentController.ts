import {Request,Response} from 'express';

export interface IPaymentController{
    addPayment(req: Request, res: Response): Promise<void> 
}