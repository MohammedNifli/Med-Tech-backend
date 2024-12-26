import { PrescriptionDocument } from "../../models/prescriptionModel.js"


export interface IPrescriptionRepo{

    addPrescription(prescriptionData: Partial<PrescriptionDocument>): Promise<PrescriptionDocument>
    getPrescriptionRepository(
        appointmentId: string
      ): Promise<PrescriptionDocument | null> 

}