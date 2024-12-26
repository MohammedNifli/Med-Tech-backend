
export interface IPatientService{
    createPatientService(patientData: any): Promise<any>
    fetchingPatient(patientId:string):Promise<any>
}