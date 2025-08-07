class PrescriptionService {
    prescriptionRepository;
    constructor(prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }
    async addPrescriptionService(prescriptionData) {
        try {
            return await this.prescriptionRepository.addPrescription(prescriptionData);
        }
        catch (error) {
            throw new Error(`Error in Service Layer: ${error.message}`);
        }
    }
    async getPrescriptionService(appointmentId) {
        try {
            const prescription = await this.prescriptionRepository.getPrescriptionRepository(appointmentId);
            return prescription || null;
        }
        catch (error) {
            console.error("Error in Service Layer:", error);
            throw new Error("Error occurred while retrieving the prescription");
        }
    }
    async editPrescription(prescriptionData) {
        const { _id, diagnosis, medicines, followUpDate } = prescriptionData;
        if (!_id || !diagnosis || !Array.isArray(medicines) || !followUpDate) {
            throw new Error('Missing required fields: _id, diagnosis, medicines, or followUpDate.');
        }
        try {
            const prescription = await this.prescriptionRepository.findById(_id);
            if (!prescription) {
                throw new Error('Prescription not found.');
            }
            prescription.diagnosis = diagnosis;
            prescription.medicines = medicines;
            prescription.followUpDate = followUpDate;
            return await this.prescriptionRepository.editPrescription(prescription);
        }
        catch (error) {
            throw new Error(`Error editing prescription: ${error.message}`);
        }
    }
}
export default PrescriptionService;
