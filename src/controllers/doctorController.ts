import { Request, Response } from "express";
import docService from "../services/doctorService.js";
import otpService from "../services/otpService.js";
import mergeDoctorData from "../utils/mergeDoctorData.js";
import { access } from "fs";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";

import { IDoctorService } from "../Interfaces/doctor/IDoctorService.js";
import { generatePresignedURL } from "../utils/s3UploadPhoto.js";

class DoctorController {
  private docService: IDoctorService;
  constructor(docService: IDoctorService) {
    this.docService = docService;
  }

  public async doctorRegister(req: Request, res: Response) {
    const { name, email, password, phoneNumber } = req.body;
    console.log(name, email, password, phoneNumber);

    const startTime = Date.now(); // Start time log

    try {
      // Measure time taken for registration
      const regStart = Date.now();
      const doctor = await this.docService.register(
        name,
        email,
        password,
        phoneNumber
      );
      console.log(`Registration took: ${Date.now() - regStart}ms`);

      // Measure time taken for OTP sending
      const otpStart = Date.now();

      // console.log(`OTP sending took: ${Date.now() - otpStart}ms`);

      const endTime = Date.now(); // End time log
      console.log(
        `Total time taken for doctorRegister: ${endTime - startTime}ms`
      );

      res
        .status(HttpStatusCode.CREATED)
        .json({ message: "Doctor successfully registered", doctor });
    } catch (error: any) {
      console.error("Error registering doctor:", error);

      res.status(400).json({
        error: true,
        message: error.message || "An unexpected error occurred",
      });
    }
  }

  //Login
  public async doctorLogin(req: Request, res: Response) {
    const { email, password } = req.body;
    console.log(email, password);
    try {
      const { doctor, accessToken, refreshToken } = await this.docService.login(
        email,
        password
      );
      console.log(accessToken, "..............", refreshToken);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 5 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      return res.status(201).json({
        message: "loggedIn successfully",
        id: doctor._id,
        accessToken,
        refreshToken,
        email: doctor.personalInfo.email,
        specialization: doctor.professionalInfo.specialization,
        name: doctor.personalInfo.name,
      });
    } catch (error: any) {
      if (
        error.message === "Doctor is blocked. Please contact our support desk."
      ) {
        return res.status(403).json({ message: error.message }); // 403 Forbidden if blocked
      }
      res.status(400).json({ message: "Login not successful" });
    }
  }

  //Doctor logout

  public async doctorLogout(req: Request, res: Response): Promise<any> {
    try {
      const accessToken = req.cookies.accessToken; // Corrected spelling
      const refreshToken = req.cookies.refreshToken;

      // Tokens deleting from cookies
      if (accessToken) {
        res.cookie("accessToken", " ", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          expires: new Date(0),
        });
      }

      if (refreshToken) {
        res.cookie("refreshToken", " ", {
          // Change 'accessToken' to 'refreshToken' here
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          expires: new Date(0),
        });
      }

      return res
        .status(HttpStatusCode.OK)
        .json({ message: "Doctor logged out successfully" });
    } catch (error) {
      console.error("Error during doctor logout:", error);
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "An error occurred during logout" });
    }
  }

  // Docotor Get Profile
  public async getProfile(req: Request, res: Response) {
    const docId: string = (req.query.id as string) || "";
    console.log("docId", docId);
    console.log("Hello world");

    try {
      // Get doctor profile from service
      const doctorProfile = await this.docService.getDoctorProfile(docId);

      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor not found." });
      }

      return res.status(200).json({
        message: "Doctor profile retrieved successfully.",
        doctorProfile,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error while retrieving the doctor profile.",
      });
    }
  }

  // Edit an existing profile
  public async editProfile(req: Request, res: Response) {
    const docId: string = req.query.id as string;
    const updatedData = req.body;

    // for testing purpose
    // console.log("Hello world",updatedData)

    try {
      if (!docId) {
        return res.status(400).json({ message: "Doctor Id is required" });
      }

      if (!updatedData || Object.keys(updatedData).length === 0) {
        return res.status(400).json({ message: "No update data provided" });
      }
      const existingDoctorProfile = await this.docService.getDoctorProfile(
        docId
      );
      if (!existingDoctorProfile) {
        return res.status(400).json({ message: "Doctor is not found" });
      }
      const mergedData = mergeDoctorData(
        existingDoctorProfile.toObject(),
        updatedData
      );
      console.log("mergedData", mergedData);

      const upadateDoctorProfile = await this.docService.updateDoctorProfile(
        docId,
        mergedData
      );

      return res.status(200).json({
        message: "Doctor Profile Updated Succesfully",
        upadateDoctorProfile,
      });
    } catch (error: any) {
      console.error(`Error updating doctor profile for ID ${docId}:`, error);
      return res.status(500).json({
        message: "Server error while updating doctor profile.",
        error: error.message,
      });
    }
  }

  // Apply for Approval
  // src/controllers/doctorController.ts

  public async applyForApproval(req: Request, res: Response) {
    try {
      const docId = req.params.id;

      console.log("Doctor ID:", docId);
      console.log("Received data from client:", req.body);

      if (!docId) {
        return res.status(400).json({ message: "Doctor ID is required" });
      }

      const approvalData = JSON.parse(req.body.data || "{}");
      const { licenses, certificates, profile } = req.body; // Extract licenses and certificates

      console.log("Received licenses:", licenses);
      console.log("Received certificates:", certificates);

      // Validate licenses and certificates
      if (!licenses.length && !certificates.length) {
        return res
          .status(400)
          .json({ message: "At least one license or certificate is required" });
      }

      // Fetch the existing doctor profile
      const doctorProfile = await this.docService.getDoctorProfile(docId);

      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }

      // Merge existing data with approval data
      const updatedData = mergeDoctorData(
        doctorProfile.toObject(),
        approvalData
      );

      // Add license and certificate information
      updatedData.professionalInfo = updatedData.professionalInfo || {};
      updatedData.professionalInfo.licenseFile = licenses.map(
        (license: string) => ({
          title: "License File", // Add metadata if required
          file: license, // Assume license contains the S3 URL or file path
        })
      );
      updatedData.professionalInfo.certificates = certificates.map(
        (cert: string) => ({
          title: "Certificate File",
          file: cert,
        })
      );
      updatedData.personalInfo.profilePicture = profile;

      // Apply the update for approval
      const approvalStatus = await this.docService.applyApproval(
        docId,
        updatedData
      );

      return res
        .status(HttpStatusCode.OK)
        .json({ message: "Successfully updated for approval", approvalStatus });
    } catch (error) {
      console.error("Error in applyForApproval:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  public async showingDoctorStatus(req: Request, res: Response) {
    try {
      const docId: string = req.params.id;
      console.log(docId);

      if (!docId) {
        throw new Error("id is not getting");
      }

      const fetchDoctorStatus = await this.docService.showingDctorStatusService(
        docId
      );
      return res
        .status(HttpStatusCode.OK)
        .json({ message: "status", fetchDoctorStatus });
    } catch (error) {
      console.log(error);
    }
  }

  public async changePassword(req: Request, res: Response) {
    try {
      console.log("doctor change password controller");
      const { docId, currentPassword, newPassword, confirmPassword } = req.body;
      console.log("oooo", docId, currentPassword, newPassword, confirmPassword);

      // Check if all necessary fields are provided
      if (!docId || !currentPassword || !newPassword || !confirmPassword) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          message:
            "All fields are required (docId, currentPassword, newPassword, confirmPassword)",
        });
      }

      // Check if newPassword and confirmPassword match
      if (newPassword !== confirmPassword) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          message: "New password and confirm password do not match",
        });
      }

      // Call the service layer to handle password change
      const result = await this.docService.changePasswordService(
        docId,
        currentPassword,
        newPassword
      );

      if (result.success) {
        return res
          .status(HttpStatusCode.OK)
          .json({ message: "Password changed successfully" });
      } else {
        return res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ message: result.message });
      }
    } catch (error) {
      console.error(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  }

  public async doctorProfilePictureFixing(req: Request, res: Response) {
    try {
      const { docId } = req.body; // Get doctor ID from the request body
      const file = req.file; // Get the uploaded file

      // Validate the inputs
      if (!docId || !file) {
        return res
          .status(400)
          .json({ message: "Doctor ID and file are required." });
      }

      // Call the service to upload the picture
      const uploadResponse = await this.docService.uploadProfilePicture(
        docId,
        file.path
      ); // Use file.path for the upload

      // Return success response
      return res
        .status(200)
        .json({
          message: "Profile picture updated successfully",
          data: uploadResponse,
        });
    } catch (error: any) {
      console.error(error);
      return res
        .status(500)
        .json({
          message: "Failed to upload profile picture",
          error: error.message,
        });
    }
  }

  public async s3PresignedUrlGeneration(
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const { files } = req.body; // Array of { fileName, fileType }

      const presignedUrls = await Promise.all(
        files.map((file: { fileName: string; fileType: string }) =>
          generatePresignedURL(file.fileName, file.fileType)
        )
      );

      console.log("Presigned URLs:", presignedUrls);
      res.json({ presignedUrls }); // Return an array of presigned URLs
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error generating presigned URL" });
    }
  }

  public async s3PresignedUrlCreation(
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const { fileName, fileType } = req.body;

      const presignedUrl = await generatePresignedURL(fileName, fileType);
      console.log("presigned url in backend", presignedUrl);
      res.json({ presignedUrl });
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "error in presigned url creation" });
    }
  }


  
}

export default DoctorController;
