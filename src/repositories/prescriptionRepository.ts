import { IPrescriptionRepo } from "../Interfaces/prescription/IPrescriptionRepo.js";
import PrescriptionModel, {
  PrescriptionDocument,
} from "../models/prescriptionModel.js";

class PrescriptionRepository implements IPrescriptionRepo {
  public async addPrescription(
    prescriptionData: Partial<PrescriptionDocument>
  ): Promise<PrescriptionDocument> {
    try {
      const newPrescription = new PrescriptionModel(prescriptionData);
      return await newPrescription.save();
    } catch (error: any) {
      throw new Error(`Error in Repository Layer: ${error.message}`);
    }
  }

  public async getPrescriptionRepository(
    appointmentId: string
  ): Promise<PrescriptionDocument | null> {
    try {
      const prescription = await PrescriptionModel.findOne({ appointmentId });
      return prescription || null;
    } catch (error: any) {
      throw new Error(`Error in Repository Layer: ${error.message}`);
    }
  }
  
}

export default PrescriptionRepository;
