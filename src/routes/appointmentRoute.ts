import express, { Router } from "express";
import AppointmentController from "../controllers/appointmentController.js";
import AppointmentRepo from "../repositories/appointmentRepo.js";
import AppointmentService from "../services/appointmentService.js";
import { Roles } from "../config/rolesConfig.js";
import { authentication, checkRole } from "../middlewares/authMiddleware.js";
import bodyParser from "body-parser";
import PaymentRepo from "../repositories/paymentRepo.js";
import PaymentService from "../services/paymentService.js";

import walletRepo from "../repositories/userWalletRepo.js";
const appointmentRoute = Router();
const WalletRepo=new walletRepo()
const paymentRepo=new PaymentRepo()

const appointmentRepo = new AppointmentRepo();
const paymentService=new PaymentService(paymentRepo)

const appointmentService = new AppointmentService(appointmentRepo,WalletRepo);
const appointmentController = new AppointmentController(appointmentService,paymentService);

appointmentRoute.post(
  "/add",
  appointmentController.createAppointment.bind(appointmentController)
);

appointmentRoute.post(
  "/update",
  appointmentController.updatePatientId.bind(appointmentController)
);

//payment
appointmentRoute.post(
  "/payment",
  appointmentController.stripePaymentController.bind(appointmentController)
);

appointmentRoute.post(
  "/webhook",
  express.raw({ type: "*/*" }),

  appointmentController.webHook.bind(appointmentController)
);

appointmentRoute.get(
  "/get-details",
  appointmentController.getAppointment.bind(appointmentController)
);
appointmentRoute.get(
  "/appointmentlist",
  appointmentController.fetchAppointments.bind(appointmentController)
);
appointmentRoute.post(
  "/cancel",
  appointmentController.cancelAppointment.bind(appointmentController)
);

appointmentRoute.get('/online-appointments',appointmentController.fetchingOnlineAppointments.bind(appointmentController));
appointmentRoute.get('/offline-appointments',appointmentController.fetchingOfflineAppointments.bind(appointmentController));

appointmentRoute.get('/appointment-list',appointmentController.appointmentListController.bind(appointmentController));

appointmentRoute.get('/today/count',appointmentController.fetchTodayAppointments.bind(appointmentController));

appointmentRoute.get('/summary',appointmentController.fetchDoctorAppointmentsForDashboard.bind(appointmentController))
appointmentRoute.get('/latest',appointmentController.getLatestAppointments.bind(appointmentController))
appointmentRoute.get('/dash-counts',appointmentController.getTotalAppointmentsAndPatients.bind(appointmentController))
appointmentRoute.get('/patients',appointmentController.fetchPatientsCategorizedCount.bind(appointmentController))

appointmentRoute.post('/mark',appointmentController.markAsCompleted.bind(appointmentController))

export default appointmentRoute;
