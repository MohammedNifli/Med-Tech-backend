import { Request, Response } from "express";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import { IPrescriptionService } from "../Interfaces/prescription/IPrescriptionService.js";

class Prescription {
  private prescriptionService: IPrescriptionService;
  constructor(prescriptionService: IPrescriptionService) {
    this.prescriptionService = prescriptionService;
  }

  public async addPrescription(req: Request, res: Response): Promise<Response> {
    try {
      const {
        patientId,
        doctorId,
        userId,
        appointmentId,
        prescription:{diagnosis,
            medicines,followUpDate,
        },
        
        
      } = req.body;
  

      console.log('the reqbody',req.body)
      // Ensure the required fields are passed as non-optional
      const prescriptionData = {
        appointmentId,
        patientId,
        userId,
        doctorId,
        diagnosis,
        medicines,
        followUpDate,
      };
  
      const addedPrescription = await this.prescriptionService.addPrescriptionService(prescriptionData);
  
      return res.status(HttpStatusCode.CREATED).json({
        message: "Prescription added successfully",
        data: addedPrescription,
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }


  public async getPrescription(req: Request, res: Response): Promise<any> {
    try {
      const appointmentId = req.query.appointmentId as string;
  
      if (!appointmentId) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Appointment ID is required" });
      }
  
      const prescription = await this.prescriptionService.getPrescriptionService(appointmentId);
  
      if (!prescription) {
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ message: "No prescription found for this appointment" });
      }
  
      res.status(HttpStatusCode.OK).json({ prescription });
    } catch (error: any) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }
  
  
}

export default Prescription;
