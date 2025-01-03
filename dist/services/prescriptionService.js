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
}
export default PrescriptionService;
