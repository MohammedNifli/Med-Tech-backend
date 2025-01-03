import { Request, Response } from "express";
export interface IDoctorController {
  doctorRegister(req: Request, res: Response): Promise<Response>;
  doctorLogin(req: Request, res: Response): Promise<Response>;
  doctorLogout(req: Request, res: Response): Promise<Response>;
  getProfile(req: Request, res: Response): Promise<Response>;
  editProfile(req: Request, res: Response): Promise<Response>;
  applyForApproval(req: Request, res: Response): Promise<Response>;
  fetchDoctorStatus(req: Request, res: Response): Promise<Response>;
  changePassword(req: Request, res: Response): Promise<Response>;
  doctorProfilePictureFixing(req: Request, res: Response): Promise<Response>;
  s3PresignedUrlGeneration(req: Request, res: Response): Promise<Response>;

  s3PresignedUrlCreation(req: Request, res: Response): Promise<Response>;
}
