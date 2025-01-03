import {Request,Response} from 'express';


export interface IAppointmentController{
    createAppointment(
        req: Request,
        res: Response
      ): Promise<Response> ;
      stripePaymentController(
        req: Request,
        res: Response
      ): Promise<void>;
      webHook(req: Request, res: Response): Promise<void>;
      updatePatientId(req: Request, res: Response): Promise<Response>
      getAppointment(req: Request, res: Response): Promise<Response> ;
      fetchAppointments(
        req: Request,
        res: Response
      ): Promise<Response>;
      cancelAppointment(
        req: Request,
        res: Response
      ): Promise<Response>;
      resheduleAppointment(
        req: Request,
        res: Response
      ): Promise<Response>;
      fetchingOnlineAppointments(
        req: Request,
        res: Response
      ): Promise<Response> ;
      fetchingOfflineAppointments(
        req: Request,
        res: Response
      ): Promise<Response>;
      appointmentListController(
        req: Request,
        res: Response
      ): Promise<Response>;
      fetchTodayAppointments(
        req: Request,
        res: Response
      ): Promise<number | any>;

      fetchDoctorAppointmentsForDashboard(
        req: Request,
        res: Response
      ): Promise<Response>;

      getLatestAppointments(
        req: Request,
        res: Response
      ): Promise<Response>;

      getTotalAppointmentsAndPatients(
        req: Request,
        res: Response
      ): Promise<Response>;

      fetchPatientsCategorizedCount(
        req: Request,
        res: Response
      ): Promise<Response> ;

      markAsCompleted(req: Request, res: Response): Promise<Response>
}