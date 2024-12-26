import { time } from "console";
import { ITimeSlot, ITimeSlotDetails, TimeSlot } from "../models/slotModel.js";
import timeSlotRepo from "../repositories/timeSlotRepo.js";
import mongoose from "mongoose";
import { ITimeSlotService } from "../Interfaces/timeSlot/ITimeSlotService.js";
import { ITimeRepo } from "../Interfaces/timeSlot/ITimeRepo.js";
import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

interface TimeSlot {
  startDateTime: Date;
  endDateTime: Date;
  status: "available" | "booked" | "canceled";
}

interface GenerateSlotsInput {
  doctorId: string;
  startDate: Date;
  endDate: Date;
  timeSlots: string[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TimeSlotService implements ITimeSlotService {
  private timeSlotRepo: ITimeRepo;
  constructor(timeSlotRepo: ITimeRepo) {
    this.timeSlotRepo = timeSlotRepo;
  }
  public async generateAndAddSlots({
    doctorId,
    startDate,
    endDate,
    timeSlots,
    availableDays,
    consultationMode,
  }: {
    doctorId: string;
    startDate: Date;
    endDate: Date;
    timeSlots: string[];
    availableDays: string[];
    consultationMode: string;
  }): Promise<ITimeSlotDetails[]> {
    return new Promise((resolve, reject) => {
      const workerPath = "./dist/workers/slotWorker.js"; // Path to the worker script
  
      const worker = new Worker(workerPath, {
        workerData: { startDate, endDate, timeSlots, doctorId, availableDays, consultationMode }, // Pass consultaionMode to the worker
      });
  
      worker.on("message", async (slots: ITimeSlotDetails[]) => {
        try {
          await this.timeSlotRepo.batchInsertTimeSlots(doctorId, slots);
          resolve(slots); // Return the inserted slots
        } catch (error) {
          reject(error);
        }
      });
  
      worker.on("error", reject);
  
      worker.on("exit", (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }
  
  

  public async fetchDoctorSlotsService(doctorId: string): Promise<any[]> {
    try {
      if (!doctorId) {
        throw new Error("Doctor ID is not provided");
      }

      const fetchedSlots = await this.timeSlotRepo.fetchDoctorSlotsFromRepo(
        doctorId
      ); // Example function name
      return fetchedSlots;
    } catch (error) {
      console.error("Error in service while fetching doctor slots:", error);
      throw error; // Rethrow the error to be caught in the controller
    }
  }



  public async fetchDoctorOfflineSlotsService(doctorId: string): Promise<any[]> {
    try {
      if (!doctorId) {
        throw new Error("Doctor ID is not provided");
      }

      const fetchedSlots = await this.timeSlotRepo.fetchDoctorOfflineSlotsFromRepo(
        doctorId
      ); // Example function name
      return fetchedSlots;
    } catch (error) {
      console.error("Error in service while fetching doctor slots:", error);
      throw error; // Rethrow the error to be caught in the controller
    }
  }

  public async checkSlotExistancy(
    doctorId: string,
    startDate: Date,
    endDate: Date,
    timeSlots: string[]
  ): Promise<boolean> {
    try {
      if (!doctorId) {
        throw new Error("Please provide the doctor ID.");
      }
      if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
        throw new Error("Time slots array is empty or invalid.");
      }

      // Call the repository function to check slot existence
      const existingSlots = await this.timeSlotRepo.checkSlotExistancyRepo(
        doctorId,
        startDate,
        endDate,
        timeSlots
      );
      return existingSlots.length > 0; // Return true if slot exists, false otherwise
    } catch (error) {
      console.error("Error checking slot existence:", error);
      throw error; // Rethrow the error to handle it upstream
    }
  }

  public async fetchDoctorAllSlots(
    doctorId: string,
    date: string
): Promise<{ date: string; startTime: string; endTime: string; status: string }[]> {
    try {
        const slots: ITimeSlotDetails[] | null = await this.timeSlotRepo.fetchDoctorAllSlots(doctorId, date);

        if (!slots || slots.length === 0) {
            throw new Error(`No time slots found for doctorId: ${doctorId} on date: ${date}`);
        }

        // Convert each slot's date and time to IST in "hh:mm" format
        const slotsInIST = slots
            .filter((slot: ITimeSlotDetails) => {
                const slotDate = slot.startDateTime.toISOString().split("T")[0];
                return slotDate === date; // Match slots with the provided date only
            })
            .map((slot: ITimeSlotDetails) => {  // Use slot instead of slots[0]
                const startIST = new Date(slot.startDateTime).toLocaleTimeString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });

                const endIST = new Date(slot.endDateTime).toLocaleTimeString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });

                return {
                    date: new Date(slot.startDateTime).toLocaleDateString("en-IN", {
                        timeZone: "Asia/Kolkata",
                    }),
                    startTime: startIST,
                    endTime: endIST,
                    status: slot.status,
                };
            });

        return slotsInIST; // Return the formatted slots

    } catch (error) {
        console.error("Error in fetchDoctorAllSlots (Service):", error);
        throw new Error("Error fetching doctor's time slots");
    }
}

public async deleteTimeSlotService(docId: string, date: string, time: string): Promise<any> {
  try {
    // Call repository method to delete slot
    const deletedSlot = await this.timeSlotRepo.deleteTimeSloteRepo(docId, date, time);
    return deletedSlot;
  } catch (error) {
    console.error("Error deleting slot in service:", error);
    throw error;
  }
}

// Service
public async editTimeSlot(slotData: any): Promise<any> {
  try {
    // Pass the slot data to the repository for updating
    const updatedSlot = await this.timeSlotRepo.editTimeSlotRepo(slotData);

    return updatedSlot; // Return the updated slot data
  } catch (error) {
    console.log(error);
    throw new Error('Error occurred while updating the time slot');
  }
}


public async changeSlotStatus(
  doctorId: string,
  slotDate: string,
  time: string,
  status: 'available' | 'booked' | 'canceled' | 'not available'
): Promise<any> {
  try {
    const updatedSlot = await this.timeSlotRepo.updateSlotStatus(
      doctorId,
      slotDate,
      time,
      status
    );

    return updatedSlot;
  } catch (error:any) {
    throw new Error(`Error in changing slot status: ${error.message}`);
  }
}

}

export default TimeSlotService;
