import {Request,Response} from 'express';

export interface IPrescriptionController{
    addPrescription(req: Request, res: Response): Promise<Response>;
    getPrescription(req: Request, res: Response): Promise<Response>;
    eidtPrescription(req:Request,res:Response):Promise<Response>;
}