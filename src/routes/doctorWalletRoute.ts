import express from "express";

import DoctorWalletController from "../controllers/doctorWalletController.js";
import DoctorWalletService from "../services/doctorWalletService.js";
import DoctorWalletRepo from "../repositories/DoctorWalletRepo.js";


const docWalletRoute=express.Router();

const docWalletrepo=new DoctorWalletRepo();
const doctorWalletService=new DoctorWalletService(docWalletrepo)
const doctorWalletController=new DoctorWalletController(doctorWalletService);

docWalletRoute.post('/new-wallet',doctorWalletController.createWallet.bind(doctorWalletController));
docWalletRoute.get('/wallet-details',doctorWalletController.getWalletDetails.bind(doctorWalletController))
docWalletRoute.post('/add',doctorWalletController.addAmountToTheWallet.bind(doctorWalletController))

docWalletRoute.post('/withdraw',doctorWalletController.deductAmount.bind(doctorWalletController));
export default docWalletRoute;