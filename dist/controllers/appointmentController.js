import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
class AppointmentController {
    appointmentService;
    stripe;
    paymentService;
    constructor(appointmentService, paymentService) {
        this.appointmentService = appointmentService;
        this.paymentService = paymentService;
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("STRIPE_SECRET_KEY is not set");
        }
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    timeChangeIntoUTC(date, timeSlot) {
        const exactDate = new Date(date);
        const [hours, minutes] = timeSlot.split(":").map(Number);
        exactDate.setUTCHours(hours, minutes, 0, 0);
        const utcDateTime = exactDate.toISOString();
        return utcDateTime;
    }
    async createAppointment(req, res) {
        const { appointmentData } = req.body;
        const { userId, doctorId, appointmentDate, timeSlot, consultationMode, amount, videoCall, } = appointmentData;
        console.log('appointmentDate------------->', appointmentDate);
        if (!userId ||
            !doctorId ||
            !appointmentDate ||
            !timeSlot ||
            !consultationMode) {
            return res
                .status(HttpStatusCode.BAD_REQUEST)
                .json({ message: "Missing required fields" });
        }
        try {
            const utcDateTime = this.timeChangeIntoUTC(new Date(appointmentDate), timeSlot);
            const appointmentData = {
                userId,
                doctorId,
                appointmentDate: utcDateTime,
                timeSlot,
                consultationMode: consultationMode || "online",
                amount,
                videoCall,
            };
            const result = await this.appointmentService.createAppointment(appointmentData);
            return res
                .status(HttpStatusCode.CREATED)
                .json({ message: result.message, appointment: result.appointment, result });
        }
        catch (error) {
            if (error.message === "This time slot is already booked.") {
                return res
                    .status(HttpStatusCode.CONFLICT)
                    .json({ message: error.message });
            }
            console.error("Error in createAppointment:", error);
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: error.message });
        }
    }
    async stripePaymentController(req, res) {
        try {
            const { amount, currency = "inr", appointmentId, userId } = req.body;
            const amountInPaise = amount * 100;
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
                        appointmentId: String(appointmentId),
                        amount: amount,
                        userId: userId,
                    },
                },
                success_url: `${req.headers.origin}/success`,
                cancel_url: `${req.headers.origin}/cancel`,
            });
            res.json({ url: session.url });
        }
        catch (error) {
            res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ error: error.message });
        }
    }
    async webHook(req, res) {
        const sig = req.headers["stripe-signature"];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!endpointSecret) {
            console.error("STRIPE_WEBHOOK_SECRET is not set");
            res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .send("Webhook secret not configured");
            return;
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        }
        catch (err) {
            res
                .status(HttpStatusCode.BAD_REQUEST)
                .send(`Webhook Error: ${err.message}`);
            return;
        }
        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;
            const appointmentId = paymentIntent.metadata?.appointmentId;
            const amount = paymentIntent.metadata?.amount;
            const userId = paymentIntent.metadata?.userId;
            if (appointmentId) {
                try {
                    const status = "completed";
                    const pisa = Number(amount);
                    await this.appointmentService.paymentSucceed(appointmentId);
                    const payment = await this.paymentService.addPaymentService(userId, appointmentId, pisa, status);
                }
                catch (error) {
                    console.error(`Error handling payment for appointment ${appointmentId}:`, error);
                }
            }
            else {
                console.warn("No appointment ID found in payment metadata.");
            }
        }
        else {
            console.log(`Unhandled event type ${event.type}.`);
        }
        res.status(HttpStatusCode.OK).send("Received event");
    }
    async updatePatientId(req, res) {
        try {
            const { patientId, appointmentId } = req.body;
            if (!patientId || !appointmentId) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ error: "PatientId and AppointmentId are required" });
            }
            const updatedAppointment = await this.appointmentService.updatePatientId(patientId, appointmentId);
            if (updatedAppointment) {
                return res.status(HttpStatusCode.OK).json({
                    message: "Appointment updated successfully",
                    updatedAppointment,
                });
            }
            else {
                return res
                    .status(HttpStatusCode.NOT_FOUND)
                    .json({ error: "Appointment not found" });
            }
        }
        catch (error) {
            console.error("Error in AppointmentController:", error.message);
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ error: "An error occurred while updating the appointment" });
        }
    }
    async getAppointment(req, res) {
        try {
            const appointmentId = req.query.id;
            if (!appointmentId) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "appointmentId is missing" });
            }
            const appointment = await this.appointmentService.appointmentRetrieval(appointmentId);
            if (!appointment) {
                return res
                    .status(HttpStatusCode.NOT_FOUND)
                    .json({ message: "Appointment not found" });
            }
            return res.status(HttpStatusCode.OK).json(appointment);
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal Server Error", error: error.message });
        }
    }
    async fetchAppointments(req, res) {
        try {
            const userId = req.query.id;
            const fetchedAppointments = await this.appointmentService.getAppointments(userId);
            return res.status(HttpStatusCode.OK).json({
                message: "appointments with doctor details fetched succesfully completed",
                fetchedAppointments,
            });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({
                message: "Internal server occuring in fetchAppointments",
                error: error.message,
            });
        }
    }
    async cancelAppointment(req, res) {
        try {
            const { amount, userId, appointmentId } = req.body;
            if (!appointmentId) {
                throw new Error("appointmentId is null");
            }
            const cancelledAppointment = await this.appointmentService.cancelAppointment(amount, userId, appointmentId);
            return res.status(HttpStatusCode.OK).json({
                message: "Appointment successfully cancelled",
                cancelledAppointment,
            });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal Server Error" });
        }
    }
    async resheduleAppointment(req, res) {
        try {
            const { oldDate, newDate, appointmentId, timeSlot } = req.body;
            if (!oldDate || !newDate || !appointmentId || !timeSlot) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "Missing Required Fields" });
            }
            return res
                .status(HttpStatusCode.OK)
                .json({ message: "Appointment rescheduled successfully" });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({
                message: "An error occurred while rescheduling the appointment",
            });
        }
    }
    async fetchingOnlineAppointments(req, res) {
        try {
            const userId = req.query.id;
            if (!userId) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "User ID is required" });
            }
            const fetchedAppointments = await this.appointmentService.fetchOnlineAppointments(userId);
            if (!fetchedAppointments.length) {
                return res
                    .status(HttpStatusCode.NOT_FOUND)
                    .json({ message: "No online appointments found" });
            }
            return res.status(HttpStatusCode.OK).json(fetchedAppointments);
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Something went wrong" });
        }
    }
    async fetchingOfflineAppointments(req, res) {
        try {
            const userId = req.query.id;
            if (!userId) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({
                    message: "User ID is required.",
                });
            }
            const fetchAppointments = await this.appointmentService.offlineConsultaions(userId);
            if (!fetchAppointments || fetchAppointments.length === 0) {
                return res.status(HttpStatusCode.NOT_FOUND).json({
                    message: "No offline appointments found for the given user.",
                });
            }
            return res.status(HttpStatusCode.OK).json({
                message: "Fetched appointments successfully.",
                fetchAppointments,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error while fetching offline appointments.",
            });
        }
    }
    async appointmentListController(req, res) {
        try {
            const docId = req.query.id;
            if (!docId) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "Doctor ID is required" });
            }
            const appointmentList = await this.appointmentService.appointmentListService(docId);
            return res.status(HttpStatusCode.OK).json({
                status: "success",
                message: "Appointment lists fetched successfully",
                data: appointmentList,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                status: "error",
                message: "Error occurred in appointmentListController",
                error: error.message,
            });
        }
    }
    async fetchTodayAppointments(req, res) {
        try {
            const doctorId = req.query.id;
            if (!doctorId) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "Doctor ID is required" });
            }
            const todayTotalAppointments = await this.appointmentService.fetchTodayAppointments(doctorId);
            return res.status(HttpStatusCode.OK).json({ todayTotalAppointments });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal Server Error occurred" });
        }
    }
    async fetchDoctorAppointmentsForDashboard(req, res) {
        try {
            const doctorId = req.query.id;
            if (!doctorId) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "Doctor ID is missing" });
            }
            const appointmentDetails = await this.appointmentService.DoctorDashboard(doctorId);
            return res.status(HttpStatusCode.OK).json(appointmentDetails);
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal Server Error" });
        }
    }
    async getLatestAppointments(req, res) {
        try {
            const doctorId = req.query.id;
            const latestAppointments = await this.appointmentService.getLatestAppointments(doctorId);
            return res
                .status(HttpStatusCode.OK)
                .json({ message: "latest appintments are", latestAppointments });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal Server Error" });
        }
    }
    async getTotalAppointmentsAndPatients(req, res) {
        try {
            const doctorId = req.query.id;
            const time = req.query.time;
            if (!doctorId || !time) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "Doctor ID and time are required" });
            }
            const data = await this.appointmentService.getAppointmentsAndPatients(doctorId, time);
            return res.status(HttpStatusCode.OK).json({
                message: "Data fetched successfully",
                data,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: "Internal Server Error",
                error: error.message,
            });
        }
    }
    async fetchPatientsCategorizedCount(req, res) {
        try {
            const doctorId = req.query.id;
            const categorizedPatients = await this.appointmentService.patientCtegorizedCount(doctorId);
            return res
                .status(HttpStatusCode.OK)
                .json({ message: "data fetched succesfully", categorizedPatients });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal server error" });
        }
    }
    async markAsCompleted(req, res) {
        try {
            const appointmentId = req.query.id;
            if (!appointmentId) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "Appointment ID is required" });
            }
            const markedAsCompleted = await this.appointmentService.markedAsComplete(appointmentId);
            return res.status(HttpStatusCode.OK).json({
                message: "Appointment marked as completed",
                markedAsCompleted,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: "An error occurred while marking the appointment as completed",
                error: error.message,
            });
        }
    }
}
export default AppointmentController;
