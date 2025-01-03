import { IPatientService } from "../Interfaces/patient/IPatientService.js";
import { IPatientRepo } from "../Interfaces/patient/IPatientRepo.js";
import { IPatient } from "../types/patient.types.js";

class PatientService implements IPatientService {
  private patientRepo: IPatientRepo;

  constructor(patientRepo: IPatientRepo) {
    this.patientRepo = patientRepo;
  }

  public async createPatientService(patientData: any): Promise<IPatient> {
    try {
      const patient = await this.patientRepo.createPatient(patientData);
      return patient;
    } catch (error) {
      
      throw error;
    }
  }

  public async fetchingPatient(patientId: string): Promise<IPatient |string> {
    try {
      if (!patientId) {
        return "pateint id is missing!";
      }
      const fetchedPatient = await this.patientRepo.fetchingPatient(patientId);
      return fetchedPatient;
    } catch (error) {
      throw error;
    }
  }
}

export default PatientService;
