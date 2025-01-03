import bcrypt from "bcryptjs";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import accessToken from "../utils/accessToken.js";
import refreshToken from "../utils/refreshToken.js";
class adminService {
    adminRepo;
    doctorRepo;
    userRepo;
    patientRepo;
    appointmentRepo;
    feedbackRepository;
    constructor(adminRepo, doctorRepo, userRepo, patientRepo, appointmentRepo, feedbackRepository) {
        this.adminRepo = adminRepo;
        this.doctorRepo = doctorRepo;
        this.userRepo = userRepo;
        this.patientRepo = patientRepo;
        this.appointmentRepo = appointmentRepo;
        this.feedbackRepository = feedbackRepository;
    }
    async adminLogin(email, password) {
        try {
            const findAdmin = await this.adminRepo.findAdminByEmail(email);
            if (!findAdmin) {
                return Promise.reject({
                    message: "Admin not found",
                    statusCode: HttpStatusCode.NOT_FOUND,
                });
            }
            const hashedPassword = findAdmin.password;
            const isValid = await bcrypt.compare(password, hashedPassword);
            const adminId = findAdmin._id;
            const access_Token = accessToken(adminId, "admin");
            const refresh_Token = await refreshToken(adminId, "admin");
            console.log(`acesstoken,${access_Token} and refreshToken ${refresh_Token}`);
            if (!isValid) {
                return Promise.reject({
                    message: "Incorrect password",
                    statusCode: HttpStatusCode.UNAUTHORIZED,
                });
            }
            return {
                _id: findAdmin._id,
                name: findAdmin.name,
                email: findAdmin.email,
                role: findAdmin.role,
                isVerified: findAdmin.isVerified,
                accesToken: access_Token,
                refreshToken: refresh_Token,
            };
        }
        catch (error) {
            console.error("Error during admin login:", error);
            return Promise.reject({
                message: "An error occurred during admin login",
                statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
            });
        }
    }
    async adminRegister(data) {
        try {
            // Check if data is provided
            const { name, email, password, phoneNumber } = data;
            if (!name || !email || !password || !phoneNumber) {
                return Promise.reject({
                    message: "Please provide all required data for admin registration",
                    statusCode: HttpStatusCode.BAD_REQUEST,
                });
            }
            const existingAdmin = await this.adminRepo.findAdminByEmail(data.email);
            if (existingAdmin) {
                return Promise.reject({
                    message: "Admin with this email already exists",
                    statusCode: HttpStatusCode.CONFLICT,
                });
            }
            const hashAddminPassword = await bcrypt.hash(password, 10);
            data.password = hashAddminPassword;
            const newAdmin = await this.adminRepo.registerAdmin(data);
            return newAdmin;
        }
        catch (error) {
            console.error("Error during admin registration:", error);
            return Promise.reject({
                message: "An error occurred during admin registration",
                statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
            });
        }
    }
    async fetchTotalUsers() {
        try {
            const totalUsersDetails = await this.userRepo.fetchAllUsers();
            if (totalUsersDetails.length === 0) {
                throw new Error("No users found");
            }
            return totalUsersDetails;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async fetchTotalDoctors() {
        try {
            const fetchingAllDoctors = await this.doctorRepo.fetchingDoctors();
            return fetchingAllDoctors;
        }
        catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }
    async blockUser(userId) {
        try {
            if (!userId) {
                throw new Error("userId is not found");
            }
            const updatedUser = await this.userRepo.blockUser(userId);
            return updatedUser;
        }
        catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }
    async unBlockUserService(userId) {
        try {
            const unBlockedUser = await this.userRepo.unBlockUser(userId);
            return unBlockedUser;
        }
        catch (error) {
            console.error('Error in service while unblocking user:', error);
            throw new Error('Error occurred in service: ' + error.message);
        }
    }
    async approvingDoctor(docId) {
        try {
            const updatedApprovalStatus = await this.doctorRepo.approvingStatus(docId);
            return updatedApprovalStatus;
        }
        catch (error) {
            throw error;
        }
    }
    async rejectDoctorApproval(docId) {
        try {
            if (!docId)
                throw Error("doctor Id is missing");
            const rejectedApprovalStatus = await this.doctorRepo.rejectingDocProfile(docId);
            return rejectedApprovalStatus;
        }
        catch (error) {
            throw Error;
        }
    }
    //blcokc doctors
    async blockDoctor(docId) {
        try {
            if (!docId) {
                throw new Error('Doctor ID is missing');
            }
            const blockDoctor = await this.doctorRepo.doctorBlock(docId);
            if (blockDoctor) {
                return { success: true, message: 'Doctor blocked successfully' };
            }
            else {
                return { success: false, message: 'Failed to block the doctor' };
            }
        }
        catch (error) {
            console.error("Error in blockDoctor service:", error);
            return { success: false, message: 'An error occurred while blocking the doctor' };
        }
    }
    async unBlockDoctor(docId) {
        try {
            const unBlockDoctor = await this.doctorRepo.unBlockDoctor(docId);
            if (unBlockDoctor) {
                return { success: true, message: 'Doctor unblocked successfully' };
            }
            else {
                return { success: false, message: "Failed to unblock the doctor" };
            }
        }
        catch (error) {
            console.error("Error in unBlockDoctor service:", error);
            return { success: false, message: 'An error occurred while unblocking the doctor' };
        }
    }
    async fetchUserSearchData(data) {
        try {
            const fetchedData = await this.userRepo.searchUser(data);
            return fetchedData;
        }
        catch (error) {
            console.error(error);
            throw new Error('Error in fetching user search data');
        }
    }
    async fetchDoctorData(data) {
        try {
            const fetchedDoctors = await this.doctorRepo.adminSearchDoctorData(data);
            return fetchedDoctors;
        }
        catch (error) {
            console.error(error);
            throw new Error('Error in fetching doctor data');
        }
    }
    async adminDocFilter(filter) {
        try {
            const filteredDoctors = await this.doctorRepo.doctorFiltering(filter);
            return filteredDoctors;
        }
        catch (error) {
            console.log('Error in adminDocFilter:', error);
            throw error;
        }
    }
    async getDashboardStatService() {
        try {
            const appointmentCount = await this.appointmentRepo.fetchTotalAppointmentsCount();
            const patientCount = await this.patientRepo.fetchTotalPatientCount();
            const doctorsCount = await this.doctorRepo.fetchTotalDoctorsCount();
            return { appointmentCount, patientCount, doctorsCount };
        }
        catch (error) {
            throw new Error(error);
            console.log(error);
        }
    }
    async fetchYearlyAppointmentData() {
        try {
            const appoinmtentData = await this.appointmentRepo.fetchYearlyAppointmentData();
            return appoinmtentData;
        }
        catch (error) {
            console.log(error);
        }
    }
    async fetchMonthlyData() {
        try {
            const appoinmtentData = await this.appointmentRepo.fetchMonthlyAppointmentData();
            return appoinmtentData;
        }
        catch (error) {
            throw new Error(error);
            console.log(error);
        }
    }
    async fetchdailyData() {
        try {
            const appoinmtentData = await this.appointmentRepo.fetchDailyAppointmentData();
            return appoinmtentData;
        }
        catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }
    async specializationData() {
        try {
            const specializations = await this.appointmentRepo.fetchingspecialisationStats();
            return specializations;
        }
        catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }
    async getDoctorDashStatService() {
        try {
            const maleDoctorsIntheMedTech = await this.doctorRepo.fetchTotalMaleDoctorsAvailable();
            const femaleDoctorsIntheMedTech = await this.doctorRepo.fetchTotalFemaleDoctorsAvailable();
            const otherGender = await this.doctorRepo.fetchOtherGender();
            return { maleDoctorsIntheMedTech, femaleDoctorsIntheMedTech, otherGender };
        }
        catch (error) {
            throw Error(error);
        }
    }
    async fetchTopRatedDoctors() {
        try {
            const topRatedDoctors = await this.feedbackRepository.fetchTopRatedDoctors();
            return topRatedDoctors;
        }
        catch (error) {
            throw new Error(`Error occurred in the fetchTopRatedDoctors service layer: ${error.message}`);
        }
    }
    async fetchAvailableDoctorsService() {
        try {
            const availableDcotors = await this.appointmentRepo.fetchAvailableDoctors();
            return availableDcotors;
        }
        catch (error) {
            throw new Error("error occured in the fetchAvailableDoctorsService", error.message);
            console.log(error);
        }
    }
    async getSpecailizationPercentageService() {
        try {
            const specialisationPercentage = await this.appointmentRepo.getSpecialisationPercentageRepo();
            return specialisationPercentage;
        }
        catch (error) {
            throw new Error(error.message);
            console.log(error);
        }
    }
    async fetchAppointmentsForDash() {
        try {
            const appointments = await this.appointmentRepo.getAppointmentForDashboard();
            return appointments;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async fetchPateintDataForDash(period) {
        try {
            let patientDataForDash;
            if (period == 'yearly') {
                patientDataForDash = await this.patientRepo.getYearlyPatientDataForDash();
            }
            else if (period == 'monthly') {
                patientDataForDash = await this.patientRepo.getMonthlyPatientDataForDash();
            }
            else if (period == 'daily') {
                patientDataForDash = await this.patientRepo.getDailyPatientDataForDash();
            }
            return patientDataForDash;
        }
        catch (error) {
            throw Error(error.message);
        }
    }
    async getNewPatientsService() {
        try {
            const newPatients = await this.patientRepo.fetchingPatientsFordash();
            return newPatients;
        }
        catch (error) {
            throw Error(error.message);
        }
    }
    async fetchAllAppointmentsService() {
        try {
            const fetchedAppointments = await this.appointmentRepo.fetchAllAppointmentRepo();
            return fetchedAppointments;
        }
        catch (error) {
            console.log(error);
        }
    }
    async fetchAllPtients() {
        try {
            const fetchAllPatients = await this.patientRepo.fetchAllPatientDetails();
            return fetchAllPatients;
        }
        catch (error) {
            console.log(error);
        }
    }
}
export default adminService;
