import { Router } from "express";
import OtpController from "../controllers/otpController.js";
import OtpService from "../services/otpService.js";
import OtpRepository from "../repositories/otpRepository.js";
import UserRepository from "../repositories/userRepo.js";

const otpRoute = Router();

// Create instances of the repository and service, and pass the service to the controller
const otpRepo = new OtpRepository();
const userRepo=new UserRepository()
const otpService = new OtpService(otpRepo,userRepo);
const otpController = new OtpController(otpService);

otpRoute.post('/verify', otpController.verifyOTP.bind(otpController));
otpRoute.post('/resend', otpController.resendOTP.bind(otpController));
otpRoute.post('/send',otpController.sendOTp.bind(otpController))

//doctor otp routes
otpRoute.post('/doctor/send',otpController.docSendOTP.bind(otpController));

otpRoute.post('/doctor/verify',otpController.verifyDocOTP.bind(otpController))

export default otpRoute;
