import mergeDoctorData from "../utils/mergeDoctorData.js";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import { generatePresignedURL } from "../utils/s3UploadPhoto.js";
class DoctorController {
    docService;
    constructor(docService) {
        this.docService = docService;
    }
    async doctorRegister(req, res) {
        const { name, email, password, phoneNumber } = req.body;
        if (!name || !email || !password || !phoneNumber) {
            return res
                .status(HttpStatusCode.BAD_REQUEST)
                .json({ error: true, message: "All fields are required: name, email, password, and phone number." });
        }
        const startTime = Date.now();
        try {
            const regStart = Date.now();
            const doctor = await this.docService.register(name, email, password, phoneNumber);
            const endTime = Date.now();
            return res.status(HttpStatusCode.CREATED).json({
                message: "Doctor successfully registered",
                doctor,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                error: true,
                message: error instanceof Error ? error.message : "An unexpected error occurred",
            });
        }
    }
    //Login
    async doctorLogin(req, res) {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Email and password must be provided." });
        try {
            const { doctor, accessToken, refreshToken } = await this.docService.login(email, password);
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
            return res.status(HttpStatusCode.CREATED).json({
                message: "loggedIn successfully",
                id: doctor._id,
                accessToken,
                refreshToken,
                email: doctor.personalInfo.email,
                specialization: doctor.professionalInfo.specialization,
                name: doctor.personalInfo.name,
            });
        }
        catch (error) {
            if (error.message === "Doctor is blocked. Please contact our support desk.") {
                return res.status(403).json({ message: error.message });
            }
            return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Login not successful" });
        }
    }
    //Doctor logout
    async doctorLogout(req, res) {
        try {
            const accessToken = req.cookies.accessToken;
            const refreshToken = req.cookies.refreshToken;
            if (accessToken) {
                res.cookie("accessToken", " ", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    expires: new Date(0),
                });
            }
            if (refreshToken) {
                res.cookie("refreshToken", " ", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    expires: new Date(0),
                });
            }
            return res
                .status(HttpStatusCode.OK)
                .json({ message: "Doctor logged out successfully" });
        }
        catch (error) {
            console.error("Error during doctor logout:", error);
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "An error occurred during logout" });
        }
    }
    async getProfile(req, res) {
        const docId = req.query.id || "";
        try {
            const doctorProfile = await this.docService.getDoctorProfile(docId);
            if (!doctorProfile) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: "Doctor not found." });
            }
            return res.status(HttpStatusCode.OK).json({
                message: "Doctor profile retrieved successfully.",
                doctorProfile,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: "Server error while retrieving the doctor profile.",
            });
        }
    }
    // Edit an existing profile
    async editProfile(req, res) {
        const docId = req.query.id;
        const updatedData = req.body;
        try {
            if (!docId) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Doctor Id is required" });
            }
            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "No update data provided" });
            }
            const existingDoctorProfile = await this.docService.getDoctorProfile(docId);
            if (!existingDoctorProfile) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Doctor is not found" });
            }
            const mergedData = mergeDoctorData(existingDoctorProfile.toObject(), updatedData);
            const upadateDoctorProfile = await this.docService.updateDoctorProfile(docId, mergedData);
            return res.status(HttpStatusCode.OK).json({
                message: "Doctor Profile Updated Succesfully",
                upadateDoctorProfile,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: "Server error while updating doctor profile.",
                error: error.message,
            });
        }
    }
    // Apply for Approval
    async applyForApproval(req, res) {
        try {
            const docId = req.params.id;
            if (!docId) {
                return res.status(400).json({ message: "Doctor ID is required" });
            }
            const approvalData = JSON.parse(req.body.data || "{}");
            const { licenses, certificates, profile } = req.body; // Extract licenses and certificates
            if (!licenses.length && !certificates.length) {
                return res
                    .status(400)
                    .json({ message: "At least one license or certificate is required" });
            }
            const doctorProfile = await this.docService.getDoctorProfile(docId);
            if (!doctorProfile) {
                return res.status(404).json({ message: "Doctor profile not found" });
            }
            const updatedData = mergeDoctorData(doctorProfile.toObject(), approvalData);
            updatedData.professionalInfo = updatedData.professionalInfo || {};
            updatedData.professionalInfo.licenseFile = licenses.map((license) => ({
                title: "License File",
                file: license,
            }));
            updatedData.professionalInfo.certificates = certificates.map((cert) => ({
                title: "Certificate File",
                file: cert,
            }));
            updatedData.personalInfo.profilePicture = profile;
            const approvalStatus = await this.docService.applyApproval(docId, updatedData);
            return res
                .status(HttpStatusCode.OK)
                .json({ message: "Successfully updated for approval", approvalStatus });
        }
        catch (error) {
            console.error("Error in applyForApproval:", error);
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
        }
    }
    async fetchDoctorStatus(req, res) {
        try {
            const docId = req.params.id;
            if (!docId) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: "doctor Id is missing" });
            }
            const fetchDoctorStatus = await this.docService.fetchDctorStatus(docId);
            return res.status(HttpStatusCode.OK).json({
                message: "Doctor status fetched successfully",
                fetchDoctorStatus,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: "An error occurred while fetching the doctor status",
                error: error.message,
            });
        }
    }
    async changePassword(req, res) {
        try {
            const { docId, currentPassword, newPassword, confirmPassword } = req.body;
            if (!docId || !currentPassword || !newPassword || !confirmPassword) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({
                    message: "All fields are required (docId, currentPassword, newPassword, confirmPassword)",
                });
            }
            if (newPassword !== confirmPassword) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({
                    message: "New password and confirm password do not match",
                });
            }
            const result = await this.docService.changePassword(docId, currentPassword, newPassword);
            if (result.success) {
                return res
                    .status(HttpStatusCode.OK)
                    .json({ message: "Password changed successfully" });
            }
            else {
                return res
                    .status(HttpStatusCode.UNAUTHORIZED)
                    .json({ message: result.message });
            }
        }
        catch (error) {
            console.error(error);
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal server error" });
        }
    }
    async doctorProfilePictureFixing(req, res) {
        try {
            const { docId } = req.body;
            const file = req.file;
            if (!docId || !file) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "Doctor ID and file are required." });
            }
            const uploadResponse = await this.docService.uploadProfilePicture(docId, file.path);
            return res.status(HttpStatusCode.OK).json({
                message: "Profile picture updated successfully",
                data: uploadResponse,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: "Failed to upload profile picture",
                error: error.message,
            });
        }
    }
    async s3PresignedUrlGeneration(req, res) {
        try {
            const { files } = req.body;
            const presignedUrls = await Promise.all(files.map((file) => generatePresignedURL(file.fileName, file.fileType)));
            return res.json({ presignedUrls });
        }
        catch (error) {
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Error generating presigned URL" });
        }
    }
    async s3PresignedUrlCreation(req, res) {
        try {
            const { fileName, fileType } = req.body;
            const presignedUrl = await generatePresignedURL(fileName, fileType);
            console.log("presigned url in backend", presignedUrl);
            return res.json({ presignedUrl });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "error in presigned url creation" });
        }
    }
}
export default DoctorController;
