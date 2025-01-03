import {Request,Response} from 'express';

export interface ITimeSlotController{
    addTimeSlots(req: Request, res: Response): Promise<Response>;
    fetchSlots(req: Request, res: Response): Promise<Response>;
    fetchDoctorAllSlots(req: Request, res: Response): Promise<Response>;
    deleteTimeSlot(req: Request, res: Response): Promise<Response> ;
    editTimeSlot(req: Request, res: Response): Promise<Response> ;
    changeSlotStatus(req: Request, res: Response): Promise<Response> 
}