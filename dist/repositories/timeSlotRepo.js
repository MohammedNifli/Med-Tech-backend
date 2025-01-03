import mongoose from "mongoose";
import { TimeSlot } from "../models/slotModel.js";
import moment from "moment";
import "moment-timezone";
class timeSlotRepo {
    async batchInsertTimeSlots(doctorId, slots) {
        try {
            await TimeSlot.updateOne({ doctor: doctorId }, { $push: { slots: { $each: slots } } }, { upsert: true });
            return true;
        }
        catch (error) {
            console.error("Error inserting time slots:", error);
            throw new Error("Failed to insert time slots");
        }
    }
    async fetchDoctorSlotsFromRepo(doctorId) {
        try {
            const doctorSlots = await TimeSlot.find({ doctor: new mongoose.Types.ObjectId(doctorId) }, { slots: 1 });
            if (!doctorSlots || doctorSlots.length === 0) {
                return [];
            }
            const availableSlots = doctorSlots.flatMap((doc) => doc.slots
                .filter((slot) => slot.status === "available" ||
                (slot.status === "booked" && slot.consultationMode === "online"))
                .map((slot) => ({
                date: new Date(slot.startDateTime).toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                }),
                startTime: new Date(slot.startDateTime).toLocaleTimeString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }),
                status: slot.status,
            })));
            return availableSlots;
        }
        catch (error) {
            console.error("Error fetching slots in repo:", error);
            throw error;
        }
    }
    async fetchDoctorOfflineSlotsFromRepo(doctorId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(doctorId)) {
                throw new Error("Invalid Doctor ID");
            }
            const doctorSlots = await TimeSlot.find({ doctor: new mongoose.Types.ObjectId(doctorId) }, { slots: 1 });
            if (!doctorSlots || doctorSlots.length === 0) {
                return [];
            }
            const availableSlots = doctorSlots.flatMap((doc) => doc.slots
                .filter((slot) => (slot.status === "available" || slot.status === "booked") &&
                slot.consultationMode === "offline")
                .map((slot) => {
                try {
                    const startDateTime = new Date(slot.startDateTime);
                    const endDateTime = new Date(slot.endDateTime);
                    if (isNaN(startDateTime.getTime()) ||
                        isNaN(endDateTime.getTime())) {
                        console.warn("Invalid date in slot:", slot);
                        return null;
                    }
                    return {
                        date: startDateTime.toLocaleDateString("en-IN", {
                            timeZone: "Asia/Kolkata",
                        }),
                        startTime: startDateTime.toLocaleTimeString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                        }),
                        status: slot.status,
                    };
                }
                catch (error) {
                    console.error("Error processing slot:", error);
                    return null;
                }
            })
                .filter((slot) => slot !== null));
            return availableSlots;
        }
        catch (error) {
            console.error("Error fetching slots in repo:", error);
            throw error;
        }
    }
    async checkSlotExistancyRepo(doctorId, startDate, endDate, timeSlots) {
        const timeRanges = timeSlots.map((time) => {
            const [hours, minutes] = time.split(":");
            const start = new Date(startDate);
            start.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            const end = new Date(start);
            end.setHours(start.getHours() + 1);
            return { start, end };
        });
        return TimeSlot.find({
            doctor: doctorId,
            "slots.startDateTime": {
                $gte: startDate,
                $lte: endDate,
            },
            $or: timeRanges.map((range) => ({
                "slots.startDateTime": { $gte: range.start, $lt: range.end },
            })),
        });
    }
    async fetchDoctorAllSlots(doctorId, date) {
        try {
            const startOfDay = new Date(date);
            const endOfDay = new Date(new Date(date).setDate(startOfDay.getDate() + 1));
            const timeSlotDoc = await TimeSlot.findOne({
                doctor: doctorId,
                "slots.startDateTime": {
                    $gte: startOfDay,
                    $lt: endOfDay,
                },
            });
            if (!timeSlotDoc ||
                !timeSlotDoc.slots ||
                timeSlotDoc.slots.length === 0) {
                return null;
            }
            return timeSlotDoc;
        }
        catch (error) {
            console.error("Error in fetchDoctorAllSlots (Repository):", error);
            throw new Error("Database query failed");
        }
    }
    async deleteTimeSloteRepo(docId, date, time) {
        try {
            const dateTimeIST = `${date} ${time}`;
            const dateTimeUTC = moment
                .tz(dateTimeIST, "YYYY-MM-DD HH:mm", "Asia/Kolkata")
                .utc()
                .format();
            const result = await TimeSlot.updateOne({ doctor: new mongoose.Types.ObjectId(docId) }, { $pull: { slots: { startDateTime: dateTimeUTC } } });
            return result;
        }
        catch (error) {
            console.error("Error deleting slot in repo:", error);
            throw error;
        }
    }
    async editTimeSlotRepo(slotData) {
        try {
            const { doctorId, oldDateAndTime, day, startDateTime, endDateTime } = slotData;
            const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
            const oldDate = new Date(oldDateAndTime);
            const newStartDate = new Date(startDateTime);
            const newEndDate = new Date(endDateTime);
            const updatedSlot = await TimeSlot.findOneAndUpdate({
                doctor: doctorObjectId,
                "slots.startDateTime": {
                    $gte: oldDate.setMilliseconds(0),
                    $lt: new Date(oldDate.getTime() + 1000),
                },
                "slots.day": day,
            }, {
                $set: {
                    "slots.$.startDateTime": newStartDate,
                    "slots.$.endDateTime": newEndDate,
                    "slots.$.day": day,
                    "slots.$.status": "available",
                },
            }, { new: true });
            if (!updatedSlot)
                return null;
            return updatedSlot;
        }
        catch (error) {
            throw new Error("Error occurred in the editTimeSlotRepo");
        }
    }
    async updateSlotStatus(doctorId, slotDate, time, status) {
        try {
            const updatedSlot = await TimeSlot.findOneAndUpdate({
                doctor: new mongoose.Types.ObjectId(doctorId),
                "slots.startDateTime": slotDate,
            }, {
                $set: { "slots.$.status": status },
            }, { new: true });
            if (!updatedSlot)
                throw new Error("No slot found to update");
            return updatedSlot;
        }
        catch (error) {
            throw new Error(`Error in updating slot status: ${error.message}`);
        }
    }
}
export default timeSlotRepo;
