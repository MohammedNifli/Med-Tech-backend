import { Worker } from 'worker_threads';
import { resolve } from 'path';
import { IAppointmentRepo } from '../Interfaces/appointment/IAppointmentRepo.js';
import { IAppointmentData } from '../models/appointmentModel.js';
import { IAppointmentService } from '../Interfaces/appointment/IAppointmentService.js';
import { IUserWalletRepo } from '../Interfaces/userWallet/IUserWalletRepo.js';
import mongoose from 'mongoose';
import { ITimeRepo } from '../Interfaces/timeSlot/ITimeRepo.js';
import { HttpStatusCode } from '../enums/httpStatusCodes.js';


class AppointmentService implements IAppointmentService {
    private appointmentRepo: IAppointmentRepo;
    private userWalletRepo:IUserWalletRepo;
    // private timeSlotRepo:ITimeRepo

    constructor(appointmentRepo: IAppointmentRepo, userWalletRepo: IUserWalletRepo) {
      this.appointmentRepo = appointmentRepo;
      this.userWalletRepo = userWalletRepo; // Initialize here
      // this.timeSlotRepo=timeSlotRepo;
  }
    
    public async createAppointment(appointmentData: IAppointmentData): Promise<any> {
        try {
            // Create the appointment directly
            
            const newAppointment = await this.appointmentRepo.createAppointment(appointmentData);
            
            return { success: true, message: "Appointment successfully created", appointment: newAppointment };
        } catch (error:any) {
            console.log("error",error.code)
            // Check if the error is a duplicate key error
            if ( error.code === 11000) {
                throw new Error("This time slot is already booked.");
            }
            // Propagate other errors
            throw error;
        }
    }
    
    

    public async updatePatientId(patientId: string, appointmentId: string): Promise<any> {
        try {
          const updatedAppointment = await this.appointmentRepo.updatePatientId(appointmentId, patientId);
          return updatedAppointment;
        } catch (error:any) {
          throw new Error('Error in AppointmentService: ' + error.message);
        }
      }

      public async appointmentRetrievalService(appointmentId: string): Promise<any> {
        try {
            const appointment = await this.appointmentRepo.appointmentRetrievalWithPatient(appointmentId);
            
            if (!appointment) {
                throw new Error('Appointment not found');
            }
    
            return appointment;
        } catch (error:any) {
            console.error('Error in service layer:', error);
            throw new Error(error.message); // Propagate error message
        }
    }


    public async paymentSucceed(appointmentId:string):Promise<any>{
        try{
            if(!appointmentId){
                throw Error('appointment id is missing')
            }
            const paymentStatus=await this.appointmentRepo.paymentStatusChange(appointmentId)
            return paymentStatus;

        }catch(error){
            console.log(error);
            return {status:false,message:"error occuring in payment succeed service"}
        }
    }

    public async appointmentFetchingService(userId:string):Promise<any>{
        try{

            const fetchedAppointmentsWithDocDetails=await this.appointmentRepo.appointmentFetching(userId);
            return fetchedAppointmentsWithDocDetails;


        }catch(error:any){
            console.log('error occuring in fetching appointment services',error)
        }

    }

    public async cancelAppointmentService(amount:number,userId:string,appointmentId: string): Promise<any> {
        try {
          if (!appointmentId) {
            throw new Error('appointment ID is missing');
          }
      
          // Call repository to cancel the appointment
          const cancelledAppointment = await this.appointmentRepo.cancelAppointmentRepo(appointmentId);
          if (!cancelledAppointment) {
            throw new Error('Appointment cancellation failed');
          }

          const paymentSetUp=await this.userWalletRepo.creditedWalletRepo(amount,userId,appointmentId)
          console.log('payment is ok',paymentSetUp)
      
          return cancelledAppointment;
      
        } catch (error) {
          console.log(error);
          throw new Error('Error in the cancel appointment service');
        }
      }


      public async fetchOnlineAppointmentService(userId: string): Promise<any> {
        try {
          const appointments = await this.appointmentRepo.fetchingOnlineAppointmentRepo(userId);  // Directly call the repo method
          return appointments;  // Return directly to avoid unnecessary processing
        } catch (error) {
          console.error('Error fetching online appointments in service:', error);  // More descriptive logging
          throw new Error('Error fetching online appointments in service');
        }
      }

      public async offlineConsultaions(userId: string): Promise<any> {
        try {
            const appointments = await this.appointmentRepo.fetchingOfflineAppointments(userId);
            return appointments;
        } catch (error) {
            console.error('Error in service layer:', error);
            throw new Error('Error occurred while fetching offline consultations.');
        }
    }


    public async appointmentListService(doctorId: string): Promise<any> {
      try {
        const appointmentList = await this.appointmentRepo.appointmentListRepo(doctorId);
    
        if (!appointmentList || appointmentList.length === 0) {
          throw new Error("No appointments found for the specified doctor.");
        }
    
        return appointmentList;
    
      } catch (error:any) {
        console.error("Error in appointmentListService:", error);
        throw new Error(`Error in appointmentListService: ${error.message}`);
      }
    }


    public async fetchTodayAppointmentsService(doctorId:string):Promise<Number|any>{
      try{
        if(!doctorId){
          throw new Error('doctor Id is missing ')
        }
        const todayAppointments=await this.appointmentRepo.countAppointmentsForToday(doctorId)
        return todayAppointments;

      }catch(error:any){
        throw Error('error occured in the fetchTodayAppointments service layer',error.message)
      }
    }


    public async DoctorDashboardService(doctorId: string): Promise<any> {
      try {
        if (!doctorId) {
          throw new Error("Doctor ID is missing");
        }
    
        const totalAppointmentsCount = await this.appointmentRepo.getTotalAppointmentsCount(doctorId);
        const totalOfflineConsultationCount = await this.appointmentRepo.getTotalOfflineAppointmentsForDoctor(doctorId);
        const totalOnlineConsultationCount = await this.appointmentRepo.getTotalOnlineAppointmentsForDoctor(doctorId);
        const totalPatientsCount=await this.appointmentRepo.getTotalPatientCountFromAppointments(doctorId)
    
        return {
          totalAppointmentsCount,
          totalOfflineConsultationCount,
          totalOnlineConsultationCount,
          totalPatientsCount
        };
      } catch (error: any) { 
        console.error("Error in getDoctorDashboardData:", error.message);
        throw new Error(error.message);
      }
    }
    

    public async getLatestAppointmentService(doctorId:string):Promise<any>{
      try{

        const latestAppointments=await this.appointmentRepo.getLatestAppointmentRepo(doctorId);
        return latestAppointments;

      }catch(error:any){
        throw Error('error occured in the getLatestAppointmentService',error.message)
      }
    }
    
    public async getAppointmentsAndPatients(doctorId: string, time: string): Promise<any> {
      try {
        const data = await this.appointmentRepo.getAppointmentsAndPatients(doctorId, time);
        return data;
      } catch (error: any) {
        throw new Error(`Error in AppointmentService: ${error.message}`);
      }
    }
    

    public async patientCtegorizedCount(doctorId:string):Promise<any>{
      try{
        const  patientCounts=await this.appointmentRepo.patientsCount(doctorId)
        return patientCounts

      }catch(error){
        
      }
    }


    public async markedAsCompletedService(appointmentId: string): Promise<any> {
      try {
        const updatedStatus = await this.appointmentRepo.markAsCompleted(appointmentId);
    
        if (!updatedStatus) {
          throw new Error("Appointment not found or could not be updated");
        }
    
        return updatedStatus;
      } catch (error: any) {
        console.error("Error in markedAsCompletedService:", error.message);
        throw new Error(error.message || "Service error occurred");
      }
    }
    


}

export default AppointmentService;
