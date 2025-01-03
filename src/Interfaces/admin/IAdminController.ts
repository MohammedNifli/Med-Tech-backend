import { Request,Response } from "express";



export   interface IAdminController {
  register(req: Request, res: Response): Promise<Response>;
  login(req: Request, res: Response): Promise<Response>;

  unBlockUser(req: Request, res: Response): Promise<Response>;
  blockUserController(req: Request, res: Response): Promise<Response>;
  rejectingDoctorProfile(req: Request, res: Response): Promise<Response>;
  ApprovingDoctorProfile(req: Request, res: Response): Promise<Response>;
  fetchingUsersDetails(req: Request, res: Response): Promise<Response>;
  fetchingAllDoctors(req: Request, res: Response): Promise<Response>;
  Logout(req: Request, res: Response): Promise<Response>;
  blockDoctor(req: Request, res: Response): Promise<Response>;
  unBlockDoctor(req: Request, res: Response): Promise<Response>;
  userSearchData(req: Request, res: Response): Promise<any>;
  doctorsSearchData(req: Request, res: Response): Promise<Response>;
  filteringDoctors(req: Request, res: Response): Promise<Response>;
  getDashboardStats(req: Request, res: Response): Promise<Response>;
  fetchAppointmentGraphData(req: Request, res: Response): Promise<Response>;
  getDoctorDashStats(req: Request, res: Response): Promise<Response>;
  fetchingTopRatedDoctors(req: Request, res: Response): Promise<Response>;
  fetchAvailableDoctors(req: Request, res: Response): Promise<Response>;

  getAppointmentPercentageBySpecialization(
    req: Request,
    res: Response
  ): Promise<Response>;
  fetchApppointmentsForDashboard(
    req: Request,
    res: Response
  ): Promise<Response> ;
  fetchPatientDetailsForDashboard(
    req: Request,
    res: Response
  ): Promise<Response>;
  getNewPatients(req: Request, res: Response): Promise<Response> ;
  fetchAllAppointments(req: Request, res: Response): Promise<Response>
  fetchAllPatients(
    req: Request,
    res: Response
  ): Promise<Response>;
}
