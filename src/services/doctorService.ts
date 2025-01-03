// import DocRepo from '../repositories/doctorRepo.js';
import bcrypt from "bcryptjs";
import generateAccessToken from "../utils/accessToken.js";
import generateRefreshToken from "../utils/refreshToken.js";
import generateOTP from "../utils/generateOTP.js";
import mailer from "../config/mailer.js";
import { DoctorInput } from "../models/doctorModel.js";
import { ObjectId } from "mongodb";
import { IDoctorRepo } from "../Interfaces/doctor/IDoctorRepo.js";
import { IDoctorService } from "../Interfaces/doctor/IDoctorService.js";
import { IDoctor } from "../types/doctor.types.js";

class DoctorService implements IDoctorService {
  private doctorRepo: IDoctorRepo;
  constructor(doctorRepo: IDoctorRepo) {
    this.doctorRepo = doctorRepo;
  }

  public async register(
    name: string,
    email: string,
    password: string,
    phoneNumber: string
  ): Promise<DoctorInput> {
    if (!name || !email || !password || !phoneNumber) {
      throw new Error(
        "All fields are required: name, email, password, and phone number."
      );
    }

    const existingDoctor = await this.doctorRepo.findDoc(email);
    if (existingDoctor) throw new Error("Doctor already registered");


    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    await mailer(email, otp);

    const newDoctor: Partial<DoctorInput> = {
      personalInfo: {
        name,
        gender: "Other",
        email,
        phone: phoneNumber,
        password: hashedPassword,
        address: {},
      },
      professionalInfo: {
        specialization: "",
        qualifications: [],
        licenseNumber: "",
        licenseFile: [],
        certificates: [],
        languages: [],
      },
      practiceInfo: {
        clinics: [],
        consultationModes: {
          online: false,
          offline: false,
        },
      },
      financialInfo: {
        consultationFees: {},
      },
    };

    const createdDoctor = await this.doctorRepo.createDoc(newDoctor);
    if (!createdDoctor) {
      throw new Error("Error occurred while creating the doctor.");
    }

    return createdDoctor;
  }

  //login doctor

  public async login(
    email: string,
    password: string
  ): Promise<{
    doctor: DoctorInput;
    accessToken: string;
    refreshToken: string;
  }> {
    if (!email || !password) throw new Error("Credentials must be provided");

    const doctor = await this.doctorRepo.findDoc(email);

    if (!doctor) throw new Error("Doctor not found");
    

    const isPasswordValid = await bcrypt.compare(
      password,
      doctor.personalInfo.password
    );
    if (!isPasswordValid) throw new Error("Invalid credentials");
    

    const docId: ObjectId = doctor._id as ObjectId;

    const accessToken = generateAccessToken(docId.toString(), "doctor");
    const refreshToken = await generateRefreshToken(docId.toString(), "doctor");

    return {
      doctor,
      accessToken,
      refreshToken,
    };
  }



  public async getDoctorProfile(docId: string) {
    if (!docId) throw new Error("id is not getting");
    

    try {
      const doctor = await this.doctorRepo.findDoctorById(docId);

      if (!doctor) {
        throw new Error("Doctor not found");
      }
      return doctor;
    } catch (error: any) {
      throw new Error(`Error fetching doctor profile: ${error.message}`);
    }
  }

  // Edit profile 
  public async updateDoctorProfile(
    docId: string,
    updatedData: Partial<DoctorInput>
  ): Promise<DoctorInput | null> {
    if (!docId) {
      throw new Error("Doctor ID is required");
    }
  
    if (!updatedData) {
      throw new Error("Updated data is required");
    }
  
    try {
      const updatedDoctor = await this.doctorRepo.updateProfile(docId, updatedData);
  
      if (!updatedDoctor) {
        throw new Error("Failed to update doctor profile");
      }
  
      return updatedDoctor;
    } catch (error: any) {
      throw new Error(`Error updating doctor profile: ${error.message}`);
    }
  }
  


  public async applyApproval(id: string, data: Partial<DoctorInput>) {
    try {
      if (!id) {
        throw new Error("Doctor ID is required for approval");
      }

      if (!data) {
        throw new Error("approval data is required");
      }

      const applyForApproval = await this.doctorRepo.approval(id, data);
      if (!applyForApproval) throw new Error("Approval process failed.");

      return applyForApproval as DoctorInput;
    } catch (error) {
      throw error;
    }
  }

  public async specializationService() {
    try {
      const fetchedSpecializations =
        await this.doctorRepo.getDistinctSpecializations();
      return fetchedSpecializations;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }

  public async filterDoctors(filters: {
    consultationFee?: any;
    rating?: number;
    experience?: number;
    gender?: string;
    consultationMode?: string;
    availability?: string;
  }): Promise<IDoctor[]> {
    try {
      return await this.doctorRepo.doctorsFiltering(filters);
    } catch (error) {
      console.error("Error in filterDoctors service:", error);
      throw new Error("Error while filtering doctors");
    }
  }

  public async fetchDctorStatus(docId: string): Promise<string> {
    try {
      if (docId) {
        const fetchDoctorStatus = await this.doctorRepo.showDoctorStatus(docId);
        return fetchDoctorStatus;
      }
  
      throw new Error("Doctor ID is not provided");
    } catch (error) {
      console.log(error);
      throw new Error("An error occurred while fetching doctor status in service");
    }
  }
  

  public async changePassword(
    docId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const doctor = await this.doctorRepo.findDoctorById(docId);
      if (!doctor) {
        return { success: false, message: "Doctor not found" };
      }

      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        doctor.personalInfo?.password
      );
      if (!isPasswordCorrect) {
        return { success: false, message: "Current password is incorrect" };
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      const passwordChanged = await this.doctorRepo.changePassword(
        docId,
        hashedNewPassword
      );
      return passwordChanged
        ? { success: true, message: "Password changed successfully" }
        : { success: false, message: "Failed to change password" };
    } catch (error) {
      console.error(error);
      throw new Error("Service error while changing password");
    }
  }

  public async uploadProfilePicture(
    docId: string,
    picPath: string
  ): Promise<any> {
    try {
      if (!picPath) {
        throw new Error("Picture is not provided");
      }

      const uploadedProfilePic = await this.doctorRepo.updateProfileImage(
        docId,
        picPath
      );
      return uploadedProfilePic;
    } catch (error: any) {
      console.error(error);
      throw new Error("Error uploading profile picture: " + error.message);
    }
  }

  public async searchDoctor(
    specialization?: string,
    location?: string
  ): Promise<IDoctor> {
    try {
      const safeSpecialization = specialization || "";
      const safeLocation = location || "";

      const doctorsData = await this.doctorRepo.SearchDoctorData(
        safeSpecialization,
        safeLocation
      );
      return doctorsData;
    } catch (error) {
      throw new Error("Error occurred in the searchDoctor service");
    }
  }
}

export default DoctorService;
