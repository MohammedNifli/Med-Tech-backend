import { HttpStatusCode } from "../enums/httpStatusCodes.js";
class Prescription {
    prescriptionService;
    constructor(prescriptionService) {
        this.prescriptionService = prescriptionService;
    }
    async addPrescription(req, res) {
        try {
            const { patientId, doctorId, userId, appointmentId, prescription: { diagnosis, medicines, followUpDate, }, } = req.body;
            const prescriptionData = {
                appointmentId,
                patientId,
                userId,
                doctorId,
                diagnosis,
                medicines,
                followUpDate,
            };
            const addedPrescription = await this.prescriptionService.addPrescriptionService(prescriptionData);
            return res.status(HttpStatusCode.CREATED).json({
                message: "Prescription added successfully",
                data: addedPrescription,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: "Internal Server Error",
                error: error.message,
            });
        }
    }
    async getPrescription(req, res) {
        try {
            const appointmentId = req.query.appointmentId;
            if (!appointmentId) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "Appointment ID is required" });
            }
            const prescription = await this.prescriptionService.getPrescriptionService(appointmentId);
            if (!prescription) {
                return res
                    .status(HttpStatusCode.NOT_FOUND)
                    .json({ message: "No prescription found for this appointment" });
            }
            return res.status(HttpStatusCode.OK).json({ prescription });
        }
        catch (error) {
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }
}
export default Prescription;
