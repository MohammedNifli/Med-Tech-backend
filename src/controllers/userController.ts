import { Request, Response } from "express";
import AuthService from "../services/userService.js"; 
import { existsSync } from "fs";
import otpService from "../services/otpService.js";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import userService from "../services/userService.js";
// import docService from "../services/doctorService.js";
import {generatePresignedURL} from '../utils/s3UploadPhoto.js'
import Stripe from "stripe";

import {
  mapExperienceToRange,
  mapConsultationFeeToRange,
} from "../utils/doctorFilters.js";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import { IUserService } from "../Interfaces/user/IUserService.js";
import { IDoctorService } from "../Interfaces/doctor/IDoctorService.js";
import { ITimeSlotService } from "../Interfaces/timeSlot/ITimeSlotService.js";
import dotenv from "dotenv";

dotenv.config();


class AuthController {
  private userService: IUserService;
  private docService: IDoctorService;
  private timeSlotService: ITimeSlotService;
  stripe: Stripe;
  constructor(
    userService: IUserService,
    docService: IDoctorService,
    timeSlotService: ITimeSlotService
  ) {
    this.userService = userService;
    this.docService = docService;
    this.timeSlotService = timeSlotService;

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

   

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  
  }
  public async register(req: Request, res: Response): Promise<void> {
    const { name, email, password, phone, gender } = req.body;
    try {
      const newUser = await this.userService.register(
        name,
        email,
        password,
        phone
      );
      console.log("newRegisteredUser", newUser);
      // const otpSend = await otpService.sendOTP(email);
      res.status(HttpStatusCode.CREATED).json({
        message: "User registered successfully",
        user: newUser,
        // OTP: otpSend,
      });
    } catch (error: any) {
      res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
    }
  }

  public async Login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const { user, accessToken, refreshToken } = await this.userService.login(
        email,
        password
      );
      console.log("refreshto", refreshToken);

      //access
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 1 * 60 * 1000,
        path: "/",
      });

      //refresh
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      console.log("cooookie set:", req.cookies);

      res
        .status(HttpStatusCode.OK)
        .json({ message: "Login successful", user, accessToken, refreshToken });
    } catch (error: any) {
      console.error("Error during login:", error.message);

      if (
        error.message === "User not found" ||
        error.message === "Invalid password"
      ) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ message: error.message }); // Unauthorized
      } else {
        res
          .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: "An unexpected error occurred" }); // Internal Server Error
      }
    }
  }

  public async googleLogin(req: Request, res: Response) {
    try {
      const { token } = req.body;
      console.log("Received Token:", token);

      const { newUser, Access_Token, Refresh_Token } =
        await this.userService.googleLogin(token);
      console.log("refrsh", Refresh_Token);
      res.cookie("accessToken", Access_Token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      //refresh
      res.cookie("refreshToken", Refresh_Token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 5 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      res.status(HttpStatusCode.OK).json({
        message: "Logged in Successfully",
        user: newUser,
        accessToken: Access_Token,
        refreshToken: Refresh_Token,
      });
    } catch (error: any) {
      console.error("Error during Google login:", error.message);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Login failed", error: error.message });
    }
  }

  public async logout(req: Request, res: Response): Promise<Response> {
    try {
      console.log("logout");
      // Extract refresh token from cookies
      const accessToken = req.cookies.accessToken;
      const refreshToken = req.cookies.refreshToken;
      console.log("cookies", req.cookies);
      console.log("accessToken", accessToken);
      if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token not found" });
      }

      // Call the AuthService to handle logout logic
      await this.userService.logout(refreshToken);

      // Clear the cookie from the client
      res.cookie("accessToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Ensure cookies are sent over HTTPS in production

        expires: new Date(0), // Expire the cookie
      });

      res.cookie("refreshToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Ensure cookies are sent over HTTPS in production

        expires: new Date(0), // Expire the cookie
      });

      // Send a success response
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({ message: "Failed to log out" });
    }
  }

  //fetching unique specilization  according to the data  in dcotrs db

  public async fetchingSpecialization(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      //fetching total unique specialization that registered in the web'
      const spec = await this.docService.specialiationService();

      let specializations: string[] = [];
      for (let i = 0; i < 6; i++) {
        specializations.push(spec[i]);
      }

      return res.status(HttpStatusCode.OK).json({
        message: "specilizations fetched succesfully",
        specializations,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Handles the doctor filtering requests

  public async filterDoctors(req: Request, res: Response): Promise<Response> {
    try {
      const {
        consultationFee,
        availability,
        rating,
        experience,
        gender,
        consultationMode,
      } = req.query;
      console.log("query", req.query);

      // Define filters object
      const filters: {
        consultationFee?: any;
        rating?: any;
        experience?: number;
        gender?: string;
        consultationMode?: string;
        availability?: string;
      } = {};

      // Process query parameters into appropriate formats
      if (experience) {
        filters.experience = mapExperienceToRange(experience as string);
      }

      if (consultationFee) {
        filters.consultationFee = mapConsultationFeeToRange(
          consultationFee as string
        );
      }

      if (gender) filters.gender = gender as string;
      if (consultationMode)
        filters.consultationMode = consultationMode as string;
      if (availability) filters.availability = availability as string;

      // Call service to apply filters
      const filteredDoctors = await this.docService.filterDoctors(filters);
      console.log("filtere", filteredDoctors);

      return res
        .status(HttpStatusCode.OK)
        .json({ message: "Filtered successfully", filteredDoctors });
    } catch (error) {
      console.error("Error filtering doctors:", error);
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error while filtering doctors." });
    }
  }

  public async getProfile(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      console.log("userId", userId);

      if (!userId) {
        throw new Error("user id id not provided");
      }

      const userProfile = await this.userService.getProfile(userId);

      return res.status(HttpStatusCode.OK).json({
        message: "succesfully fetched the user profile data",
        userProfile,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error while fetchign user Profile" });
    }
  }

  public async updateUserProfile(req: Request, res: Response) {
    try {
      console.log("update prof");
      const userId = req.params.id;
      const { name, email, phone, gender,photo } = req.body;

      console.log("User ID:", userId); // Log userId separately
      console.log("Profile Data:", { name, email, phone, gender,photo }); // Log profile data as an object

      // let photoUrl = req.file ? req.file.path : undefined;
      // console.log("Photo Info:", photoUrl);

      // Validate required fields
      if (!userId) {
        return res.status(400).json({ message: "UserId is required" });
      }

      // Call the user service to update the profile
      const updatedProfile = await this.userService.updateUserProfile(userId, {
        name,
        email,
        phone,
        gender,
        photo, // Include photo URL if available
      });

      if (!updatedProfile) {
        return res
          .status(404)
          .json({ message: "User not found or update failed" });
      }

      // console.log("Updated Profile:", updatedProfile); // Log the updated profile

      return res
        .status(200)
        .json({ message: "Profile updated successfully", updatedProfile });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res
        .status(500)
        .json({ message: "Server error occurred while updating profile" });
    }
  }

  //Change Password in user-Profile
 

  //fetching specific profile
  public async fetchingDoctorProfile(req: Request, res: Response) {
    try {
      console.log("prrrr");
      const docId = req.query.id as string;
      console.log("docId", docId);

      const fetchedProfile = await this.docService.getDoctorProfile(docId);

      res
        .status(HttpStatusCode.OK)
        .json({
          message: "doctor profile fetched succesfully",
          fetchedProfile,
        });
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "error occuring in doctor profile fetching" });
    }
  }



  
  //user change password

  public async userChangePassword(req: Request, res: Response): Promise<any> {
    try {
      console.log("hello world");
      const { userId, currentPassword, newPassword, confirmPassword } = req.body;  // Fix typo here
  
      const message = await this.userService.userChangePasswordService(userId, currentPassword, newPassword, confirmPassword);
      
      // Determine response based on the message from the service
      if (message === "Password updated successfully.") {
        return res.status(HttpStatusCode.OK).json({ message });
      } else {
        return res.status(HttpStatusCode.BAD_REQUEST).json({ message }); // Return specific message for each error case
      }
  
    } catch (error) {
      console.log("Error in userChangePassword:", error);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while changing the password." });
    }
  }



  public async bookAppointment(req: Request, res: Response) {
    try {
      const data = req.body;
      console.log(data);

      // const bookAppointment=await this.docService.bookAppointment(data)
    } catch (error) {
      console.log(error);
    }
  }


  //presigned Url generation
  public async s3PresignedUrlCreation(req:Request,res:Response):Promise<any>{
    try{
      const {fileName,fileType}=req.body;
      
      const presignedUrl=await generatePresignedURL(fileName,fileType);
      console.log('presigned url in backend',presignedUrl)
      res.json({presignedUrl})

    }catch(error){
      console.log(error)
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:'error in presigned url creation'})
    }
  }


public async fetchedOnlineSlots(req:Request,res:Response):Promise<any>{
  try{



  }catch(error){
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:'Internal Server Error',})
  }
}
  

public async fetchDoctorOnlineSlots(
  req: Request,
  res: Response
): Promise<Response> {
  const doctorId = req.query.id as string;
  const selectedDate = req.query.date as string; // Format: YYYY-MM-DD
  console.log("Doctor ID:", doctorId, "Selected Date:", selectedDate);

  if (!selectedDate) {
    return res
      .status(400)
      .json({ message: "Date is required for slot search." });
  }

  try {
    const fetchedSlots = await this.timeSlotService.fetchDoctorSlotsService(
      doctorId
    );
    console.log("Fetched Slots:", fetchedSlots);

    if (!fetchedSlots || fetchedSlots.length === 0) {
      return res
        .status(404)
        .json({ message: "No slots available for this doctor." });
    }

    // Normalize selectedDate to DD/MM/YYYY
    const normalizedSelectedDate = new Date(selectedDate).toLocaleDateString(
      "en-GB"
    ); // Format: DD/MM/YYYY
    console.log("Normalized Selected Date:", normalizedSelectedDate);

    // Filter slots based on normalized date
    const filteredSlots = fetchedSlots.filter((slot: any) => {
      // Assuming slot.date is in DD/MM/YYYY format, normalize the slot date
      const normalizedSlotDate = new Date(
        slot.date.split("/").reverse().join("-")
      ).toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
      return normalizedSlotDate === normalizedSelectedDate;
    });

    console.log("Filtered Slots:", filteredSlots);

    if (filteredSlots.length === 0) {
      return res
        .status(404)
        .json({
          message: `No available slots for this doctor on ${selectedDate}.`,
        });
    }

    

    // If needed, you can format the time or other slot details here
    // For example, you might want to include formatted time as in the previous example.

    return res.status(200).json({ message: "Slots found", slots: filteredSlots });
  } catch (error) {
    console.error("Error fetching doctor slots:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
}




public async fetchDoctorOfflineSlots(
  req: Request,
  res: Response
): Promise<Response> {
  const doctorId = req.query.id as string;
  const selectedDate = req.query.date as string; // Format: YYYY-MM-DD
  console.log("selectedDate", selectedDate);

  if (!selectedDate) {
    return res.status(400).json({ message: "Date is required for slot search." });
  }

  try {
    const fetchedSlots = await this.timeSlotService.fetchDoctorOfflineSlotsService(
      doctorId
    );

    if (!fetchedSlots || fetchedSlots.length === 0) {
      return res
        .status(404)
        .json({ message: "No slots available for this doctor." });
    }

    // Normalize the selectedDate and slot dates to a common format (YYYY-MM-DD)
    const normalizedSelectedDate = new Date(selectedDate).toLocaleDateString(
      "en-GB"
    ); // Format: DD/MM/YYYY

    const filteredSlots = fetchedSlots.filter((slot: any) => {
      // Normalize slot.date to match the same format as normalizedSelectedDate
      const normalizedSlotDate = new Date(
        slot.date.split("/").reverse().join("-")
      ).toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
      return normalizedSlotDate === normalizedSelectedDate;
    });

    console.log("fetchedSlots", fetchedSlots);
    console.log("filteredSlots", filteredSlots);

    if (filteredSlots.length === 0) {
      return res.status(404).json({
        message: `No available slots for this doctor on ${selectedDate}.`,
      });
    }

    return res.status(200).json({ slots: filteredSlots });
  } catch (error) {
    console.error("Error fetching doctor slots:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
}



  public async premiumPaymentController(req:Request,res:Response):Promise<any>{
    try{

      const {userId,amount}=req.body;
      console.log('rebdy',req.body)
      const amountInPaise=amount*100;
      const currency='inr'
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
            amount: amount,
            userId: userId,
          },
        },
       
        success_url: `${req.headers.origin}/user/success?userId=${userId}&amount=${amount}`,

        cancel_url: `${req.headers.origin}/user/cancel`,
      });
      
      res.json({ url: session.url });
      
    }catch(error){
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"Internal server error"})
    }
  }



public async webHook(req: Request, res: Response): Promise<void> {
  const sig = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  console.log('heeelellelel')

  if (!endpointSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      res.status(500).send("Webhook secret not configured.");
      return;
  }

  let event: Stripe.Event;

  try {
      event = this.stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
      console.error("Webhook signature verification failed:", err);
      res.status(400).send(`Webhook Error: ${(err as Error).message}`);
      return;
  }

  switch (event.type) {
      case "payment_intent.succeeded":
          // await this.handlePaymentSuccess(event, res);
          break;
      default:
          console.log(`Unhandled event type: ${event.type}`);
          res.status(200).send("Event received.");
  }
}

// private async handlePaymentSuccess(event: Stripe.Event, res: Response): Promise<void> {
//   try {
//       const paymentIntent = event.data.object as Stripe.PaymentIntent;

//       const amount = paymentIntent.metadata?.amount;
//       const userId = paymentIntent.metadata?.userId;

//       if (!userId || !amount) {
//           console.error("Missing userId or amount in metadata.");
//           res.status(400).send("Invalid metadata in webhook.");
//           return;
//       }

//       console.log(`Payment successful for userId: ${userId}, amount: ${amount}`);

//       // Database operations (update user record and payment record)
//       // await Promise.all([
//       //     User.updateOne({ _id: userId }, { $set: { isPremium: true }, $inc: { balance: amount } }),
//       //     Payment.create({
//       //         userId,
//       //         amount,
//       //         status: "succeeded",
//       //         paymentIntentId: paymentIntent.id,
//       //     }),
//       // ]);

//       console.log("Database updated successfully.");
//       res.status(200).send("Payment processed.");
//   } catch (error) {
//       console.error("Error updating database:", error);
//       res.status(500).send("Database update failed.");
//   }
// }



public async changeUserPremiumSetup(req:Request,res:Response):Promise<Response>{
  try{
    const userId=req.query.id as string;
    const changedPremiumStatus=await this.userService.changeUserPremium(userId);
    return res.status(HttpStatusCode.OK).json({message:"successfully changed",changedPremiumStatus});


  } catch(error:any){
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:'Internal server error',error})
}
}

public async checkUserPremiumStatus(req:Request,res:Response):Promise<any>{
  try{
    const userId=req.query.id as string;
    const premiumStatus=await this.userService.checkUserPremiuStatus(userId)
    return res.status(HttpStatusCode.OK).json({message:"premium status fethced succesfully",premiumStatus})


  }catch(error:any){
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"Internal server error",error})
  }
}



public async fetchAllAvailableDoctors(req: Request, res: Response): Promise<Response | undefined> {
  try {
    const doctors = await this.userService.getAllAvailableDoctors();
    return res.status(HttpStatusCode.OK).json({
      message: "Successfully fetched all available doctors",
      data: doctors,
    });
  } catch (error: any) {
    console.error('Error fetching available doctors:', error.message);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch available doctors",
      error: error.message,
    });
  }
}

public async getSearchedDoctors(req: Request, res: Response): Promise<any> {
  try {
    console.log('req.quey',req.query)
    const { specialization, location } = req.query; // Assuming query params are passed
    

    // Call the service method with optional parameters
    const doctors = await this.docService.searchDoctor(
      specialization as string | '',
      location as string |''
    );

    res.status(200).json({ doctors });
  } catch (error:any) {
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server Error', error: error.message });
  }
}




}

export default AuthController;
