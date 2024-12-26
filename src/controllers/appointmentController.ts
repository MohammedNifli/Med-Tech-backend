import express, { Request, Response } from "express";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import { IAppointmentService } from "../Interfaces/appointment/IAppointmentService.js";
import { IAppointmentData } from "../models/appointmentModel.js";
import Stripe from "stripe";
import dotenv from "dotenv";
import { time } from "node:console";
import { IPaymentService } from "../Interfaces/payment/IPaymentService.js";
import messageRoute from "../routes/messageRoute.js";
import moment from 'moment-timezone';

dotenv.config(); // Load environment variables at the top of the file

interface PaymentIntentRequest {
  amount: number;
  currency: string;
  appointmentId?: string;
}

class AppointmentController {
  private appointmentService: IAppointmentService;
  private stripe: Stripe;
  private paymentService:IPaymentService

  constructor(appointmentService: IAppointmentService,paymentService:IPaymentService) {
    this.appointmentService = appointmentService;
    this.paymentService=paymentService


    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

   

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  private timeChangeIntoUTC(date: Date, timeSlot: string): string {
    const exactDate = new Date(date);
    const [hours, minutes] = timeSlot.split(":").map(Number);
    exactDate.setUTCHours(hours, minutes, 0, 0);
    const utcDateTime = exactDate.toISOString();
    console.log("Combined UTC DateTime:", utcDateTime);
    return utcDateTime;
  }

  public async createAppointment(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { appointmentData } = req.body;
    const {
      userId,
      doctorId,
      appointmentDate,
      timeSlot,
      consultationMode,
      amount,
      videoCall
    } = appointmentData;
    console.log(
      userId,
      doctorId,
      appointmentDate,
      timeSlot,
      consultationMode,
      amount,
      videoCall
    );

    if (
      !userId ||
      !doctorId ||
      !appointmentDate ||
      !timeSlot ||
      !consultationMode
    ) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Missing required fields" });
    }

    try {
      const utcDateTime = this.timeChangeIntoUTC(
        new Date(appointmentDate),
        timeSlot
      );
      // const utcDateTime = moment.tz(appointmentDate, 'YYYY-MM-DD HH:mm:ss', 'America/New_York').utc().format();
      console.log("utcDate", utcDateTime);

      const appointmentData: IAppointmentData = {
        userId,
        doctorId,

        appointmentDate: utcDateTime,
        timeSlot,
        consultationMode: consultationMode || "online",
        amount,
        videoCall
      };
      console.log('appooitnemtnajnrfe',appointmentData)

      const result = await this.appointmentService.createAppointment(
        appointmentData
      );

      return res
        .status(HttpStatusCode.CREATED)
        .json({ message: result.message, appointment: result.appointment });
    } catch (error: any) {
      if (error.message === "This time slot is already booked.") {
        return res
          .status(HttpStatusCode.CONFLICT)
          .json({ message: error.message });
      }
      console.error("Error in createAppointment:", error);
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }

  public async stripePaymentController(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { amount, currency = "inr", appointmentId ,userId} = req.body;
      const amountInPaise = amount * 100;

      // Create a new Checkout session with appointmentId in metadata
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: "Consultation Fee",
              },
              unit_amount: amountInPaise,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        payment_intent_data: {
          metadata: {
            appointmentId: String(appointmentId),
            amount:amount,
            userId:userId
          },
        },
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/cancel`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating payment session:", error);
      res.status(500).json({ error: error.message });
    }
  }


  
  public async webHook(req: Request, res: Response): Promise<void> {
    const sig = req.headers["stripe-signature"] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
    if (!endpointSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      res.status(500).send("Webhook secret not configured");
      return;
    }
  
    let event: Stripe.Event;
  
    try {
      event = this.stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed.", err);
      res.status(400).send(`Webhook Error: ${(err as Error).message}`);
      return;
    }
  
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const appointmentId = paymentIntent.metadata?.appointmentId;
      const amount = paymentIntent.metadata?.amount;
      const userId = paymentIntent.metadata?.userId;
  
      if (appointmentId) {
        try {
          const status = "completed";
          const pisa = Number(amount);
          
          // Update the appointment
          await this.appointmentService.paymentSucceed(appointmentId);
        
          
          // Add payment
          const payment = await this.paymentService.addPaymentService(userId, appointmentId, pisa, status);
          
          console.log(`Payment added for Appointment ID: ${appointmentId}`);
        } catch (error) {
          console.error(`Error handling payment for appointment ${appointmentId}:`, error);
        }
      } else {
        console.warn("No appointment ID found in payment metadata.");
      }
    } else {
      console.log(`Unhandled event type ${event.type}.`);
    }
  
    res.status(200).send("Received event");
  }
  

  public async updatePatientId(req: Request, res: Response): Promise<any> {
    try {
      const { patientId, appointmentId } = req.body;
      console.log("patientId", patientId);
      console.log("appointmentId", appointmentId);

      if (!patientId || !appointmentId) {
        return res
          .status(400)
          .json({ error: "PatientId and AppointmentId are required" });
      }

      const updatedAppointment = await this.appointmentService.updatePatientId(
        patientId,
        appointmentId
      );

      if (updatedAppointment) {
        return res
          .status(200)
          .json({
            message: "Appointment updated successfully",
            updatedAppointment,
          });
      } else {
        return res.status(404).json({ error: "Appointment not found" });
      }
    } catch (error: any) {
      console.error("Error in AppointmentController:", error.message);
      return res
        .status(500)
        .json({ error: "An error occurred while updating the appointment" });
    }
  }

  public async getAppointmentController(
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const appointmentId = req.query.id as string;
      if (!appointmentId) {
        return res.status(400).json({ message: "appointmentId is missing" }); // 400 Bad Request
      }

      const appointment =
        await this.appointmentService.appointmentRetrievalService(
          appointmentId
        );

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" }); // 404 Not Found
      }

      return res.status(200).json(appointment); // 200 OK
    } catch (error: any) {
      console.error("Error fetching appointment:", error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message }); // 500 Internal Server Error
    }
  }

  public async fetchAppointments(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.query.id as string;
      console.log('userId',userId)
      const fetchedAppointments =
        await this.appointmentService.appointmentFetchingService(userId);
        console.log("fetchedAppointments",fetchedAppointments)
      return res
        .status(HttpStatusCode.OK)
        .json({
          message:
            "appointments with doctor details fetched succesfully completed",
          fetchedAppointments,
        });
    } catch (error: any) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server occuring in fetchAppointments" });
    }
  }


  public async cancelAppointment(req: Request, res: Response): Promise<any> {
    try {
      const {amount,userId,appointmentId} = req.body;
      console.log("appointmentId", appointmentId);
  
      if (!appointmentId) {
        throw new Error('appointmentId is null');
      }
  
      // Call the service to cancel the appointment
      const cancelledAppointment = await this.appointmentService.cancelAppointmentService(amount,userId,appointmentId);
      console.log('cancelledAppointment', cancelledAppointment);
  
      return res.status(HttpStatusCode.OK).json({
        message: 'Appointment successfully cancelled',
        cancelledAppointment,
      });
  
    } catch (error: any) {
      console.log(error);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  }

  public async resheduleAppointment(req:Request,res:Response):Promise<any>{
    try{
      const {oldDate,newDate,appointmentId,timeSlot}=req.body;
      if(!oldDate || !newDate || !appointmentId || !timeSlot){
        return res.status(HttpStatusCode.BAD_REQUEST).json({message:'Missing Required Fields'})
      }
      
     
     
    }catch(error){
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:'Error happening in resheduleAppointment'})
    }
  }

  public async fetchingOnlineAppointments(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.query.id as string ;
      console.log("userId in fetching online appointments ",userId)
  
      // Check if userId exists in query string to prevent unnecessary database calls
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      const fetchedAppointments = await this.appointmentService.fetchOnlineAppointmentService(userId);
      console.log('fetchedApppointments',fetchedAppointments)
  
      if (!fetchedAppointments.length) {
        return res.status(404).json({ message: 'No online appointments found' });
      }
      
  
      res.status(200).json(fetchedAppointments);  // Return fetched appointments
    } catch (error) {
      console.error('Error fetching online appointments in controller:', error);  // More descriptive logging
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
    }
  }


  public async fetchingOfflineAppointments(req: Request, res: Response): Promise<Response> {
    try {
        const userId = req.query.id as string; // Get user ID from query params
        console.log('userId', userId);

        // Validate the userId
        if (!userId) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                message: 'User ID is required.'
            });
        }

        // Fetch appointments from service layer
        const fetchAppointments = await this.appointmentService.offlineConsultaions(userId);
        console.log('Offline Appointments:', fetchAppointments);

        // If no appointments are found
        if (!fetchAppointments || fetchAppointments.length === 0) {
            return res.status(HttpStatusCode.NOT_FOUND).json({
                message: 'No offline appointments found for the given user.'
            });
        }

        // Return the fetched appointments
        return res.status(HttpStatusCode.OK).json({
            message: 'Fetched appointments successfully.',
             fetchAppointments
        });

    } catch (error) {
        console.error('Error in fetching offline appointments:', error);
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error while fetching offline appointments.'
        });
    }
}

//appointment fetching for  listing in doctor-side

public async appointmentListController(req: Request, res: Response): Promise<any> {
  try {
    const docId = req.query.id as string;

    if (!docId) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Doctor ID is required" });
    }

    const appointmentList = await this.appointmentService.appointmentListService(docId);

    return res
      .status(HttpStatusCode.OK)
      .json({
        status: "success",
        message: "Appointment lists fetched successfully",
        data: appointmentList,
      });

  } catch (error:any) {
    console.error("Error in appointmentListController:", error);
    return res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({
        status: "error",
        message: "Error occurred in appointmentListController",
        error: error.message, // Include the error message for easier debugging
      });
  }
}

public async fetchTodayAppointments(req: Request, res: Response): Promise<number | any> {
  try {
    const doctorId = req.query.id as string;

    if (!doctorId) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Doctor ID is required' });
    }

    // Assuming you have an AppointmentModel with a doctorId field
    const todayTotalAppointments = await this.appointmentService.fetchTodayAppointmentsService(doctorId)

    // Check if there are appointments found for the doctor
    // if (todayTotalAppointments === 0) {
    //   return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'No appointments found for this doctor' });
    // }

    // Return the total number of appointments
    return res.status(HttpStatusCode.OK).json({ todayTotalAppointments });
  } catch (error) {
    console.error(error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error occurred' });
  }
}


public async fetchDoctorAppointmentsForDashboard(req: Request, res: Response): Promise<any> {
  try {
    const doctorId = req.query.id as string;

    if (!doctorId) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Doctor ID is missing" });
    }

    const appointmentDetails = await this.appointmentService.DoctorDashboardService(doctorId);

    res.status(HttpStatusCode.OK).json(appointmentDetails);
  } catch (error: any) {
    console.error("Error in fetchDoctorAppointmentsForDashboard:", error.message);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
  }
}


public async getLatestAppointments(req:Request,res:Response):Promise<any>{
  try{
   const doctorId=req.query.id as string;

   const latestAppointments=await this.appointmentService.getLatestAppointmentService(doctorId);
   return res.status(HttpStatusCode.OK).json({message:"latest appintments are",latestAppointments})
    

  }catch(error){
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"Internal Server Error"})
  }
}

public async getTotalAppointmentsAndPatients(req: Request, res: Response): Promise<Response> {
  try {
    const doctorId = req.query.id as string;
    const time = req.query.time as string;
    console.log('owkeo',time,doctorId)

    if (!doctorId || !time) {
      return res.status(400).json({ message: 'Doctor ID and time are required' });
    }

    const data = await this.appointmentService.getAppointmentsAndPatients(doctorId, time);

    return res.status(200).json({
      message: 'Data fetched successfully',
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
}

public async fetchPatientsCategorizedCount(req:Request,res:Response):Promise<any>{
  try{
    const doctorId=req.query.id as string;
    const categorizedPatients=await this.appointmentService.patientCtegorizedCount(doctorId);
    return res.status(HttpStatusCode.OK).json({message:'data fetched succesfully',categorizedPatients})

  }catch(error){
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"Internal server error"})
  }
}



//ark as completed

public async markAsCompleted(req: Request, res: Response): Promise<any> {
  try {
    const appointmentId = req.query.id as string;

    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }

    const markedAsCompleted = await this.appointmentService.markedAsCompletedService(appointmentId);

    return res
      .status(HttpStatusCode.OK)
      .json({ message: "Appointment marked as completed", markedAsCompleted });
  } catch (error: any) {
    console.error("Error marking appointment as completed:", error.message);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred while marking the appointment as completed",
      error: error.message,
    });
  }
}

  
}

export default AppointmentController;
