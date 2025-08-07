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


      public async editPrescription(
        prescriptionData: Partial<PrescriptionDocument>
      ): Promise<PrescriptionDocument | null> {
        
        const { _id ,diagnosis, medicines, followUpDate } = prescriptionData;
    
        if (!_id || !diagnosis || !Array.isArray(medicines) || !followUpDate) {
          throw new Error('Missing required fields: _id, diagnosis, medicines, or followUpDate.');
        }
    
        try {
          
          const prescription = await this.prescriptionRepository.findById(_id as string);
    
          if (!prescription) {
            throw new Error('Prescription not found.');
          }
    
    
          prescription.diagnosis = diagnosis;
          prescription.medicines = medicines;
          prescription.followUpDate = followUpDate;
    
          
          return await this.prescriptionRepository.editPrescription(prescription);
        } catch (error: any) {
          throw new Error(`Error editing prescription: ${error.message}`);
        }
      }
      

}

export default PrescriptionService