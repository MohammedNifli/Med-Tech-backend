import { ObjectId } from "mongoose";

export interface IAppointment{
    userId: ObjectId;
        doctorId: ObjectId;
        patientId?: ObjectId;
        appointmentDate: any;
        status?: string;
        timeSlot: string;
        consultationMode: 'online' | 'offline';
        paymentStatus?: string;
        amount:number;
        videoCall:string;
}


export interface IPaymentStatus {
    status: boolean;
    message?: string;
  }