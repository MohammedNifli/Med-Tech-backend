import { ITimeSlot,ITimeSlotDetails } from "../../models/slotModel.js";


export interface ITimeRepo{
    batchInsertTimeSlots(doctorId:string,slots: ITimeSlotDetails[]): Promise<boolean>
    fetchDoctorSlotsFromRepo(doctorId: string): Promise<any[]>
    checkSlotExistancyRepo(doctorId: string, startDate: Date, endDate: Date, timeSlots: string[]): Promise<ITimeSlot[]>
    fetchDoctorAllSlots(doctorId: string, date: string): Promise<any>
    deleteTimeSloteRepo(docId: string, date: string, time: string): Promise<any>
    editTimeSlotRepo(slotData: any): Promise<any>
    fetchDoctorOfflineSlotsFromRepo(doctorId: string): Promise<any[]>
    updateSlotStatus(
        doctorId: string,
        slotDate: string,
        time: string,
        status: 'available' | 'booked' | 'canceled' | 'not available'
      ): Promise<any>

}