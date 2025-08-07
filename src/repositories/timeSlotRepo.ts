import mongoose from "mongoose";
import { TimeSlot, ITimeSlot, ITimeSlotDetails } from "../models/slotModel.js";
import { ITimeRepo } from "../Interfaces/timeSlot/ITimeRepo.js";
import moment from "moment";
import "moment-timezone";
import { time } from "node:console";

class timeSlotRepo implements ITimeRepo {
  public async batchInsertTimeSlots(
    doctorId: string,
    slots: ITimeSlotDetails[]
  ): Promise<boolean> {
    try {
      await TimeSlot.updateOne(
        { doctor: doctorId },
        { $push: { slots: { $each: slots } } },
        { upsert: true }
      );
      return true;
    } catch (error) {
      console.error("Error inserting time slots:", error);
      throw new Error("Failed to insert time slots");
    }
  }

  public async fetchDoctorSlotsFromRepo(doctorId: string): Promise<any[]> {
    try {
      const doctorSlots = await TimeSlot.find(
        { doctor: new mongoose.Types.ObjectId(doctorId) },
        { slots: 1 }
      );

      if (!doctorSlots || doctorSlots.length === 0) {
        return [];
      }

      const availableSlots = doctorSlots.flatMap((doc) =>
        doc.slots
          .filter(
            (slot) =>
              slot.status === "available" ||
              (slot.status === "booked" && slot.consultationMode === "online")
          )
          .map((slot) => ({
            date: new Date(slot.startDateTime).toLocaleDateString("en-IN", {
              timeZone: "Asia/Kolkata",
            }),
            startTime: new Date(slot.startDateTime).toLocaleTimeString(
              "en-IN",
              {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }
            ),
            status: slot.status,
          }))
      );

      return availableSlots;
    } catch (error: any) {
      console.error("Error fetching slots in repo:", error);
      throw error;
    }
  }

  public async fetchDoctorOfflineSlotsFromRepo(
    doctorId: string
  ): Promise<any[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        throw new Error("Invalid Doctor ID");
      }

      const doctorSlots = await TimeSlot.find(
        { doctor: new mongoose.Types.ObjectId(doctorId) },
        { slots: 1 }
      );

      if (!doctorSlots || doctorSlots.length === 0) {
        return [];
      }

      const availableSlots = doctorSlots.flatMap((doc) =>
        doc.slots
          .filter(
            (slot) =>
              (slot.status === "available" || slot.status === "booked") &&
              slot.consultationMode === "offline"
          )
          .map((slot) => {
            try {
              const startDateTime = new Date(slot.startDateTime);
              const endDateTime = new Date(slot.endDateTime);

              if (
                isNaN(startDateTime.getTime()) ||
                isNaN(endDateTime.getTime())
              ) {
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
            } catch (error) {
              console.error("Error processing slot:", error);
              return null;
            }
          })
          .filter((slot) => slot !== null)
      );

      return availableSlots;
    } catch (error) {
      console.error("Error fetching slots in repo:", error);
      throw error;
    }
  }

  public async checkSlotExistancyRepo(
    doctorId: string,
    startDate: Date,
    endDate: Date,
    timeSlots: string[]
  ): Promise<any[]> {
    try {
      // Convert each time slot into UTC time ranges
      const timeRanges = timeSlots.map((time) => {
        const [hours, minutes] = time.split(":").map(Number);
        
        // Generate start and end times in UTC
        const localStart = new Date(startDate);
        localStart.setHours(hours, minutes, 0, 0);
        const utcStart = new Date(localStart.getTime() - localStart.getTimezoneOffset() * 60000);
        
        const utcEnd = new Date(utcStart);
        utcEnd.setMinutes(utcEnd.getMinutes() + 30); // Assuming 30-minute slots
        
        return { 
          hours,
          minutes,
          utcStart,
          utcEnd
        };
      });

      // Query MongoDB for exactly matching time slots
      const existingSlots = await TimeSlot.find({
        doctor: doctorId,
        slots: {
          $elemMatch: {
            startDateTime: {
              $in: timeRanges.map(range => {
                const date = new Date(startDate);
                date.setHours(range.hours, range.minutes, 0, 0);
                return date;
              })
            }
          }
        }
      }).exec();

      return existingSlots;
    } catch (error: any) {
      console.error("Error querying existing slots:", error.message);
      throw new Error("Database query for slot existence failed.");
    }
  }
  
  

  public async fetchDoctorAllSlots(
    doctorId: string,
    date: string
  ): Promise<ITimeSlot | null> {
    try {
      const startOfDay = new Date(date);
      const endOfDay = new Date(
        new Date(date).setDate(startOfDay.getDate() + 1)
      );

      const timeSlotDoc = await TimeSlot.findOne({
        doctor: doctorId,
        "slots.startDateTime": {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      });

      if (
        !timeSlotDoc ||
        !timeSlotDoc.slots ||
        timeSlotDoc.slots.length === 0
      ) {
        return null;
      }

      return timeSlotDoc;
    } catch (error) {
      console.error("Error in fetchDoctorAllSlots (Repository):", error);
      throw new Error("Database query failed");
    }
  }

  public async deleteTimeSloteRepo(
    docId: string,
    date: string,
    time: string
  ): Promise<any> {
    try {
      const dateTimeIST = `${date} ${time}`;
      const dateTimeUTC = moment
        .tz(dateTimeIST, "YYYY-MM-DD HH:mm", "Asia/Kolkata")
        .utc()
        .format();

      const result = await TimeSlot.updateOne(
        { doctor: new mongoose.Types.ObjectId(docId) },
        { $pull: { slots: { startDateTime: dateTimeUTC } } }
      );

      return result;
    } catch (error) {
      console.error("Error deleting slot in repo:", error);
      throw error;
    }
  }

  public async editTimeSlotRepo(slotData: any): Promise<ITimeSlot | null> {
    try {
      const { doctorId, oldDateAndTime, day, startDateTime, endDateTime } =
        slotData;

      const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
      const oldDate = new Date(oldDateAndTime);
      const newStartDate = new Date(startDateTime);
      const newEndDate = new Date(endDateTime);

      const updatedSlot = await TimeSlot.findOneAndUpdate(
        {
          doctor: doctorObjectId,
          "slots.startDateTime": {
            $gte: oldDate.setMilliseconds(0),
            $lt: new Date(oldDate.getTime() + 1000),
          },
          "slots.day": day,
        },
        {
          $set: {
            "slots.$.startDateTime": newStartDate,
            "slots.$.endDateTime": newEndDate,
            "slots.$.day": day,
            "slots.$.status": "available",
          },
        },
        { new: true }
      );

      if (!updatedSlot) return null;

      return updatedSlot;
    } catch (error) {
      throw new Error("Error occurred in the editTimeSlotRepo");
    }
  }

  public async updateSlotStatus(
    doctorId: string,
    slotDate: string,
    time: string,
    status: "available" | "booked" | "canceled" | "not available"
  ): Promise<ITimeSlot | null> {
    try {
      const updatedSlot = await TimeSlot.findOneAndUpdate(
        {
          doctor: new mongoose.Types.ObjectId(doctorId),
          "slots.startDateTime": slotDate,
        },
        {
          $set: { "slots.$.status": status },
        },
        { new: true }
      );

      if (!updatedSlot) throw new Error("No slot found to update");

      return updatedSlot;
    } catch (error: any) {
      throw new Error(`Error in updating slot status: ${error.message}`);
    }
  }
}

export default timeSlotRepo;
