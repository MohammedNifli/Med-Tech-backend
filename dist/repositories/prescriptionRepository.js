import PrescriptionModel from "../models/prescriptionModel.js";
class PrescriptionRepository {
    async addPrescription(prescriptionData) {
        try {
            const newPrescription = new PrescriptionModel(prescriptionData);
            return await newPrescription.save();
        }
        catch (error) {
            throw new Error(`Error in Repository Layer: ${error.message}`);
        }
    }
    async getPrescriptionRepository(appointmentId) {
        try {
            const prescription = await PrescriptionModel.findOne({ appointmentId });
            return prescription || null;
        }
        catch (error) {
            throw new Error(`Error in Repository Layer: ${error.message}`);
        }
    }
}
export default PrescriptionRepository;
