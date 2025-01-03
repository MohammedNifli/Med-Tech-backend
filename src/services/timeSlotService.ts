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
      
      const isProduction = process.env.NODE_ENV === 'production';  
      const workerPath = isProduction
        ? path.resolve(__dirname, '..', 'workers', 'slotWorker.js')  
        : path.resolve(__dirname, 'workers', 'slotWorker.js');  
  
      
      const worker = new Worker(workerPath, {
        workerData: { startDate, endDate, timeSlots, doctorId, availableDays, consultationMode },
      });
  
      worker.on('message', async (slots: ITimeSlotDetails[]) => {
        try {
          await this.timeSlotRepo.batchInsertTimeSlots(doctorId, slots);
          resolve(slots);
        } catch (error) {
          reject(error);
        }
      });
  
      worker.on('error', reject);
  
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }
  

  public async fetchDoctorSlots(doctorId: string): Promise<ITimeSlot[]> {
    try {
      if (!doctorId)  throw new Error("Doctor ID is not provided");
      

      const fetchedSlots = await this.timeSlotRepo.fetchDoctorSlotsFromRepo(
        doctorId
      ); 
      return fetchedSlots;
    } catch (error) {
      console.error("Error in service while fetching doctor slots:", error);
      throw error; 
    }
  }



  public async fetchDoctorOfflineSlots(doctorId: string): Promise<ITimeSlot[]> {
    try {
      if (!doctorId) {
        throw new Error("Doctor ID is not provided");
      }

      const fetchedSlots = await this.timeSlotRepo.fetchDoctorOfflineSlotsFromRepo(
        doctorId
      ); 
      return fetchedSlots;
    } catch (error) {
      console.error("Error in service while fetching doctor slots:", error);
      throw error; 
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

    
      const existingSlots = await this.timeSlotRepo.checkSlotExistancyRepo(
        doctorId,
        startDate,
        endDate,
        timeSlots
      );
      return existingSlots.length > 0; 
    } catch (error) {
      console.error("Error checking slot existence:", error);
      throw error; 
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

        
        const slotsInIST = slots
            .filter((slot: ITimeSlotDetails) => {
                const slotDate = slot.startDateTime.toISOString().split("T")[0];
                return slotDate === date; 
            })
            .map((slot: ITimeSlotDetails) => {  
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

        return slotsInIST; 

    } catch (error) {
        console.error("Error in fetchDoctorAllSlots (Service):", error);
        throw new Error("Error fetching doctor's time slots");
    }
}
public async deleteTimeSlot(docId: string, date: string, time: string): Promise<ITimeSlot> {
  try {
    if (!docId || !date || !time) throw new Error("Missing required parameters: docId, date, or time.");
    

    const deletedSlot = await this.timeSlotRepo.deleteTimeSloteRepo(docId, date, time);

    if (!deletedSlot) {
      throw new Error("Time slot not found or cannot be deleted.");
    }

    return deletedSlot;
  } catch (error) {
    console.error("Error deleting slot in service:", error);
    throw error;
  }
}



public async editTimeSlot(slotData: any): Promise<ITimeSlot> {
  try {
    if (!slotData) throw new Error("Slot data is required.");
    
    const updatedSlot = await this.timeSlotRepo.editTimeSlotRepo(slotData);

    if (!updatedSlot) {
      throw new Error("Failed to update the time slot.");
    }

    return updatedSlot;
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
): Promise<ITimeSlot> {
  try {
    if (!doctorId || !slotDate || !time || !status) {
      throw new Error("All parameters (doctorId, slotDate, time, status) are required.");
    }

    const updatedSlot = await this.timeSlotRepo.updateSlotStatus(
      doctorId,
      slotDate,
      time,
      status
    );

    if (!updatedSlot) {
      throw new Error("Failed to update the slot status.");
    }

    return updatedSlot;
  } catch (error: any) {
    console.error("Error in changeSlotStatus:", error);
    throw new Error(`Error in changing slot status: ${error.message}`);
  }
}


}

export default TimeSlotService;
