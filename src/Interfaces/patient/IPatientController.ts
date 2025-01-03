import { Request,Response } from "express";

export interface IPatientController{
    createPatient(req: Request, res: Response): Promise<Response> ;
    fetchingPatient(req: Request, res: Response): Promise<Response>

}