import { IPrescriptionService } from "../Interfaces/prescription/IPrescriptionService.js"
import { IPrescriptionRepo } from "../Interfaces/prescription/IPrescriptionRepo.js"
import { PrescriptionDocument } from "../models/prescriptionModel.js";

class PrescriptionService implements IPrescriptionService{
    private prescriptionRepository:IPrescriptionRepo

    constructor(prescriptionRepository:IPrescriptionRepo){
        this.prescriptionRepository=prescriptionRepository

    }

    public async addPrescriptionService(prescriptionData: Partial<PrescriptionDocument>): Promise<PrescriptionDocument> {
        try {
          return await this.prescriptionRepository.addPrescription(prescriptionData);
        } catch (error: any) {
          throw new Error(`Error in Service Layer: ${error.message}`);
        }
      }


      public async getPrescriptionService(appointmentId: string): Promise<PrescriptionDocument | null> {
        try {
          const prescription = await this.prescriptionRepository.getPrescriptionRepository(appointmentId);
          return prescription || null;
        } catch (error: any) {
          console.error("Error in Service Layer:", error);
          throw new Error("Error occurred while retrieving the prescription");
        }
      }
      

}

export default PrescriptionService