import { DoctorInput } from "../../models/doctorModel.js";
import { IDoctor } from "../../types/doctor.types.js";

export interface IDoctorRepo {
  findDoc(email: string): Promise<DoctorInput | null>;

  createDoc(doc: Partial<DoctorInput>): Promise<DoctorInput | undefined>;

  findDoctorById(docId: string): Promise<DoctorInput | null>;

  updateProfile(
    docId: string,
    updateData: Partial<DoctorInput>
  ): Promise<DoctorInput | null>;

  approval(docId: string, data: Partial<DoctorInput>): Promise<DoctorInput | { applyApproval: DoctorInput | null }>;

  getDistinctSpecializations(): Promise<string[]>;

  doctorsFiltering(filters: {
    consultationFee?: any;
    rating?: number;
    experience?: number;
    gender?: string;
    consultationMode?: string;
  }): Promise<DoctorInput[]>;

  fetchingDoctors(): Promise<DoctorInput[]>;
  showDoctorStatus(docId:string):Promise <any>;
  approvingStatus(docId:string):Promise<any>;
  rejectingDocProfile(docId:string):Promise<any>

  doctorBlock(docId:string):Promise<any>
  unBlockDoctor(docId:string):Promise<any>
  adminSearchDoctorData(data: string): Promise<IDoctor[]>
  changePassword(docId: string, newPass: string): Promise<boolean>
  updateProfileImage(docId:string,pic:string):Promise<IDoctor>
  doctorFiltering(filter: string): Promise<any>
  
  fetchTotalDoctorsCount(): Promise<number>
  fetchTotalMaleDoctorsAvailable():Promise<any>
  fetchTotalFemaleDoctorsAvailable():Promise<any>
   fetchOtherGender():Promise<any>
   SearchDoctorData(specialization:string,location:string):Promise<any>
 
}


