import express from 'express';
import DocController from '../controllers/doctorController.js';
// import uploadMiddleware from '../middlewares/uploadMiddleware.js';
import DoctorRepo from '../repositories/doctorRepo.js';
import DoctorService from '../services/doctorService.js';
import TimeSlotRepo from '../repositories/timeSlotRepo.js';
import TimeSlotService from '../services/timeSlotService.js';
import TimeSlotController from '../controllers/timeSlotController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import checkBlocked from '../middlewares/checkBlocked.js';
import { authentication, checkRole } from '../middlewares/authMiddleware.js';
import { Roles } from '../config/rolesConfig.js';
const docRoute = express.Router();
const docRepo = new DoctorRepo();
const doctorService = new DoctorService(docRepo);
const docController = new DocController(doctorService);
const timeSlotRepo = new TimeSlotRepo();
const timeSlotService = new TimeSlotService(timeSlotRepo);
const timeSlotController = new TimeSlotController(timeSlotService);
// Routes
// Public Routes
docRoute.post('/register', docController.doctorRegister.bind(docController));
docRoute.post('/login', docController.doctorLogin.bind(docController));
// Protected Routes
docRoute.use(authentication); // Apply authentication middleware to all routes below
// Doctor Profile routes
docRoute.get('/profile', checkBlocked, docController.getProfile.bind(docController));
docRoute.put('/profile', checkRole([Roles.DOCTOR]), checkBlocked, docController.editProfile.bind(docController));
// Doctor Approval - File Uploads (use the `upload` middleware)
docRoute.put('/approval/:id', checkRole([Roles.DOCTOR]), checkBlocked, upload.fields([
    { name: 'certificates', maxCount: 10 },
    { name: 'licenses', maxCount: 10 }
]), docController.applyForApproval.bind(docController));
docRoute.post('/picture', checkRole([Roles.DOCTOR]), upload.single('photo'), docController.doctorProfilePictureFixing.bind(docController));
docRoute.post('/slot', checkBlocked, timeSlotController.addTimeSlots.bind(timeSlotController));
docRoute.post('/logout', checkRole([Roles.DOCTOR]), checkBlocked, docController.doctorLogout.bind(docController));
docRoute.get('/status/:id', checkBlocked, docController.fetchDoctorStatus.bind(docController));
docRoute.get('/slots', checkRole([Roles.DOCTOR]), checkBlocked, timeSlotController.fetchSlots.bind(timeSlotController));
docRoute.delete('/slot', checkRole([Roles.DOCTOR]), checkBlocked, timeSlotController.deleteTimeSlot.bind(timeSlotController));
docRoute.post('/password', checkRole([Roles.DOCTOR]), checkBlocked, docController.changePassword.bind(docController));
docRoute.post('/edit-slot', checkRole([Roles.DOCTOR]), checkBlocked, timeSlotController.editTimeSlot.bind(timeSlotController));
docRoute.post('/presigned-url', docController.s3PresignedUrlCreation);
docRoute.post('/presigned-urls', docController.s3PresignedUrlGeneration);
export default docRoute;
