import { Worker } from "worker_threads";
import { resolve } from "path";
import { IAppointmentRepo } from "../Interfaces/appointment/IAppointmentRepo.js";
import { IAppointmentData } from "../models/appointmentModel.js";
import { IAppointmentService } from "../Interfaces/appointment/IAppointmentService.js";
import { IUserWalletRepo } from "../Interfaces/userWallet/IUserWalletRepo.js";
import { IAppointment, IPaymentStatus } from "../types/appointment.types.js";

class AppointmentService implements IAppointmentService {
  private appointmentRepo: IAppointmentRepo;
  private userWalletRepo: IUserWalletRepo;

  constructor(
    appointmentRepo: IAppointmentRepo,
    userWalletRepo: IUserWalletRepo
  ) {
    this.appointmentRepo = appointmentRepo;
    this.userWalletRepo = userWalletRepo;
  }

  public async createAppointment(
    appointmentData: IAppointmentData
  ): Promise<IAppointment> {
    try {
      const newAppointment = await this.appointmentRepo.createAppointment(
        appointmentData
      );

      return  newAppointment;
    
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error("This time slot is already booked.");
      }

      throw error;
    }
  }

  public async updatePatientId(
    patientId: string,
    appointmentId: string
  ): Promise<IAppointment> {
    try {
      const updatedAppointment = await this.appointmentRepo.updatePatientId(
        appointmentId,
        patientId
      );

      if (!updatedAppointment) {
        throw new Error("Failed to update the appointment.");
      }
      return updatedAppointment;
    } catch (error: any) {
      throw new Error("Error in AppointmentService: " + error.message);
    }
  }

  public async appointmentRetrieval(
    appointmentId: string
  ): Promise<any> {
    try {
      const appointment =
        await this.appointmentRepo.appointmentRetrievalWithPatient(
          appointmentId
        );

      if (!appointment) {
        throw new Error("Appointment not found");
      }

      return appointment;
    } catch (error: any) {
      console.error("Error in service layer:", error);
      throw new Error(error.message); 
    }
  }

  public async paymentSucceed(appointmentId: string): Promise<IPaymentStatus> {
    try {
      if (!appointmentId) throw Error("appointment id is missing");
      const paymentStatus = await this.appointmentRepo.paymentStatusChange(
        appointmentId
      );
      return paymentStatus;
    } catch (error) {
      
      return {
        status: false,
        message: "error occuring in payment succeed service",
      };
    }
  }

  public async getAppointments(userId: string): Promise<IAppointment[]> {
    try {
      const fetchedAppointmentsWithDocDetails =
        await this.appointmentRepo.appointmentFetching(userId);
      return fetchedAppointmentsWithDocDetails;
    } catch (error: any) {
    
      throw error
    }
  }

  public async cancelAppointment(
    amount: number,
    userId: string,
    appointmentId: string
  ): Promise<IAppointment> {
    try {
      if (!appointmentId) {
        throw new Error("appointment ID is missing");
      }

      
      const cancelledAppointment =
        await this.appointmentRepo.cancelAppointment(appointmentId);
      if (!cancelledAppointment) {
        throw new Error("Appointment cancellation failed");
      }

      const paymentSetUp = await this.userWalletRepo.creditedWalletRepo(
        amount,
        userId,
        appointmentId
      );
     

      return cancelledAppointment;
    } catch (error) {
      console.log(error);
      throw new Error("Error in the cancel appointment service");
    }
  }

  public async fetchOnlineAppointments(userId: string): Promise<IAppointment[]> {
    try {
      const appointments =
        await this.appointmentRepo.fetchingOnlineAppointmentRepo(userId);
      return appointments;
    } catch (error) {
      console.error("Error fetching online appointments in service:", error);
      throw new Error("Error fetching online appointments in service");
    }
  }

  public async offlineConsultaions(userId: string): Promise<IAppointment[]> {
    try {
      const appointments =
        await this.appointmentRepo.fetchingOfflineAppointments(userId);
      return appointments;
    } catch (error) {
      console.error("Error in service layer:", error);
      throw new Error("Error occurred while fetching offline consultations.");
    }
  }

  public async appointmentListService(doctorId: string): Promise<IAppointment[]> {
    try {
      const appointmentList = await this.appointmentRepo.appointmentListRepo(
        doctorId
      );

      if (!appointmentList || appointmentList.length === 0)  throw new Error("No appointments found for the specified doctor.");
    

      return appointmentList;
    } catch (error: any) {
      console.error("Error in appointmentListService:", error);
      throw new Error(`Error in appointmentListService: ${error.message}`);
    }
  }

  public async fetchTodayAppointments(
    doctorId: string
  ): Promise<Number | any> {
    try {
      if (!doctorId) {
        throw new Error("doctor Id is missing ");
      }
      const todayAppointments =
        await this.appointmentRepo.countAppointmentsForToday(doctorId);
      return todayAppointments;
    } catch (error: any) {
      throw Error(
        "error occured in the fetchTodayAppointments service layer",
        error.message
      );
    }
  }

  public async DoctorDashboard(doctorId: string): Promise<any> {
    try {
      if (!doctorId) throw new Error("Doctor ID is missing");
      

      const totalAppointmentsCount =
        await this.appointmentRepo.getTotalAppointmentsCount(doctorId);
      const totalOfflineConsultationCount =
        await this.appointmentRepo.getTotalOfflineAppointmentsForDoctor(
          doctorId
        );
      const totalOnlineConsultationCount =
        await this.appointmentRepo.getTotalOnlineAppointmentsForDoctor(
          doctorId
        );
      const totalPatientsCount =
        await this.appointmentRepo.getTotalPatientCountFromAppointments(
          doctorId
        );

      return {
        totalAppointmentsCount,
        totalOfflineConsultationCount,
        totalOnlineConsultationCount,
        totalPatientsCount,
      };
    } catch (error: any) {
     
      throw new Error(error.message);
    }
  }

  public async getLatestAppointments(doctorId: string): Promise<IAppointment[]> {
    try {
      const latestAppointments =
        await this.appointmentRepo.getLatestAppointmentRepo(doctorId);
      return latestAppointments;
    } catch (error: any) {
      throw Error(
        "error occured in the getLatestAppointmentService",
        error.message
      );
    }
  }

  public async getAppointmentsAndPatients(
    doctorId: string,
    time: string
  ): Promise<any> {
    try {
      const data = await this.appointmentRepo.getAppointmentsAndPatients(
        doctorId,
        time
      );
      return data;
    } catch (error: any) {
      throw new Error(`Error in AppointmentService: ${error.message}`);
    }
  }

  public async patientCtegorizedCount(doctorId: string): Promise<number> {
    try {
      const patientCounts = await this.appointmentRepo.patientsCount(doctorId);
      return patientCounts;
    } catch (error:any) {
      
      throw new Error(`Failed to get patient counts for doctor ${doctorId}: ${error.message}`);
    }
  }

  public async markedAsComplete(appointmentId: string): Promise<any> {
    try {
      const updatedStatus = await this.appointmentRepo.markAsCompleted(
        appointmentId
      );

      if (!updatedStatus) {
        throw new Error("Appointment not found or could not be updated");
      }

      return updatedStatus;
    } catch (error: any) {
     
      throw new Error(error.message || "Service error occurred");
    }
  }
}

export default AppointmentService;
