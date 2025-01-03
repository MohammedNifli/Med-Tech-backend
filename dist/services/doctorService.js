// import DocRepo from '../repositories/doctorRepo.js';
import bcrypt from "bcryptjs";
import generateAccessToken from "../utils/accessToken.js";
import generateRefreshToken from "../utils/refreshToken.js";
import generateOTP from "../utils/generateOTP.js";
import mailer from "../config/mailer.js";
class DoctorService {
    doctorRepo;
    constructor(doctorRepo) {
        this.doctorRepo = doctorRepo;
    }
    async register(name, email, password, phoneNumber) {
        if (!name || !email || !password || !phoneNumber) {
            throw new Error("All fields are required: name, email, password, and phone number.");
        }
        const existingDoctor = await this.doctorRepo.findDoc(email);
        if (existingDoctor)
            throw new Error("Doctor already registered");
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        await mailer(email, otp);
        const newDoctor = {
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
    async login(email, password) {
        if (!email || !password)
            throw new Error("Credentials must be provided");
        const doctor = await this.doctorRepo.findDoc(email);
        if (!doctor)
            throw new Error("Doctor not found");
        const isPasswordValid = await bcrypt.compare(password, doctor.personalInfo.password);
        if (!isPasswordValid)
            throw new Error("Invalid credentials");
        const docId = doctor._id;
        const accessToken = generateAccessToken(docId.toString(), "doctor");
        const refreshToken = await generateRefreshToken(docId.toString(), "doctor");
        return {
            doctor,
            accessToken,
            refreshToken,
        };
    }
    async getDoctorProfile(docId) {
        if (!docId)
            throw new Error("id is not getting");
        try {
            const doctor = await this.doctorRepo.findDoctorById(docId);
            if (!doctor) {
                throw new Error("Doctor not found");
            }
            return doctor;
        }
        catch (error) {
            throw new Error(`Error fetching doctor profile: ${error.message}`);
        }
    }
    // Edit profile 
    async updateDoctorProfile(docId, updatedData) {
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
        }
        catch (error) {
            throw new Error(`Error updating doctor profile: ${error.message}`);
        }
    }
    async applyApproval(id, data) {
        try {
            if (!id) {
                throw new Error("Doctor ID is required for approval");
            }
            if (!data) {
                throw new Error("approval data is required");
            }
            const applyForApproval = await this.doctorRepo.approval(id, data);
            if (!applyForApproval)
                throw new Error("Approval process failed.");
            return applyForApproval;
        }
        catch (error) {
            throw error;
        }
    }
    async specializationService() {
        try {
            const fetchedSpecializations = await this.doctorRepo.getDistinctSpecializations();
            return fetchedSpecializations;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async filterDoctors(filters) {
        try {
            return await this.doctorRepo.doctorsFiltering(filters);
        }
        catch (error) {
            console.error("Error in filterDoctors service:", error);
            throw new Error("Error while filtering doctors");
        }
    }
    async fetchDctorStatus(docId) {
        try {
            if (docId) {
                const fetchDoctorStatus = await this.doctorRepo.showDoctorStatus(docId);
                return fetchDoctorStatus;
            }
            throw new Error("Doctor ID is not provided");
        }
        catch (error) {
            console.log(error);
            throw new Error("An error occurred while fetching doctor status in service");
        }
    }
    async changePassword(docId, currentPassword, newPassword) {
        try {
            const doctor = await this.doctorRepo.findDoctorById(docId);
            if (!doctor) {
                return { success: false, message: "Doctor not found" };
            }
            const isPasswordCorrect = await bcrypt.compare(currentPassword, doctor.personalInfo?.password);
            if (!isPasswordCorrect) {
                return { success: false, message: "Current password is incorrect" };
            }
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            const passwordChanged = await this.doctorRepo.changePassword(docId, hashedNewPassword);
            return passwordChanged
                ? { success: true, message: "Password changed successfully" }
                : { success: false, message: "Failed to change password" };
        }
        catch (error) {
            console.error(error);
            throw new Error("Service error while changing password");
        }
    }
    async uploadProfilePicture(docId, picPath) {
        try {
            if (!picPath) {
                throw new Error("Picture is not provided");
            }
            const uploadedProfilePic = await this.doctorRepo.updateProfileImage(docId, picPath);
            return uploadedProfilePic;
        }
        catch (error) {
            console.error(error);
            throw new Error("Error uploading profile picture: " + error.message);
        }
    }
    async searchDoctor(specialization, location) {
        try {
            const safeSpecialization = specialization || "";
            const safeLocation = location || "";
            const doctorsData = await this.doctorRepo.SearchDoctorData(safeSpecialization, safeLocation);
            return doctorsData;
        }
        catch (error) {
            throw new Error("Error occurred in the searchDoctor service");
        }
    }
}
export default DoctorService;
