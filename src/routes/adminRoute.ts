import express from "express";
import AdminController from "../controllers/adminController.js";
import AdminService from "../services/adminService.js";
import DoctorRepository from "../repositories/doctorRepo.js";
import UserRepository from "../repositories/userRepo.js";
import AdminRepo from "../repositories/adminRepository.js";
import { authentication, checkRole } from "../middlewares/authMiddleware.js";
import { Roles } from "../config/rolesConfig.js";
import checkBlocked from "../middlewares/checkBlocked.js";
import PatientRepo from "../repositories/patientRepo.js";
import AppointmentRepo from "../repositories/appointmentRepo.js";
import FeedbackRepository from "../repositories/feedbackRepo.js";
import FinancialRepository from "../repositories/financialRepository.js";
import FinancialService from "../services/financialService.js";
import FinancialController from "../controllers/financialController.js";

const adminRoute = express.Router();
const doctorRepo = new DoctorRepository();
const userRepo = new UserRepository();
const adminRepo=new AdminRepo()
const patientRepo=new PatientRepo();
const appointmentRepo=new AppointmentRepo()
const feedbackRepo=new FeedbackRepository()

const adminService = new AdminService(adminRepo,doctorRepo, userRepo,patientRepo,appointmentRepo,feedbackRepo);
const adminController = new AdminController(adminService);

const financialRepo=new FinancialRepository();
const financialService=new FinancialService(financialRepo);
const financialController=new FinancialController(financialService)


adminRoute.get(
  "/users",
  adminController.fetchingUsersDetails.bind(adminController)
);
adminRoute.get(
  "/doctors",
  adminController.fetchingAllDoctors.bind(adminController)
);
adminRoute.patch(
  "/user-block/:id",
  adminController.blockUserController.bind(adminController)
);


adminRoute.patch('/user-unblock/:id',adminController.unBlockUser.bind(adminController))
adminRoute.post('/doctor-block/:id',adminController.blockDoctor.bind(adminController))
adminRoute.post('/doctor-unblock/:id',adminController.unBlockDoctor.bind(adminController))

adminRoute.post('/register',adminController.register.bind(adminController))
adminRoute.post('/login',adminController.login.bind(adminController))
adminRoute.post('/logout',adminController.Logout.bind(adminController))
adminRoute.post('/verify',adminController.ApprovingDoctorProfile.bind(adminController))
adminRoute.post('/reject',adminController.rejectingDoctorProfile.bind(adminController))

adminRoute.get('/users/data',adminController.userSearchData.bind(adminController));
adminRoute.get('/doctors/data',adminController.doctorsSearchData.bind(adminController))

adminRoute.get('/doc-filter',adminController.filteringDoctors.bind(adminController))

adminRoute.get('/dash-stats',adminController.getDashboardStats.bind(adminController))
adminRoute.get('/dash-appointment',adminController.fetchAppointmentGraphData.bind(adminController))
adminRoute.get('/dash-doctor',adminController.getDoctorDashStats.bind(adminController))
adminRoute.get('/top-rated',adminController.fetchingTopRatedDoctors.bind(adminController))
adminRoute.get('/available-doctors',adminController.fetchAvailableDoctors.bind(adminController));
adminRoute.get('/dash-specialization',adminController.getAppointmentPercentageBySpecialization.bind(adminController))
adminRoute.get('/dash-appointments',adminController.fetchApppointmentsForDashboard.bind(adminController))

adminRoute.get('/dash-patients',adminController.fetchPatientDetailsForDashboard.bind(adminController))

adminRoute.get('/new-patients',adminController.getNewPatients.bind(adminController))

adminRoute.get('/appointments',adminController.fetchAllAppointments.bind(adminController))

adminRoute.get('/patients',adminController.fetchAllPatients.bind(adminController));

adminRoute.post('/online',financialController.addOnlinePayment.bind(financialController))
adminRoute.post('/offline',financialController.addOfflinePayment.bind(financialController))
adminRoute.post('/premium',financialController.premiumPayment.bind(financialController))
adminRoute.get('/amounts',financialController.showAmounts.bind(financialController))
adminRoute.post('/amount',financialController.addIntoTotalAmount.bind(financialController))
adminRoute.get('/revenue',financialController.RevenueGraphDataController.bind(financialController))


export default adminRoute;
