import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import moment from "moment-timezone";
class TimeSlotController {
    timeSlotService;
    static createTimeSlot;
    constructor(timeSlotService) {
        this.timeSlotService = timeSlotService;
    }
    async addTimeSlots(req, res) {
        const { doctorId, startDate, endDate, timeSlots, availableDays, consultationMode, } = req.body;
        try {
            if (!doctorId ||
                !startDate ||
                !endDate ||
                !Array.isArray(timeSlots) ||
                timeSlots.length === 0 ||
                !Array.isArray(availableDays)) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "Missing or invalid required fields" });
            }
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "Invalid date format" });
            }
            const existingSlots = await this.timeSlotService.checkSlotExistancy(doctorId, start, end, timeSlots);
            if (existingSlots) {
                return res
                    .status(HttpStatusCode.CONFLICT)
                    .json({ message: "Some of the requested time slots already exist" });
            }
            if (existingSlots) {
                return res
                    .status(HttpStatusCode.CONFLICT)
                    .json({ message: "Time slots already exist for the doctor" });
            }
            const addedSlots = await this.timeSlotService.generateAndAddSlots({
                doctorId,
                startDate: start,
                endDate: end,
                timeSlots,
                availableDays,
                consultationMode,
            });
            return res
                .status(HttpStatusCode.CREATED)
                .json({ message: "Slots added successfully", slots: addedSlots });
        }
        catch (error) {
            console.error("Error adding time slots:", error);
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Error adding time slots", error: error.message });
        }
    }
    async fetchSlots(req, res) {
        try {
            const doctorId = req.query.id;
            if (!doctorId)
                return res
                    .status(HttpStatusCode.NOT_FOUND)
                    .json({ message: "doctor id is not found" });
            const fetchedSlots = await this.timeSlotService.fetchDoctorSlots(doctorId);
            return res
                .status(HttpStatusCode.OK)
                .json({ message: "slots fetched succesfully", fetchedSlots });
        }
        catch (error) {
            console.error("Erorr fetching time slots", error);
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({
                message: "Error happens in fetching tim slots",
                error: error.message,
            });
        }
    }
    async fetchDoctorAllSlots(req, res) {
        const doctorId = req.query.id;
        const date = req.query.date;
        try {
            if (!doctorId || !date) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({
                    message: "Doctor ID and date are required.",
                });
            }
            const slots = await this.timeSlotService.fetchDoctorAllSlots(doctorId, date);
            res.status(HttpStatusCode.OK).json({
                message: "Slots fetched successfully",
                slots,
            });
        }
        catch (error) {
            console.error("Error in fetchDoctorAllSlots (Controller):", error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: "Error fetching slots",
            });
        }
        finally {
            return res;
        }
    }
    async deleteTimeSlot(req, res) {
        try {
            const { docId, date, time } = req.body;
            if (!docId || !date || !time) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "Missing required fields" });
            }
            const deleted = await this.timeSlotService.deleteTimeSlot(docId, date, time);
            if (deleted.modifiedCount > 0) {
                return res
                    .status(HttpStatusCode.OK)
                    .json({ message: "Slot deleted successfully" });
            }
            else {
                return res
                    .status(HttpStatusCode.NOT_FOUND)
                    .json({ message: "Slot not found or already deleted" });
            }
        }
        catch (error) {
            console.error("Error deleting slot:", error);
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Error deleting slot", error: error.message });
        }
    }
    async editTimeSlot(req, res) {
        try {
            const { sendSlot } = req.body;
            const { doctorId, oldDateAndTime, day, startDateTime, endDateTime } = sendSlot;
            if (!doctorId ||
                !oldDateAndTime ||
                !day ||
                !startDateTime ||
                !endDateTime) {
                return res
                    .status(HttpStatusCode.FORBIDDEN)
                    .json({ message: "Data is missing" });
            }
            const parsedStartDateTime = new Date(oldDateAndTime);
            const parsedEndDateTime = new Date(endDateTime);
            if (isNaN(parsedStartDateTime.getTime()) ||
                isNaN(parsedEndDateTime.getTime())) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "Invalid date format" });
            }
            const slotData = {
                doctorId,
                oldDateAndTime,
                day,
                startDateTime,
                endDateTime,
            };
            const updatedSlot = await this.timeSlotService.editTimeSlot(slotData);
            if (!updatedSlot) {
                return res
                    .status(HttpStatusCode.NOT_FOUND)
                    .json({ message: "Slot not found" });
            }
            return res
                .status(HttpStatusCode.OK)
                .json({ message: "Slot updated successfully", data: updatedSlot });
        }
        catch (error) {
            console.log(error);
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal server error occurred" });
        }
    }
    async changeSlotStatus(req, res) {
        const { docId, appointmentDate, time } = req.body;
        if (!docId || !appointmentDate || !time) {
            return res
                .status(HttpStatusCode.BAD_REQUEST)
                .json({ message: "Required fields are missing in the request." });
        }
        const convertedDate = moment
            .utc(appointmentDate)
            .subtract(5, "hours")
            .subtract(30, "minutes")
            .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
        try {
            const updatedSlot = await this.timeSlotService.changeSlotStatus(docId, convertedDate, time, "booked");
            if (!updatedSlot) {
                return res
                    .status(HttpStatusCode.NOT_FOUND)
                    .json({ message: "Time slot not found or cannot be updated." });
            }
            return res.status(HttpStatusCode.OK).json({
                message: "Time slot status updated successfully.",
                data: updatedSlot,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error.",
                error: error.message,
            });
        }
    }
}
export default TimeSlotController;
