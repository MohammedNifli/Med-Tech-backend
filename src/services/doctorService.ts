// import DocRepo from '../repositories/doctorRepo.js';
import bcrypt from 'bcryptjs';
import generateAccessToken from '../utils/accessToken.js'
import generateRefreshToken from '../utils/refreshToken.js'
import generateOTP from '../utils/generateOTP.js';
import mailer from '../config/mailer.js'
import { DoctorInput } from '../models/doctorModel.js';
import { ObjectId } from 'mongodb';
import doctorRepo from '../repositories/doctorRepo.js';
//importing the doctor service interface 
import { IDoctorRepo } from '../Interfaces/doctor/IDoctorRepo.js';
import { IDoctorService } from '../Interfaces/doctor/IDoctorService.js';

class DoctorService implements IDoctorService {
    private doctorRepo:IDoctorRepo
    constructor(doctorRepo:IDoctorRepo){
        this.doctorRepo=doctorRepo

    }
    


    public async register(name: string, email: string, password: string, phoneNumber: string): Promise<DoctorInput> {
        // Check if all required fields are provided
        if (!name || !email || !password || !phoneNumber) {
            throw new Error("All fields are required: name, email, password, and phone number.");
        }
    
        // Check if the doctor already exists
        const existingDoctor = await this.doctorRepo.findDoc(email);
        if (existingDoctor) {
            throw new Error("Doctor already registered");
        }
    
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Generate OTP and send it via email
        const otp = generateOTP();
        await mailer(email, otp);
    
        // Create a new doctor object with default values
        const newDoctor: Partial<DoctorInput> = {
            personalInfo: {
                name,
                gender: 'Other', // Default value, can be updated later
                email,
                phone: phoneNumber,
                password: hashedPassword,
                address: {} // Empty object for now
            },
            professionalInfo: {
                specialization: '', // To be filled later
                qualifications: [],
                licenseNumber: '', // To be filled later
                licenseFile:[],
                certificates:[],
                languages: []
            },
            practiceInfo: {
                clinics: [],
                consultationModes: {
                    online: false,
                    offline: false
                }
            },
            financialInfo: {
                consultationFees: {}
            },
           
        };
    
        // Save the new doctor to the database
        const createdDoctor = await this.doctorRepo.createDoc(newDoctor);
        if (!createdDoctor) {
            throw new Error('Error occurred while creating the doctor.');
        }
    
        return createdDoctor;
    }


    //login doctor

    public async login(
      email: string,
      password: string
    ): Promise<{ doctor: DoctorInput; accessToken: string; refreshToken: string }> {
      if (!email || !password) {
        throw new Error("Credentials must be provided");
      }
    
      const doctor = await this.doctorRepo.findDoc(email); // Assuming doctorRepo is accessible
      console.log("doctor", doctor);
      
      if (!doctor) {
        throw new Error("Doctor not found");
      }
    
      // if (doctor.isBlocked) {
      //   throw new Error("Doctor is blocked. Please contact our support desk.");
      // }
    
      const isPasswordValid = await bcrypt.compare(password, doctor.personalInfo.password);
      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }
    
      const docId: ObjectId = doctor._id as ObjectId; // Cast _id as ObjectId
      console.log("doctor id", docId);
    
      // Generate access and refresh tokens
      const accessToken = generateAccessToken(docId.toString(), "doctor");
      const refreshToken = await generateRefreshToken(docId.toString(), "doctor");
      console.log("refreshToken", refreshToken);
    
      // Return doctor details and tokens
      return {
        doctor,
        accessToken,
        refreshToken,
      };
    }
    

    // doctor profile getting

    public async getDoctorProfile(docId:string){

     if(!docId){
        throw new Error("id is not getting")
     }

     try{

        const doctor=await this.doctorRepo.findDoctorById(docId);

        if(!doctor){
           throw new Error("Doctor not found")
        }   
        return doctor;

     }catch(error:any){
        throw new Error(`Error fetching doctor profile: ${error.message}`);
     }


    }



    // Edit profile service
    public async updateDoctorProfile(docId:string,updatedData:Partial<DoctorInput>):Promise<DoctorInput | null>{

        try{
            if(!docId){
                 throw new Error("doctor id is not getting...")
            }

            if(!updatedData){
                throw new Error('updated data is not found')
            }

            const updatedDoctor=await this.doctorRepo.updateProfile(docId,updatedData);
            return updatedDoctor;
            
        }catch(error:any){
            throw new  Error(`Error fetching doctor profile ${error.message}`);
        }

        
    }
    public async applyApproval(id:string,data:Partial<DoctorInput>) {
        try{
          if(!id){
            throw new Error("ID is not getting")
          }
      
          if(!data){
            throw new Error("Data is not getting")
          }
      
          const applyForApproval=await this.doctorRepo.approval(id,data);
          return applyForApproval as DoctorInput;
          
        }catch(error){
          throw error
        }
      }

    //specialization fetching service class
    
    public async specialiationService(){

        try{
            const fetchedSpecializations=await this.doctorRepo.fetchingSpecialization();
            return fetchedSpecializations;


        }catch(error:any){
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
      }): Promise<any[]> {
        try {
          
            return await this.doctorRepo.doctorsFiltering(filters);
        } catch (error) {
            console.error("Error in filterDoctors service:", error);
            throw new Error('Error while filtering doctors');
        }
    }

    public async showingDctorStatusService(docId:string):Promise<string>{
      try{
        if(!docId){
          throw Error("doctor id is not getting")
        }


        const fetchDoctorStatus=await this.doctorRepo.showDoctorStatus(docId)
        return fetchDoctorStatus;

      }catch(error){
        console.log(error)
        throw Error('error occuring in doctor status fetching service')
      }

    }


    public async changePasswordService(
      docId: string,
      currentPassword: string,
      newPassword: string
    ): Promise<{ success: boolean; message: string }> {
      try {
        // Fetch the doctor record by ID
        const doctor = await this.doctorRepo.findDoctorById(docId);
        if (!doctor) {
          return { success: false, message: "Doctor not found" };
        }
    
        // Compare the current password with the stored hashed password
        const isPasswordCorrect = await bcrypt.compare(currentPassword, doctor.personalInfo?.password);
        if (!isPasswordCorrect) {
          return { success: false, message: "Current password is incorrect" };
        }
    
        // Hash the new password before saving it
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
        // Proceed to change the password
        const passwordChanged = await this.doctorRepo.changePasswordRepo(docId, hashedNewPassword);
        return passwordChanged
          ? { success: true, message: "Password changed successfully" }
          : { success: false, message: "Failed to change password" };
      } catch (error) {
        console.error(error);
        throw new Error("Service error while changing password");
      }
    }
     
    public async uploadProfilePicture(docId: string, picPath: string): Promise<any> {
      try {
        if (!picPath) {
          throw new Error('Picture is not provided');
        }
  
        // Call repository to update the profile picture
        const uploadedProfilePic = await this.doctorRepo.profilePhotoUpdating(docId, picPath);
        return uploadedProfilePic; // Return the updated profile picture data
      } catch (error:any) {
        console.error(error);
        throw new Error('Error uploading profile picture: ' + error.message);
      }
    }


    public async searchDoctor(specialization?: string, location?: string): Promise<any> {
      try {
        // Convert undefined to empty strings or handle as needed
        const safeSpecialization = specialization || ''; // Default to an empty string if undefined
        const safeLocation = location || ''; // Default to an empty string if undefined
    
        // Call repository method with safe parameters
        const doctorsData = await this.doctorRepo.SearchDoctorData(safeSpecialization, safeLocation);
        return doctorsData;
      } catch (error) {
        throw new Error('Error occurred in the searchDoctor service');
      }
    }
    

  
    

}

export default DoctorService;
