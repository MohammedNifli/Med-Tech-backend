import AppointmentModel,{IAppointmentData} from "../../models/appointmentModel.js"
import mongoose,{ClientSession} from "mongoose";
import { IAppointment } from "../../types/appointment.types.js";
export interface IAppointmentRepo{
    createAppointment(appointmentData: IAppointmentData): Promise<any>
    updatePatientId(appointmentId: string, patientId: string): Promise<any> 
    findAppointment(doctorId: string, appointmentDate: Date, timeSlot: string): Promise<any | null>
    appointmentRetrievalWithPatient(appointmentId:string):Promise<any>;
    paymentStatusChange(appointmentId:string):Promise<any>;
    appointmentFetching(userId:string):Promise<any>
    cancelAppointment(appointmentId:string):Promise<IAppointment>;
    fetchingOnlineAppointmentRepo(userId: string): Promise<any>
    fetchingOfflineAppointments(userId:string):Promise<any>
    appointmentListRepo(doctorId:string):Promise<any>

    fetchTotalAppointmentsCount():Promise<any>


    fetchYearlyAppointmentData(): Promise<any>
    fetchMonthlyAppointmentData(): Promise<any> 
    fetchDailyAppointmentData(): Promise<any>


    fetchingspecialisationStats():Promise<any>
    fetchAvailableDoctors():Promise<any>
    getSpecialisationPercentageRepo(): Promise<any>
    getAppointmentForDashboard(): Promise<any>

    fetchAllAppointmentRepo():Promise<any>

    countAppointmentsForToday(doctorId:string):Promise<number| any>
    getTotalAppointmentsCount(doctorId:string):Promise<any>

    getTotalOfflineAppointmentsForDoctor(doctorId: string):Promise<number |any>
    getTotalOnlineAppointmentsForDoctor(doctorId: string):Promise<number | any>
    getLatestAppointmentRepo(doctorId:string):Promise<any>

    getTotalPatientCountFromAppointments(doctorId:string):Promise<any>
    getAppointmentsAndPatients(doctorId: string, time: string): Promise<any>
    patientsCount(doctorId:string):Promise<number|any>
    markAsCompleted(appointmentId:string):Promise<any>
}