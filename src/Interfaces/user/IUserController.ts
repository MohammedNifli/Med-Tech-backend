import { Request,Response } from "express";

export interface IUserController{
    register(req: Request, res: Response): Promise<void>
    Login(req: Request, res: Response):Promise<Response> 
    googleLogin(req: Request, res: Response):Promise<Response>
    logout(req: Request, res: Response): Promise<Response>;
    fetchingSpecialization(
        req: Request,
        res: Response
      ): Promise<Response>;

      filterDoctors(req: Request, res: Response): Promise<Response>;
      getProfile(req: Request, res: Response):Promise<Response>;
      updateUserProfile(req: Request, res: Response):Promise<Response>;
      fetchingDoctorProfile(req: Request, res: Response):Promise<Response>;
      userChangePassword(
        req: Request,
        res: Response
      ): Promise<Response>;
      s3PresignedUrlCreation(
        req: Request,
        res: Response
      ): Promise<Response>;
      fetchDoctorOnlineSlots(
        req: Request,
        res: Response
      ): Promise<Response>;

      fetchDoctorOfflineSlots(
        req: Request,
        res: Response
      ): Promise<Response>;
      premiumPaymentController(
        req: Request,
        res: Response
      ): Promise<any>;
      webHook(req: Request, res: Response): Promise<void>;
      changeUserPremiumSetup(
        req: Request,
        res: Response
      ): Promise<Response>;
      checkUserPremiumStatus(
        req: Request,
        res: Response
      ): Promise<Response |undefined>;
      fetchAllAvailableDoctors(
        req: Request,
        res: Response
      ): Promise<Response | undefined> ;
      searchDoctorsByCriteria(req: Request, res: Response): Promise<any>;
}