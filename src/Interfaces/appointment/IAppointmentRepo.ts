import AppointmentModel,{IAppointmentData} from "../../models/appointmentModel.js"
import mongoose,{ClientSession} from "mongoose";
export interface IAppointmentRepo{
    createAppointment(appointmentData: IAppointmentData): Promise<any>
    updatePatientId(appointmentId: string, patientId: string): Promise<any> 
    findAppointment(doctorId: string, appointmentDate: Date, timeSlot: string): Promise<any | null>
    appointmentRetrievalWithPatient(appointmentId:string):Promise<any>;
    paymentStatusChange(appointmentId:string):Promise<any>;
    appointmentFetching(userId:string):Promise<any>
    cancelAppointmentRepo(appointmentId:string):Promise<any>;
    fetchingOnlineAppointmentRepo(userId: string): Promise<any>
    fetchingOfflineAppointments(userId:string):Promise<any>
    appointmentListRepo(doctorId:string):Promise<any>

    fetchTotalAppointmentsCount():Promise<any>
    // fetchAppointmentDataForFraph():Promise<any>

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
    patientsCount(doctorId:string):Promise<any>
    markAsCompleted(appointmentId:string):Promise<any>
}