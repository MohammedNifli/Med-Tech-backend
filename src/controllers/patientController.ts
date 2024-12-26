import { Request, Response } from 'express'; 
import { IPatientService } from "../Interfaces/patient/IPatientService.js"; 
import { HttpStatusCode } from '../enums/httpStatusCodes.js'; 

class PatientController {
    private patientService: IPatientService;

    constructor(patientService: IPatientService) {
        this.patientService = patientService;
    }

    public async createPatient(req: Request, res: Response): Promise<Response> {
        try {
            const {formData}=req.body as any;
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
                dateOfBirth
            } = formData as any;
            console.log("req.body",name)

            // Validate required fields
            if (!name || !email || !age || !gender || !dateOfBirth) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Missing required fields" });
            }

            // Create patient object
            const patientData = {
                name,
                email,
                age,
                gender,
                phone,
                dateOfBirth,
                address: {
                    street:streetAddress,
                    city,
                    state,
                    country
                }
            };
            console.log(patientData.gender)

            // Call the service to create the patient
            const newPatient = await this.patientService.createPatientService(patientData);
            console.log("newPatient",newPatient)
            return res.status(HttpStatusCode.CREATED).json({ message: 'Patient created successfully',newPatient });
        } catch (error: any) {
            console.error('Error creating patient:', error);
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Error creating patient', error: error.message });
        }
    }

    public async fetchingPatient(req:Request,res:Response):Promise<any>{
        try{
            const patientId  = req.params.id;
            console.log("pateinetID",patientId)

            const patientDetails=await this.patientService.fetchingPatient(patientId);
            return res.status(HttpStatusCode.OK).json({message:"patient fetched succesfully",patientDetails})
        }catch(error){
            console.log(error)
        }
    }
}

export default PatientController;
