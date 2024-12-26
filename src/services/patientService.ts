import { IPatientService } from '../Interfaces/patient/IPatientService.js';
import { IPatientRepo } from '../Interfaces/patient/IPatientRepo.js';
import PatientModel from '../models/patientModel.js'; // Import the patient model
import appointmentRepo from '../repositories/appointmentRepo.js';

class PatientService implements IPatientService {
    private patientRepo: IPatientRepo;

    constructor(patientRepo: IPatientRepo) {
        this.patientRepo = patientRepo;
    }

    public async createPatientService(patientData: any): Promise<any> {
        try {
            // Use the repository to create a new patient
            const patient=await this.patientRepo.createPatient(patientData);
            return patient;
        } catch (error) {
            console.log('Error in patient service:', error);
            throw error; // Rethrow the error to handle it in the controller
        }
    }

    public async fetchingPatient(patientId:string):Promise<any>{
        try{
            if(!patientId){
                return 'pateint id is missing!'
            }
            const fetchedPatient=await this.patientRepo.fetchingPatient(patientId)
            return fetchedPatient


        }catch(error){
            console.log(error)
        }
    }
}

export default PatientService;
