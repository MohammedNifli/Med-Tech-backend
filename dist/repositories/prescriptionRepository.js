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
    async findById(prescriptionId) {
        try {
            return await PrescriptionModel.findById(prescriptionId);
        }
        catch (error) {
            throw new Error(`Error finding prescription: ${error.message}`);
        }
    }
    async editPrescription(prescription) {
        try {
            return await prescription.save();
        }
        catch (error) {
            throw new Error(`Error saving prescription: ${error.message}`);
        }
    }
}
export default PrescriptionRepository;
