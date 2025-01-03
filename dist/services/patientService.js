class PatientService {
    patientRepo;
    constructor(patientRepo) {
        this.patientRepo = patientRepo;
    }
    async createPatientService(patientData) {
        try {
            const patient = await this.patientRepo.createPatient(patientData);
            return patient;
        }
        catch (error) {
            throw error;
        }
    }
    async fetchingPatient(patientId) {
        try {
            if (!patientId) {
                return "pateint id is missing!";
            }
            const fetchedPatient = await this.patientRepo.fetchingPatient(patientId);
            return fetchedPatient;
        }
        catch (error) {
            throw error;
        }
    }
}
export default PatientService;
