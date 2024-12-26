import timeSlotService from "../../services/timeSlotService.js";
import { ITimeSlotDetails } from "../../models/slotModel.js";
interface TimeSlot {
    startDateTime: Date;
    endDateTime: Date;
    status: 'available' | 'booked' | 'canceled';
}

interface GenerateSlotsInput {
    doctorId: string;
    startDate: Date;
    endDate: Date;
    timeSlots: string[];
}
export interface ITimeSlotService{
  generateAndAddSlots({
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
  }): Promise<ITimeSlotDetails[]>

      fetchDoctorSlotsService(doctorId: string): Promise<any[]>
      checkSlotExistancy(doctorId: string, startDate: Date, endDate: Date, timeSlots: string[]): Promise<boolean>
      fetchDoctorAllSlots(doctorId: string, date: string): Promise<any>
      deleteTimeSlotService(docId: string, date: string, time: string): Promise<any>
      editTimeSlot(slotData: any): Promise<any>
      fetchDoctorOfflineSlotsService(doctorId: string): Promise<any[]>
      changeSlotStatus(
        doctorId: string,
        slotDate: string,
        time: string,
        status: 'available' | 'booked' | 'canceled' | 'not available'
      ): Promise<any>
}
