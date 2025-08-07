import { PrescriptionDocument } from "../../models/prescriptionModel.js";


export interface IPrescriptionService{

    addPrescriptionService(prescriptionData: Partial<PrescriptionDocument>): Promise<PrescriptionDocument>
    getPrescriptionService(appointmentId: string): Promise<PrescriptionDocument | null>

    editPrescription(prescriptionData:PrescriptionDocument):Promise<PrescriptionDocument | null>
}