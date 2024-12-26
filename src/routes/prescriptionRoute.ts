import Prescription from '../controllers/prescriptionController.js';
import PrescriptionService from '../services/prescriptionService.js'
import PrescriptionRepository from '../repositories/prescriptionRepository.js';

import  express  from 'express';


const prescriptionRoute=express.Router();

const prescriptionRepo=new PrescriptionRepository();
const prescriptionService=new PrescriptionService(prescriptionRepo)
const prescriptionController=new Prescription(prescriptionService);


prescriptionRoute.post('/doctor',prescriptionController.addPrescription.bind(prescriptionController))
prescriptionRoute.get('/doctor',prescriptionController.getPrescription.bind(prescriptionController))

export default prescriptionRoute
 