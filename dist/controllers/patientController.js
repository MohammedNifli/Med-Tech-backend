import { HttpStatusCode } from "../enums/httpStatusCodes.js";
class PatientController {
    patientService;
    constructor(patientService) {
        this.patientService = patientService;
    }
    async createPatient(req, res) {
        try {
            const { formData } = req.body;
            const { name, email, age, gender, phone, streetAddress, city, state, country, dateOfBirth, } = formData;
            if (!name || !email || !age || !gender || !dateOfBirth) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "Missing required fields" });
            }
            const patientData = {
                name,
                email,
                age,
                gender,
                phone,
                dateOfBirth,
                address: {
                    street: streetAddress,
                    city,
                    state,
                    country,
                },
            };
            const newPatient = await this.patientService.createPatientService(patientData);
            return res
                .status(HttpStatusCode.CREATED)
                .json({ message: "Patient created successfully", newPatient });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Error creating patient", error: error.message });
        }
    }
    async fetchingPatient(req, res) {
        try {
            const patientId = req.params.id;
            const patientDetails = await this.patientService.fetchingPatient(patientId);
            return res
                .status(HttpStatusCode.OK)
                .json({ message: "patient fetched succesfully", patientDetails });
        }
        catch (error) {
            throw error;
        }
    }
}
export default PatientController;
