import { generatePresignedURL } from "../utils/s3UploadPhoto.js";
import Stripe from "stripe";
import { mapExperienceToRange, mapConsultationFeeToRange, } from "../utils/doctorFilters.js";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import dotenv from "dotenv";
dotenv.config();
class userController {
    userService;
    docService;
    timeSlotService;
    stripe;
    constructor(userService, docService, timeSlotService) {
        this.userService = userService;
        this.docService = docService;
        this.timeSlotService = timeSlotService;
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("STRIPE_SECRET_KEY is not set");
        }
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    async register(req, res) {
        const { name, email, password, phone } = req.body;
        try {
            const newUser = await this.userService.register(name, email, password, phone);
            res.status(HttpStatusCode.CREATED).json({
                message: "User registered successfully",
                user: newUser,
            });
        }
        catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error.message });
        }
    }
    async Login(req, res) {
        const { email, password } = req.body;
        try {
            const { user, accessToken, refreshToken } = await this.userService.login(email, password);
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "none",
                maxAge: 1 * 60 * 1000,
                path: "/",
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "none",
                maxAge: 1 * 24 * 60 * 60 * 1000,
                path: "/",
            });
            return res
                .status(HttpStatusCode.OK)
                .json({ message: "Login successful", user, accessToken, refreshToken });
        }
        catch (error) {
            if (error.message === "User not found" ||
                error.message === "Invalid password") {
                return res
                    .status(HttpStatusCode.UNAUTHORIZED)
                    .json({ message: error.message });
            }
            else {
                return res
                    .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                    .json({ message: "An unexpected error occurred" });
            }
        }
    }
    async googleLogin(req, res) {
        try {
            const { token } = req.body;
            const { newUser, Access_Token, Refresh_Token } = await this.userService.googleLogin(token);
            res.cookie("accessToken", Access_Token, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 1 * 24 * 60 * 60 * 1000,
                path: "/",
            });
            res.cookie("refreshToken", Refresh_Token, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 5 * 24 * 60 * 60 * 1000,
                path: "/",
            });
            return res.status(HttpStatusCode.OK).json({
                message: "Logged in Successfully",
                user: newUser,
                accessToken: Access_Token,
                refreshToken: Refresh_Token,
            });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Login failed", error: error.message });
        }
    }
    async logout(req, res) {
        try {
            const accessToken = req.cookies.accessToken;
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(400).json({ message: "Refresh token not found" });
            }
            await this.userService.logout(refreshToken);
            res.cookie("accessToken", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                expires: new Date(0),
            });
            res.cookie("refreshToken", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                expires: new Date(0),
            });
            return res.status(HttpStatusCode.OK).json({ message: "Logged out successfully" });
        }
        catch (error) {
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to log out" });
        }
    }
    async fetchingSpecialization(req, res) {
        try {
            const spec = await this.docService.specializationService();
            let specializations = [];
            for (let i = 0; i < 6; i++) {
                specializations.push(spec[i]);
            }
            return res.status(HttpStatusCode.OK).json({
                message: "specilizations fetched succesfully",
                specializations,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async filterDoctors(req, res) {
        try {
            const { consultationFee, availability, rating, experience, gender, consultationMode, } = req.query;
            const filters = {};
            if (experience) {
                filters.experience = mapExperienceToRange(experience);
            }
            if (consultationFee) {
                filters.consultationFee = mapConsultationFeeToRange(consultationFee);
            }
            if (gender)
                filters.gender = gender;
            if (consultationMode)
                filters.consultationMode = consultationMode;
            if (availability)
                filters.availability = availability;
            const filteredDoctors = await this.docService.filterDoctors(filters);
            return res
                .status(HttpStatusCode.OK)
                .json({ message: "Filtered successfully", filteredDoctors });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Server error while filtering doctors." });
        }
    }
    async getProfile(req, res) {
        try {
            const userId = req.params.id;
            if (!userId) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({
                    message: "User ID is required",
                });
            }
            const userProfile = await this.userService.getProfile(userId);
            if (!userProfile) {
                return res.status(HttpStatusCode.NOT_FOUND).json({
                    message: `User profile not found for ID: ${userId}`,
                });
            }
            return res.status(HttpStatusCode.OK).json({
                message: "succesfully fetched the user profile data",
                userProfile,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: "An error occurred while fetching the user profile. Please try again later.",
            });
        }
    }
    async updateUserProfile(req, res) {
        try {
            const userId = req.params.id;
            const { name, email, phone, gender, photo } = req.body;
            if (!userId) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "UserId is required" });
            }
            const updatedProfile = await this.userService.updateUserProfile(userId, {
                name,
                email,
                phone,
                gender,
                photo,
            });
            if (!updatedProfile) {
                return res
                    .status(HttpStatusCode.NOT_FOUND)
                    .json({ message: "User not found or update failed" });
            }
            return res
                .status(HttpStatusCode.OK)
                .json({ message: "Profile updated successfully", updatedProfile });
        }
        catch (error) {
            console.error("Error updating profile:", error);
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Server error occurred while updating profile" });
        }
    }
    async fetchingDoctorProfile(req, res) {
        try {
            const docId = req.query.id;
            const fetchedProfile = await this.docService.getDoctorProfile(docId);
            return res.status(HttpStatusCode.OK).json({
                message: "doctor profile fetched succesfully",
                fetchedProfile,
            });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "error occuring in doctor profile fetching" });
        }
    }
    async userChangePassword(req, res) {
        try {
            const { userId, currentPassword, newPassword, confirmPassword } = req.body;
            const message = await this.userService.changePassword(userId, currentPassword, newPassword, confirmPassword);
            if (message === "Password updated successfully.") {
                return res.status(HttpStatusCode.OK).json({ message });
            }
            else {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message });
            }
        }
        catch (error) {
            console.log("Error in userChangePassword:", error);
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "An error occurred while changing the password." });
        }
    }
    async s3PresignedUrlCreation(req, res) {
        try {
            const { fileName, fileType } = req.body;
            const presignedUrl = await generatePresignedURL(fileName, fileType);
            return res.json({ presignedUrl });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "error in presigned url creation" });
        }
    }
    async fetchDoctorOnlineSlots(req, res) {
        const doctorId = req.query.id;
        const selectedDate = req.query.date;
        if (!selectedDate) {
            return res
                .status(400)
                .json({ message: "Date is required for slot search." });
        }
        try {
            const fetchedSlots = await this.timeSlotService.fetchDoctorSlots(doctorId);
            if (!fetchedSlots || fetchedSlots.length === 0) {
                return res
                    .status(404)
                    .json({ message: "No slots available for this doctor." });
            }
            const normalizedSelectedDate = new Date(selectedDate).toLocaleDateString("en-GB");
            const filteredSlots = fetchedSlots.filter((slot) => {
                const normalizedSlotDate = new Date(slot.date.split("/").reverse().join("-")).toLocaleDateString("en-GB");
                return normalizedSlotDate === normalizedSelectedDate;
            });
            if (filteredSlots.length === 0) {
                return res.status(HttpStatusCode.NOT_FOUND).json({
                    message: `No available slots for this doctor on ${selectedDate}.`,
                });
            }
            return res
                .status(HttpStatusCode.OK)
                .json({ message: "Slots found", slots: filteredSlots });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal server error. Please try again later." });
        }
    }
    async fetchDoctorOfflineSlots(req, res) {
        const doctorId = req.query.id;
        const selectedDate = req.query.date;
        if (!selectedDate) {
            return res
                .status(400)
                .json({ message: "Date is required for slot search." });
        }
        try {
            const fetchedSlots = await this.timeSlotService.fetchDoctorOfflineSlots(doctorId);
            if (!fetchedSlots || fetchedSlots.length === 0) {
                return res
                    .status(HttpStatusCode.NOT_FOUND)
                    .json({ message: "No slots available for this doctor." });
            }
            const normalizedSelectedDate = new Date(selectedDate).toLocaleDateString("en-GB");
            const filteredSlots = fetchedSlots.filter((slot) => {
                const normalizedSlotDate = new Date(slot.date.split("/").reverse().join("-")).toLocaleDateString("en-GB");
                return normalizedSlotDate === normalizedSelectedDate;
            });
            if (filteredSlots.length === 0) {
                return res.status(HttpStatusCode.NOT_FOUND).json({
                    message: `No available slots for this doctor on ${selectedDate}.`,
                });
            }
            return res.status(HttpStatusCode.OK).json({ slots: filteredSlots });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal server error. Please try again later." });
        }
    }
    async premiumPaymentController(req, res) {
        try {
            const { userId, amount } = req.body;
            console.log("rebdy", req.body);
            const amountInPaise = amount * 100;
            const currency = "inr";
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency,
                            product_data: {
                                name: "Consultation Fee",
                            },
                            unit_amount: amountInPaise,
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                payment_intent_data: {
                    metadata: {
                        amount: amount,
                        userId: userId,
                    },
                },
                success_url: `${req.headers.origin}/user/success?userId=${userId}&amount=${amount}`,
                cancel_url: `${req.headers.origin}/user/cancel`,
            });
            res.json({ url: session.url });
        }
        catch (error) {
            res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal server error" });
        }
    }
    async webHook(req, res) {
        const sig = req.headers["stripe-signature"];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!endpointSecret) {
            res.status(500).send("Webhook secret not configured.");
            return;
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        }
        catch (err) {
            console.error("Webhook signature verification failed:", err);
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }
        switch (event.type) {
            case "payment_intent.succeeded":
                break;
            default:
                res.status(HttpStatusCode.OK).send("Event received.");
        }
    }
    async changeUserPremiumSetup(req, res) {
        try {
            const userId = req.query.id;
            const changedPremiumStatus = await this.userService.changeUserPremium(userId);
            return res
                .status(HttpStatusCode.OK)
                .json({ message: "successfully changed", changedPremiumStatus });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal server error", error });
        }
    }
    async checkUserPremiumStatus(req, res) {
        try {
            const userId = req.query.id;
            const premiumStatus = await this.userService.checkUserPremiuStatus(userId);
            return res
                .status(HttpStatusCode.OK)
                .json({ message: "premium status fethced succesfully", premiumStatus });
        }
        catch (error) {
            res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal server error", error });
        }
    }
    async fetchAllAvailableDoctors(req, res) {
        try {
            const doctors = await this.userService.getAllAvailableDoctors();
            return res.status(HttpStatusCode.OK).json({
                message: "Successfully fetched all available doctors",
                data: doctors,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: "Failed to fetch available doctors",
                error: error.message,
            });
        }
    }
    async searchDoctorsByCriteria(req, res) {
        try {
            const { specialization, location } = req.query;
            const doctors = await this.docService.searchDoctor(specialization, location);
            res.status(HttpStatusCode.OK).json({ doctors });
        }
        catch (error) {
            res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal server Error", error: error.message });
        }
    }
}
export default userController;
