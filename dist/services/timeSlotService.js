import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
class TimeSlotService {
    timeSlotRepo;
    constructor(timeSlotRepo) {
        this.timeSlotRepo = timeSlotRepo;
    }
    async generateAndAddSlots({ doctorId, startDate, endDate, timeSlots, availableDays, consultationMode, }) {
        return new Promise((resolve, reject) => {
            const isProduction = process.env.NODE_ENV === 'production';
            const workerPath = isProduction
                ? path.resolve(__dirname, '..', 'workers', 'slotWorker.js')
                : path.resolve(__dirname, 'workers', 'slotWorker.js');
            const worker = new Worker(workerPath, {
                workerData: { startDate, endDate, timeSlots, doctorId, availableDays, consultationMode },
            });
            worker.on('message', async (slots) => {
                try {
                    await this.timeSlotRepo.batchInsertTimeSlots(doctorId, slots);
                    resolve(slots);
                }
                catch (error) {
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
    async fetchDoctorSlots(doctorId) {
        try {
            if (!doctorId)
                throw new Error("Doctor ID is not provided");
            const fetchedSlots = await this.timeSlotRepo.fetchDoctorSlotsFromRepo(doctorId);
            return fetchedSlots;
        }
        catch (error) {
            console.error("Error in service while fetching doctor slots:", error);
            throw error;
        }
    }
    async fetchDoctorOfflineSlots(doctorId) {
        try {
            if (!doctorId) {
                throw new Error("Doctor ID is not provided");
            }
            const fetchedSlots = await this.timeSlotRepo.fetchDoctorOfflineSlotsFromRepo(doctorId);
            return fetchedSlots;
        }
        catch (error) {
            console.error("Error in service while fetching doctor slots:", error);
            throw error;
        }
    }
    async checkSlotExistancy(doctorId, startDate, endDate, timeSlots) {
        try {
            // Normalize time slots to 24-hour format
            const normalizedTimeSlots = timeSlots.map((slot) => {
                const match = slot.match(/(\d{1,2}):(\d{2})(?:\s*([APap][Mm]))?/);
                if (!match) {
                    throw new Error(`Invalid time format: ${slot}. Expected format: HH:mm.`);
                }
                let [_, hours, minutes, period] = match;
                let normalizedHours = parseInt(hours, 10);
                if (period) {
                    period = period.toUpperCase();
                    if (period === "PM" && normalizedHours < 12) {
                        normalizedHours += 12;
                    }
                    else if (period === "AM" && normalizedHours === 12) {
                        normalizedHours = 0;
                    }
                }
                return `${String(normalizedHours).padStart(2, "0")}:${minutes}`;
            });
            console.log("Normalized Time Slots:", normalizedTimeSlots);
            // Check slot existence in the repository
            const existingSlots = await this.timeSlotRepo.checkSlotExistancyRepo(doctorId, startDate, endDate, normalizedTimeSlots);
            return existingSlots.length > 0;
        }
        catch (error) {
            console.error("Error checking slot existence:", error.message);
            throw new Error("Failed to check slot existence.");
        }
    }
    async fetchDoctorAllSlots(doctorId, date) {
        try {
            const slots = await this.timeSlotRepo.fetchDoctorAllSlots(doctorId, date);
            if (!slots || slots.length === 0) {
                throw new Error(`No time slots found for doctorId: ${doctorId} on date: ${date}`);
            }
            const slotsInIST = slots
                .filter((slot) => {
                const slotDate = slot.startDateTime.toISOString().split("T")[0];
                return slotDate === date;
            })
                .map((slot) => {
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
        }
        catch (error) {
            console.error("Error in fetchDoctorAllSlots (Service):", error);
            throw new Error("Error fetching doctor's time slots");
        }
    }
    async deleteTimeSlot(docId, date, time) {
        try {
            if (!docId || !date || !time)
                throw new Error("Missing required parameters: docId, date, or time.");
            const deletedSlot = await this.timeSlotRepo.deleteTimeSloteRepo(docId, date, time);
            if (!deletedSlot) {
                throw new Error("Time slot not found or cannot be deleted.");
            }
            return deletedSlot;
        }
        catch (error) {
            console.error("Error deleting slot in service:", error);
            throw error;
        }
    }
    async editTimeSlot(slotData) {
        try {
            if (!slotData)
                throw new Error("Slot data is required.");
            const updatedSlot = await this.timeSlotRepo.editTimeSlotRepo(slotData);
            if (!updatedSlot) {
                throw new Error("Failed to update the time slot.");
            }
            return updatedSlot;
        }
        catch (error) {
            console.log(error);
            throw new Error('Error occurred while updating the time slot');
        }
    }
    async changeSlotStatus(doctorId, slotDate, time, status) {
        try {
            if (!doctorId || !slotDate || !time || !status) {
                throw new Error("All parameters (doctorId, slotDate, time, status) are required.");
            }
            const updatedSlot = await this.timeSlotRepo.updateSlotStatus(doctorId, slotDate, time, status);
            if (!updatedSlot) {
                throw new Error("Failed to update the slot status.");
            }
            return updatedSlot;
        }
        catch (error) {
            console.error("Error in changeSlotStatus:", error);
            throw new Error(`Error in changing slot status: ${error.message}`);
        }
    }
}
export default TimeSlotService;
