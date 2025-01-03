import { Request, Response } from "express";
import { IPatientService } from "../Interfaces/patient/IPatientService.js";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import { IPatientController } from "../Interfaces/patient/IPatientController.js";

class PatientController implements IPatientController {
  private patientService: IPatientService;

  constructor(patientService: IPatientService) {
    this.patientService = patientService;
  }

  public async createPatient(req: Request, res: Response): Promise<Response> {
    try {
      const { formData } = req.body as any;
      const {
        name,
        email,
        age,
        gender,
        phone,
        streetAddress,
        city,
        state,
        country,
        dateOfBirth,
      } = formData as any;
      

      if (!name || !email || !age || !gender || !dateOfBirth) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Missing required fields" });
      }

      const patientData = {
        name,
        email,
        age,
        gender,
        phone,
        dateOfBirth,
        address: {
          street: streetAddress,
          city,
          state,
          country,
        },
      };
    

      const newPatient = await this.patientService.createPatientService(
        patientData
      );

      return res
        .status(HttpStatusCode.CREATED)
        .json({ message: "Patient created successfully", newPatient });
    } catch (error: any) {
    
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error creating patient", error: error.message });
    }
  }

  public async fetchingPatient(req: Request, res: Response): Promise<Response> {
    try {
      const patientId = req.params.id;

      const patientDetails = await this.patientService.fetchingPatient(
        patientId
      );
      return res
        .status(HttpStatusCode.OK)
        .json({ message: "patient fetched succesfully", patientDetails });
    } catch (error) {
      throw error;
    }
  }
}

export default PatientController;
