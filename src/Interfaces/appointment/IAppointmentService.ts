import { IAppointmentData } from "../../models/appointmentModel.js";

export interface IAppointmentService{
    createAppointment(appointmentData:  IAppointmentData): Promise<any> ;
    // findAppointmentBySlot(doctorId: string, appointmentDate: Date, timeSlot: string): Promise<any> ;
    updatePatientId(patientId: string, appointmentId: string): Promise<any>
    appointmentRetrievalService(appointmentId:string):Promise<any>
    paymentSucceed(appointmentId:string):Promise<boolean>;
    appointmentFetchingService(userId:string):Promise<any>;
    cancelAppointmentService(amount:number,userId:string,appointmentId: string): Promise<any>
    fetchOnlineAppointmentService(userId: string): Promise<any> 
    offlineConsultaions(userId:string):Promise<any>
    appointmentListService(doctorId:string):Promise<any>

    fetchTodayAppointmentsService(doctorId:string):Promise<Number|any>
    DoctorDashboardService(doctorId:string):Promise<any>
    getLatestAppointmentService(doctorId:string):Promise<any>
    getAppointmentsAndPatients(doctorId: string, time: string): Promise<any>
    patientCtegorizedCount(doctorId:string):Promise<any>
    markedAsCompletedService(appointmentId:string):Promise<any>
}