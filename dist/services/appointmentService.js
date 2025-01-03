class AppointmentService {
    appointmentRepo;
    userWalletRepo;
    constructor(appointmentRepo, userWalletRepo) {
        this.appointmentRepo = appointmentRepo;
        this.userWalletRepo = userWalletRepo;
    }
    async createAppointment(appointmentData) {
        try {
            const newAppointment = await this.appointmentRepo.createAppointment(appointmentData);
            return newAppointment;
        }
        catch (error) {
            if (error.code === 11000) {
                throw new Error("This time slot is already booked.");
            }
            throw error;
        }
    }
    async updatePatientId(patientId, appointmentId) {
        try {
            const updatedAppointment = await this.appointmentRepo.updatePatientId(appointmentId, patientId);
            if (!updatedAppointment) {
                throw new Error("Failed to update the appointment.");
            }
            return updatedAppointment;
        }
        catch (error) {
            throw new Error("Error in AppointmentService: " + error.message);
        }
    }
    async appointmentRetrieval(appointmentId) {
        try {
            const appointment = await this.appointmentRepo.appointmentRetrievalWithPatient(appointmentId);
            if (!appointment) {
                throw new Error("Appointment not found");
            }
            return appointment;
        }
        catch (error) {
            console.error("Error in service layer:", error);
            throw new Error(error.message);
        }
    }
    async paymentSucceed(appointmentId) {
        try {
            if (!appointmentId)
                throw Error("appointment id is missing");
            const paymentStatus = await this.appointmentRepo.paymentStatusChange(appointmentId);
            return paymentStatus;
        }
        catch (error) {
            return {
                status: false,
                message: "error occuring in payment succeed service",
            };
        }
    }
    async getAppointments(userId) {
        try {
            const fetchedAppointmentsWithDocDetails = await this.appointmentRepo.appointmentFetching(userId);
            return fetchedAppointmentsWithDocDetails;
        }
        catch (error) {
            throw error;
        }
    }
    async cancelAppointment(amount, userId, appointmentId) {
        try {
            if (!appointmentId) {
                throw new Error("appointment ID is missing");
            }
            const cancelledAppointment = await this.appointmentRepo.cancelAppointment(appointmentId);
            if (!cancelledAppointment) {
                throw new Error("Appointment cancellation failed");
            }
            const paymentSetUp = await this.userWalletRepo.creditedWalletRepo(amount, userId, appointmentId);
            return cancelledAppointment;
        }
        catch (error) {
            console.log(error);
            throw new Error("Error in the cancel appointment service");
        }
    }
    async fetchOnlineAppointments(userId) {
        try {
            const appointments = await this.appointmentRepo.fetchingOnlineAppointmentRepo(userId);
            return appointments;
        }
        catch (error) {
            console.error("Error fetching online appointments in service:", error);
            throw new Error("Error fetching online appointments in service");
        }
    }
    async offlineConsultaions(userId) {
        try {
            const appointments = await this.appointmentRepo.fetchingOfflineAppointments(userId);
            return appointments;
        }
        catch (error) {
            console.error("Error in service layer:", error);
            throw new Error("Error occurred while fetching offline consultations.");
        }
    }
    async appointmentListService(doctorId) {
        try {
            const appointmentList = await this.appointmentRepo.appointmentListRepo(doctorId);
            if (!appointmentList || appointmentList.length === 0)
                throw new Error("No appointments found for the specified doctor.");
            return appointmentList;
        }
        catch (error) {
            console.error("Error in appointmentListService:", error);
            throw new Error(`Error in appointmentListService: ${error.message}`);
        }
    }
    async fetchTodayAppointments(doctorId) {
        try {
            if (!doctorId) {
                throw new Error("doctor Id is missing ");
            }
            const todayAppointments = await this.appointmentRepo.countAppointmentsForToday(doctorId);
            return todayAppointments;
        }
        catch (error) {
            throw Error("error occured in the fetchTodayAppointments service layer", error.message);
        }
    }
    async DoctorDashboard(doctorId) {
        try {
            if (!doctorId)
                throw new Error("Doctor ID is missing");
            const totalAppointmentsCount = await this.appointmentRepo.getTotalAppointmentsCount(doctorId);
            const totalOfflineConsultationCount = await this.appointmentRepo.getTotalOfflineAppointmentsForDoctor(doctorId);
            const totalOnlineConsultationCount = await this.appointmentRepo.getTotalOnlineAppointmentsForDoctor(doctorId);
            const totalPatientsCount = await this.appointmentRepo.getTotalPatientCountFromAppointments(doctorId);
            return {
                totalAppointmentsCount,
                totalOfflineConsultationCount,
                totalOnlineConsultationCount,
                totalPatientsCount,
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getLatestAppointments(doctorId) {
        try {
            const latestAppointments = await this.appointmentRepo.getLatestAppointmentRepo(doctorId);
            return latestAppointments;
        }
        catch (error) {
            throw Error("error occured in the getLatestAppointmentService", error.message);
        }
    }
    async getAppointmentsAndPatients(doctorId, time) {
        try {
            const data = await this.appointmentRepo.getAppointmentsAndPatients(doctorId, time);
            return data;
        }
        catch (error) {
            throw new Error(`Error in AppointmentService: ${error.message}`);
        }
    }
    async patientCtegorizedCount(doctorId) {
        try {
            const patientCounts = await this.appointmentRepo.patientsCount(doctorId);
            return patientCounts;
        }
        catch (error) {
            throw new Error(`Failed to get patient counts for doctor ${doctorId}: ${error.message}`);
        }
    }
    async markedAsComplete(appointmentId) {
        try {
            const updatedStatus = await this.appointmentRepo.markAsCompleted(appointmentId);
            if (!updatedStatus) {
                throw new Error("Appointment not found or could not be updated");
            }
            return updatedStatus;
        }
        catch (error) {
            throw new Error(error.message || "Service error occurred");
        }
    }
}
export default AppointmentService;
