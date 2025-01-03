
import { IAdminService } from "../Interfaces/admin/IAdminService.js";
import { IDoctorRepo } from "../Interfaces/doctor/IDoctorRepo.js";
import { IUserRepo } from "../Interfaces/user/IUserRepo.js";
import { IUserInput } from "../models/userModel.js";
import { DoctorInput } from "../models/doctorModel.js";
import { IAdmin, IAdminInput } from "../models/adminModel.js";
import AdminRepo from "../repositories/adminRepository.js";
import { IAdminRepo } from "../Interfaces/admin/IAdminRepo.js";
import bcrypt from "bcryptjs";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import accessToken from "../utils/accessToken.js";
import refreshToken from "../utils/refreshToken.js";
import { IAppointmentRepo } from "../Interfaces/appointment/IAppointmentRepo.js";
import { IPatientRepo } from "../Interfaces/patient/IPatientRepo.js";
import { IfeedbackRepository } from "../Interfaces/feedback/IfeedbackRepo.js";
import { IDoctor } from "../types/doctor.types.js";
import { IUser } from "../types/user.types.js";

interface authTokens {
  accesToken: string;
  refreshToken: string;
}

class adminService implements IAdminService {
  private adminRepo: IAdminRepo;
  private doctorRepo: IDoctorRepo;
  private userRepo: IUserRepo;
  private patientRepo:IPatientRepo;
  private appointmentRepo:IAppointmentRepo;
  private feedbackRepository:IfeedbackRepository;


  constructor(
    adminRepo: IAdminRepo,
    doctorRepo: IDoctorRepo,
    userRepo: IUserRepo,
    patientRepo:IPatientRepo,
    appointmentRepo:IAppointmentRepo,
    feedbackRepository:IfeedbackRepository
  ) {
    this.adminRepo = adminRepo;
    this.doctorRepo = doctorRepo;
    this.userRepo = userRepo;
    this.patientRepo=patientRepo;
    this.appointmentRepo=appointmentRepo;
    this.feedbackRepository=feedbackRepository;
  }
  public async adminLogin(
    email: string,
    password: string
  ): Promise<(IAdmin & authTokens) | null> {
    try {
      const findAdmin = await this.adminRepo.findAdminByEmail(email);

      if (!findAdmin) {
        return Promise.reject({
          message: "Admin not found",
          statusCode: HttpStatusCode.NOT_FOUND,
        });
      }

      const hashedPassword: string = findAdmin.password;
      const isValid = await bcrypt.compare(password, hashedPassword);
      const adminId = findAdmin._id;
      const access_Token = accessToken(adminId as string, "admin");
      const refresh_Token = await refreshToken(adminId as string, "admin");
      console.log(
        `acesstoken,${access_Token} and refreshToken ${refresh_Token}`
      );
      if (!isValid) {
        return Promise.reject({
          message: "Incorrect password",
          statusCode: HttpStatusCode.UNAUTHORIZED,
        });
      }

      return {
        _id: findAdmin._id,
        name: findAdmin.name,
        email: findAdmin.email,
        role: findAdmin.role,
        isVerified: findAdmin.isVerified,
        accesToken: access_Token,
        refreshToken: refresh_Token,
      } as IAdmin & authTokens;
    } catch (error) {
      console.error("Error during admin login:", error);

      return Promise.reject({
        message: "An error occurred during admin login",
        statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      });
    }
  }

  public async adminRegister(data: IAdminInput): Promise<IAdmin | null> {
    try {
      // Check if data is provided
      const { name, email, password, phoneNumber } = data;
      if (!name || !email || !password || !phoneNumber) {
        return Promise.reject({
          message: "Please provide all required data for admin registration",
          statusCode: HttpStatusCode.BAD_REQUEST,
        });
      }

    
      const existingAdmin = await this.adminRepo.findAdminByEmail(data.email);
      if (existingAdmin) {
        return Promise.reject({
          message: "Admin with this email already exists",
          statusCode: HttpStatusCode.CONFLICT, 
        });
      }

      const hashAddminPassword = await bcrypt.hash(password, 10);
      data.password = hashAddminPassword;

      const newAdmin = await this.adminRepo.registerAdmin(data);

      return newAdmin;
    } catch (error) {
      console.error("Error during admin registration:", error);

      return Promise.reject({
        message: "An error occurred during admin registration",
        statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      });
    }
  }

  public async fetchTotalUsers(): Promise<IUserInput[]> {
    try {
      const totalUsersDetails = await this.userRepo.fetchAllUsers();
      if (totalUsersDetails.length === 0) {
        throw new Error("No users found");
      }

      return totalUsersDetails;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async fetchTotalDoctors(): Promise<DoctorInput[]> {
    try {
      const fetchingAllDoctors = await this.doctorRepo.fetchingDoctors();
      return fetchingAllDoctors;
    } catch (error: any) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async blockUser(userId: string): Promise<IUserInput> {
    try {
      if (!userId) {
        throw new Error("userId is not found");
      }

      const updatedUser = await this.userRepo.blockUser(userId);
      return updatedUser as IUserInput;
    } catch (error: any) {
      console.log(error); 
      throw new Error(error.message); 
    }
}



public async unBlockUserService(userId: string): Promise<IUserInput> {
  try {
    const unBlockedUser = await this.userRepo.unBlockUser(userId); 
    return unBlockedUser;
  } catch (error: any) {
    console.error('Error in service while unblocking user:', error);
    throw new Error('Error occurred in service: ' + error.message); 
  }
}



  public async approvingDoctor(docId:string):Promise<IDoctor>{
    try{
      const updatedApprovalStatus=await  this.doctorRepo.approvingStatus(docId)
      return updatedApprovalStatus;

    }catch(error){
     
      throw error;
    }
  }


  public async rejectDoctorApproval(docId:string):Promise<IDoctor>{
    try{
      if(!docId) throw Error("doctor Id is missing")
      const rejectedApprovalStatus=await  this.doctorRepo.rejectingDocProfile(docId)
      return rejectedApprovalStatus;

    }catch(error){
    throw Error;
    }
  }

  //blcokc doctors
  public async blockDoctor(docId: string): Promise<{ success: boolean, message: string }> {
    try {
        if (!docId) {
            throw new Error('Doctor ID is missing');
        }

       
        const blockDoctor = await this.doctorRepo.doctorBlock(docId);

        if (blockDoctor) {
            return { success: true, message: 'Doctor blocked successfully' };
        } else {
            return { success: false, message: 'Failed to block the doctor' };
        }
    } catch (error) {
        console.error("Error in blockDoctor service:", error);
        return { success: false, message: 'An error occurred while blocking the doctor' };
    }
}


public async unBlockDoctor(docId: string): Promise<{ success: boolean, message: string }> {
  try {
      const unBlockDoctor = await this.doctorRepo.unBlockDoctor(docId);

      if (unBlockDoctor) {
          return { success: true, message: 'Doctor unblocked successfully' };
      } else {
          return { success: false, message: "Failed to unblock the doctor" };
      }
  } catch (error) {
      console.error("Error in unBlockDoctor service:", error);
      return { success: false, message: 'An error occurred while unblocking the doctor' };
  }
}


public async fetchUserSearchData(data: string): Promise<IUser[]> {
  try {
      const fetchedData = await this.userRepo.searchUser(data)
      return fetchedData; 
  } catch (error) {
      console.error(error);
      throw new Error('Error in fetching user search data');
  }
}


public async fetchDoctorData(data: string): Promise<IDoctor[]> {
  try {
      const fetchedDoctors = await this.doctorRepo.adminSearchDoctorData(data);
      return fetchedDoctors;
  } catch (error) {
      console.error(error);
      throw new Error('Error in fetching doctor data');
  }
}

public async adminDocFilter(filter: string): Promise<IDoctor[]> {
  try {
      
      const filteredDoctors = await this.doctorRepo.doctorFiltering(filter);
      return filteredDoctors;
  } catch (error) {
      console.log('Error in adminDocFilter:', error);
      throw error; 
  }
}


public async getDashboardStatService():Promise<{appointmentCount:number;patientCount:number;doctorsCount:number}>{
  try{
    
    const appointmentCount=await this.appointmentRepo.fetchTotalAppointmentsCount();
    const patientCount=await this.patientRepo.fetchTotalPatientCount()
    const doctorsCount=await this.doctorRepo.fetchTotalDoctorsCount()
    return {appointmentCount,patientCount,doctorsCount}
    

  }catch(error:any){
    throw new  Error(error)
    console.log(error)
  }
}



public  async fetchYearlyAppointmentData():Promise<any>{
  try{

    const appoinmtentData=await this.appointmentRepo.fetchYearlyAppointmentData();
    return appoinmtentData;
    

  }catch(error){
    console.log(error)
  }
}

public async fetchMonthlyData():Promise<any>{
  try{

    const appoinmtentData=await this.appointmentRepo.fetchMonthlyAppointmentData();
    return appoinmtentData;

  }catch(error:any){
    throw new Error(error)
    console.log(error)
  }
}

public async fetchdailyData():Promise<any>{
  try{

    const appoinmtentData=await this.appointmentRepo.fetchDailyAppointmentData();
    return appoinmtentData;


  }catch(error:any){
    console.log(error);
    throw new Error(error)
  }
}


public async specializationData():Promise<any>{
  try{
    const specializations=await this.appointmentRepo.fetchingspecialisationStats();
    return specializations;

  }catch(error:any){
    console.log(error);
    throw new Error(error)
  }
}

public async getDoctorDashStatService():Promise<any>{
  try{
    
    const maleDoctorsIntheMedTech=await this.doctorRepo.fetchTotalMaleDoctorsAvailable()
  
    const femaleDoctorsIntheMedTech=await this.doctorRepo.fetchTotalFemaleDoctorsAvailable()
  
    const otherGender=await this.doctorRepo.fetchOtherGender()
    return {maleDoctorsIntheMedTech,femaleDoctorsIntheMedTech,otherGender}

  }catch(error:any){

    throw Error(error)
  }
}


public async fetchTopRatedDoctors(): Promise<IDoctor[]> {
  try {
      const topRatedDoctors = await this.feedbackRepository.fetchTopRatedDoctors();
      return topRatedDoctors; 
  } catch (error: any) {
      throw new Error(`Error occurred in the fetchTopRatedDoctors service layer: ${error.message}`);
  }
}

public async fetchAvailableDoctorsService():Promise<any>{
  try{
    const availableDcotors=await this.appointmentRepo.fetchAvailableDoctors()
    return availableDcotors

  }catch(error:any){
    throw new Error("error occured in the fetchAvailableDoctorsService",error.message)
    console.log(error)
  }
}


public async getSpecailizationPercentageService():Promise<any>{
  try{
    const specialisationPercentage=await this.appointmentRepo.getSpecialisationPercentageRepo()
    return specialisationPercentage

  }catch(error:any){
    throw new Error(error.message)
    console.log(error)
  }
}


public async fetchAppointmentsForDash():Promise<any>{
  try{
    const appointments=await this.appointmentRepo.getAppointmentForDashboard();
    return appointments

  }catch(error:any){
    throw new Error(error.message)
  }
}



public async fetchPateintDataForDash(period:string):Promise<any>{

  try{
    let patientDataForDash;

    if(period=='yearly'){
      patientDataForDash=await this.patientRepo.getYearlyPatientDataForDash()
    }else if(period=='monthly'){
      patientDataForDash=await this.patientRepo.getMonthlyPatientDataForDash();

    }else if(period=='daily'){
      patientDataForDash=await this.patientRepo.getDailyPatientDataForDash()
    }

    return patientDataForDash;

  }catch(error:any){
    throw Error(error.message)
  }
}

public async getNewPatientsService():Promise<any>{
  try{
    const newPatients=await this.patientRepo.fetchingPatientsFordash();
    return newPatients;

  }catch(error:any){
    throw Error(error.message)
  }
}

public async fetchAllAppointmentsService():Promise<any>{
  try{
    const fetchedAppointments=await this.appointmentRepo.fetchAllAppointmentRepo()
    return fetchedAppointments

  }catch(error){
    console.log(error)
  }
}

public async fetchAllPtients():Promise<any>{
  try{

    const fetchAllPatients=await this.patientRepo.fetchAllPatientDetails();
    return fetchAllPatients;

  }catch(error){
    console.log(error)
  }
}

}





export default adminService;
