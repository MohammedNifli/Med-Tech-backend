import { IAdmin, IAdminInput } from "../../models/adminModel.js";
import { DoctorInput } from "../../models/doctorModel.js";
import { IUserInput } from "../../models/userModel.js";

interface authTokens {
  accesToken: string;
  refreshToken: string;
}

export interface IAdminService {
  adminLogin(email: string, password: string): Promise<IAdmin & authTokens | null>;
  adminRegister(data: IAdminInput): Promise<IAdmin | null>;
  
  // Fetches all users
  fetchTotalUsers(): Promise<IUserInput[]>;

  // Fetches all doctors
  fetchTotalDoctors(): Promise<DoctorInput[]>;

  // Blocks a user by their ID
  blockUser(userId: string): Promise<IUserInput>;

  // Unblocks a user by their ID
  unBlockUserService(userId: string): Promise<any>;

  // Approves a doctor by their ID
  approvingDoctor(docId: string): Promise<any>;

  // Rejects a doctor's profile by their ID
  rejectingDoctorService(docId: string): Promise<any>;

  //block specific doctor
  blockDoctor(docId:string):Promise<{success:boolean,message:string}>

  unBlockDoctor(docId:string):Promise<{success:boolean,message:string}>
  fetchUserSearchData(data:string):Promise<any>
  fetchDoctorData(data: string): Promise<any>;
  adminDocFilter(filter: string): Promise<any>;

  getDashboardStatService():Promise<any>;
  // processAppointmentDataForGraph():Promise<any>

  fetchYearlyAppointmentData():Promise<any>

  fetchMonthlyData():Promise<any>
  fetchdailyData():Promise<any>

  specializationData():Promise<any>

  getDoctorDashStatService():Promise<any>

  fetchTopRatedDoctors():Promise<any>
  fetchAvailableDoctorsService():Promise<any>
  getSpecailizationPercentageService():Promise<any>
  fetchAppointmentsForDash():Promise<any>
  fetchPateintDataForDash(period:string):Promise<any>

  getNewPatientsService():Promise<any>
  fetchAllAppointmentsService():Promise<any>

  fetchAllPtients():Promise<any>

 

}
