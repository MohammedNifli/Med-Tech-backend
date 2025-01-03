import { DoctorInput } from "../../models/doctorModel.js";
import { IDoctor } from "../../types/doctor.types.js";

export interface IDoctorService {
  register(
    name: string,
    email: string,
    password: string,
    phoneNumber: string
  ): Promise<DoctorInput>;

  login(
    email: string,
    password: string
  ): Promise<{
    doctor:DoctorInput,
    accessToken: string;
    refreshToken: string;
  }>;

  getDoctorProfile(docId: string): Promise<DoctorInput | null>;

  updateDoctorProfile(
    docId: string,
    updatedData: Partial<DoctorInput>
  ): Promise<DoctorInput | null>;

  applyApproval(id: string, data: Partial<DoctorInput>): Promise<DoctorInput >;

  specializationService(): Promise<string[]>;

  filterDoctors(filters: {
    consultationFee?: any;
    rating?: number;
    experience?: number;
    gender?: string;
    consultationMode?: string;
    availability?: string;
  }): Promise<IDoctor[]>;

  fetchDctorStatus(docId:string):Promise<string>;
  changePassword(
    docId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> ;
  uploadProfilePicture(docId:string,pic:string):Promise<any>

  searchDoctor(specialization:string,location:string):Promise<any>
 
}



