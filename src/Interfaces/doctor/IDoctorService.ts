import { DoctorInput } from "../../models/doctorModel.js";

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

  specialiationService(): Promise<string[]>;

  filterDoctors(filters: {
    consultationFee?: any;
    rating?: number;
    experience?: number;
    gender?: string;
    consultationMode?: string;
    availability?: string;
  }): Promise<any[]>;

  showingDctorStatusService(docId:string):Promise<string>;
  changePasswordService(
    docId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> ;
  uploadProfilePicture(docId:string,pic:string):Promise<any>

  searchDoctor(specialization:string,location:string):Promise<any>
 
}



