import { IAppointmentData } from "../../models/appointmentModel.js";
import { IAppointment, IPaymentStatus } from "../../types/appointment.types.js";

export interface IAppointmentService{
    createAppointment(appointmentData:  IAppointmentData): Promise<any> ;
    // findAppointmentBySlot(doctorId: string, appointmentDate: Date, timeSlot: string): Promise<any> ;
    updatePatientId(patientId: string, appointmentId: string): Promise<IAppointment>
    appointmentRetrieval(appointmentId:string):Promise<any>
    paymentSucceed(appointmentId:string):Promise<IPaymentStatus>;
    getAppointments(userId:string):Promise<any>;
    cancelAppointment(amount:number,userId:string,appointmentId: string): Promise<any>
    fetchOnlineAppointments(userId: string): Promise<IAppointment[]> 
    offlineConsultaions(userId:string):Promise<IAppointment[]>
    appointmentListService(doctorId:string):Promise<IAppointment[]>

    fetchTodayAppointments(doctorId:string):Promise<Number|any>
    DoctorDashboard(doctorId:string):Promise<any>
    getLatestAppointments(doctorId:string):Promise<any>
    getAppointmentsAndPatients(doctorId: string, time: string): Promise<any>
    patientCtegorizedCount(doctorId:string):Promise<any>
    markedAsComplete(appointmentId:string):Promise<any>
}