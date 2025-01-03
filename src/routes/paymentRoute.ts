import  express   from "express";

import PaymentRepo from "../repositories/paymentRepo.js";
import PaymentService from "../services/paymentService.js";
import PaymentController from "../controllers/paymentController.js";

const paymentRoute=express.Router()
const  paymentRepo=new PaymentRepo()
const paymentService=new PaymentService(paymentRepo)
const paymentController=new PaymentController(paymentService)


paymentRoute.post('/add-payment',paymentController.addPayment.bind(paymentController))

export default paymentRoute