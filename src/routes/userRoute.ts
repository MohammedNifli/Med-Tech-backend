import { Router } from 'express';

import userController from '../controllers/userController.js';  
import UserRepo from '../repositories/userRepo.js';  
import UserService from '../services/userService.js';  
import DoctorService from '../services/doctorService.js';
import DocRepo from '../repositories/doctorRepo.js';
import {authentication} from '../middlewares/authMiddleware.js'
import TimeSlotService from '../services/timeSlotService.js';
import TimeSlotRepo from '../repositories/timeSlotRepo.js';
import dotenv from 'dotenv'
dotenv.config();

import {checkRole} from '../middlewares/authMiddleware.js'
import { Roles } from '../config/rolesConfig.js';
import {upload} from '../middlewares/uploadMiddleware.js'
import checkBlocked from '../middlewares/checkBlocked.js';
import TimeSlotController from '../controllers/timeSlotController.js';


const router = Router();


const userRepository = new UserRepo();
const userService = new UserService(userRepository);  
const docRepo=new DocRepo()
const doctorService=new DoctorService(docRepo)
const timeSlotRepo=new TimeSlotRepo()
const timeSlotService=new TimeSlotService(timeSlotRepo)
const userControllerInstance = new userController(userService,doctorService,timeSlotService);  
const timeSlotController=new TimeSlotController(timeSlotService)


router.post('/register', userControllerInstance.register.bind(userControllerInstance));
router.post('/login', userControllerInstance.Login.bind(userControllerInstance));  
router.post('/logout', authentication,checkRole([Roles.USER]),userControllerInstance.logout.bind(userControllerInstance));
router.post('/auth/google', userControllerInstance.googleLogin.bind(userControllerInstance));  

router.get('/profile/:id',authentication,checkRole([Roles.USER]),checkBlocked, userControllerInstance.getProfile.bind(userControllerInstance));
router.put('/profile/:id',authentication,checkRole([Roles.USER]), upload.single('photo'),userControllerInstance.updateUserProfile.bind(userControllerInstance));  // Bind specific method, not the entire controller


router.get('/specializations', userControllerInstance.fetchingSpecialization.bind(userControllerInstance));
router.get('/filter',authentication,checkRole([Roles.USER]), userControllerInstance.filterDoctors.bind(userControllerInstance));
router.get ('/doctor-profile',authentication,checkRole([Roles.USER]),userControllerInstance.fetchingDoctorProfile.bind(userControllerInstance))
router.get('/time-slots',userControllerInstance.fetchDoctorOnlineSlots.bind(userControllerInstance))

router.post('/password',userControllerInstance.userChangePassword.bind(userControllerInstance))

router.get('/available-doctors',userControllerInstance.fetchAllAvailableDoctors.bind(userControllerInstance))


router.get('/online-slots',userControllerInstance.fetchDoctorOnlineSlots.bind(userControllerInstance));
router.get('/offline-slots',userControllerInstance.fetchDoctorOfflineSlots.bind(userControllerInstance));
router.post('/presigned-url',userControllerInstance.s3PresignedUrlCreation)

router.post('/slot-status',timeSlotController.changeSlotStatus.bind(timeSlotController))
router.post('/premium-payment',userControllerInstance.premiumPaymentController.bind(userControllerInstance))
router.post('/premium-status',userControllerInstance.changeUserPremiumSetup.bind(userControllerInstance))
router.get('/premium-status',userControllerInstance.checkUserPremiumStatus.bind(userControllerInstance))
router.get('/search',userControllerInstance.searchDoctorsByCriteria.bind(userControllerInstance))


export default router;
