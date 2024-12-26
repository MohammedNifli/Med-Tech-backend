import mongoose from "mongoose";
import { TimeSlot,ITimeSlot,ITimeSlotDetails } from "../models/slotModel.js"
import { ITimeRepo } from "../Interfaces/timeSlot/ITimeRepo.js";
import moment from 'moment';
import 'moment-timezone';



class timeSlotRepo implements ITimeRepo{
   

    public async batchInsertTimeSlots(doctorId: string, slots: ITimeSlotDetails[]): Promise<boolean> {
        try {
            await TimeSlot.updateOne(
                { doctor: doctorId },
                { $push: { slots: { $each: slots } } }, // Push all generated slots into the slots array
                { upsert: true } // Create a new document if it doesn't exist
            );
            return true;
        } catch (error) {
            console.error('Error inserting time slots:', error);
            throw new Error('Failed to insert time slots');
        }
    }
    
    

    public async fetchDoctorSlotsFromRepo(doctorId: string): Promise<any[]> {
      try {
        // Find all slots for the doctor with the specified consultation mode
        const doctorSlots = await TimeSlot.find(
          { doctor: new mongoose.Types.ObjectId(doctorId) }, // Match the doctor ID
          { slots: 1 } // Only include the slots field in the result
        );
    
        if (!doctorSlots || doctorSlots.length === 0) {
          return []; // No slots found
        }
    
        // Extract, filter, and map the available slots
        const availableSlots = doctorSlots.flatMap((doc) =>
          doc.slots
            .filter((slot) => slot.status === "available" || slot.status==='booked' && slot.consultationMode === "online")
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
            }))
        );
    
        return availableSlots;
      } catch (error: any) {
        console.error("Error fetching slots in repo:", error);
        throw error;
      }
    }



    public async fetchDoctorOfflineSlotsFromRepo(doctorId: string): Promise<any[]> {
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
    
                if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
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
    
    
    
      
      

       public  async checkSlotExistancyRepo(doctorId: string, startDate: Date, endDate: Date, timeSlots: string[]): Promise<ITimeSlot[]> {
        const timeRanges = timeSlots.map(time => {
            const [hours, minutes] = time.split(':');
            const start = new Date(startDate);
            start.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            const end = new Date(start);
            end.setHours(start.getHours() + 1);
            return { start, end };
        });

        return TimeSlot.find({
            doctor: doctorId,
            'slots.startDateTime': { 
                $gte: startDate,
                $lte: endDate
            },
            $or: timeRanges.map(range => ({
                'slots.startDateTime': { $gte: range.start, $lt: range.end }
            }))
        });

       }


       public async fetchDoctorAllSlots(doctorId: string, date: string): Promise<any> {
        try {
            const startOfDay = new Date(date);
            const endOfDay = new Date(new Date(date).setDate(startOfDay.getDate() + 1));

            // Find the TimeSlot document for the doctor and filter slots by date
            const timeSlotDoc = await TimeSlot.findOne({
                doctor: doctorId,
                'slots.startDateTime': {
                    $gte: startOfDay,
                    $lt: endOfDay
                }
            });

            return timeSlotDoc ? timeSlotDoc.slots : null;
        } catch (error) {
            console.error("Error in fetchDoctorAllSlots (Repository):", error);
            throw new Error("Database query failed");
        }
    }

    public async deleteTimeSloteRepo(docId: string, date: string, time: string): Promise<any> {
      try {
        // Convert provided date and time from IST to UTC
        const dateTimeIST = `${date} ${time}`;
        const dateTimeUTC = moment.tz(dateTimeIST, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata').utc().format();
        console.log("dateTimeIST",dateTimeUTC)
    
        // Find the document and remove the matching slot
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



// Repository
public async editTimeSlotRepo(slotData: any): Promise<any> {
  try {
    const { doctorId, oldDateAndTime, day, startDateTime, endDateTime } = slotData;
    console.log("Received Data:", { doctorId, oldDateAndTime, day, startDateTime, endDateTime });

    // Ensure dates are parsed correctly
    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
    const oldDate = new Date(oldDateAndTime);
    const newStartDate = new Date(startDateTime);
    const newEndDate = new Date(endDateTime);

    console.log("Parsed Dates:", { oldDate, newStartDate, newEndDate });

    // Find and update the slot
    const updatedSlot = await TimeSlot.findOneAndUpdate(
      {
        doctor: doctorObjectId,
        "slots.startDateTime": { $gte: oldDate.setMilliseconds(0), $lt: new Date(oldDate.getTime() + 1000) },
        "slots.day": day,
      },
      {
        $set: {
          "slots.$.startDateTime": newStartDate,
          "slots.$.endDateTime": newEndDate,
          "slots.$.day":day,
          "slots.$.status":"available"
        },
      },
      { new: true } // Return the updated document
    );

    // Log and return result
    if (!updatedSlot) {
      console.warn("No matching slot found.");
      return null;
    }

    console.log("Updated Slot:", updatedSlot);
    return updatedSlot;
  } catch (error) {
    console.error("Error in editTimeSlotRepo:", error);
    throw new Error("Error occurred in the editTimeSlotRepo");
  }
}




public async updateSlotStatus(
  doctorId: string,
  slotDate: string,
  time: string,
  status: 'available' | 'booked' | 'canceled' | 'not available'
): Promise<any> {
  try {
    // Combine the slotDate and time to create the exact Date object
   // Ensure this is in UTC format

    // console.log('Slot DateTime:', slotDateTime);

    const updatedSlot = await TimeSlot.findOneAndUpdate(
      {
        doctor: new mongoose.Types.ObjectId(doctorId),
        'slots.startDateTime': slotDate, // Compare with exact Date
      },
      {
        $set: { 'slots.$.status': status }, // Update the status
      },
      { new: true } // Return the updated document
    );

    console.log('Updated Slot:', updatedSlot);

    return updatedSlot;
  } catch (error: any) {
    throw new Error(`Error in updating slot status: ${error.message}`);
  }
}




}

export default timeSlotRepo;