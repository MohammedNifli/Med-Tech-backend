import { Router } from "express";
import PatientController from "../controllers/patientController.js";
import PatientService from "../services/patientService.js";
import PatientRepository from "../repositories/patientRepo.js";

const patientRoute=Router()

const patientRepo=new PatientRepository();
const patientService=new PatientService(patientRepo);
const patientController=new PatientController(patientService);
patientRoute.post('/add',patientController.createPatient.bind(patientController))
patientRoute.get('/patient-details/:id',patientController.fetchingPatient.bind(patientController))



export default patientRoute