

export interface IPatientRepo{
    createPatient(patientData: any): Promise<any>
    fetchingPatient(patientId:string):Promise<any>
    fetchTotalPatientCount():Promise<any>
    getMonthlyPatientDataForDash():Promise<any>
    getYearlyPatientDataForDash():Promise<any>
    getDailyPatientDataForDash():Promise<any>
    fetchingPatientsFordash():Promise<any>
    fetchAllPatientDetails():Promise<any>
}