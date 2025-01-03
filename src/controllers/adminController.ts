import { Request, Response } from "express";
import { IAdminService } from "../Interfaces/admin/IAdminService.js";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import { IUser } from "../types/user.types.js";
import { IAdminController } from "../Interfaces/admin/IAdminController.js";

class AdminController implements IAdminController {
  private adminService: IAdminService;

  constructor(adminService: IAdminService) {
    this.adminService = adminService;
  }

  public async register(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password, phoneNumber } = req.body;
      console.log(name, email, password, phoneNumber);

      if (!name || !email || !password || !phoneNumber) {
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ message: "All fields are required" });
      }

      const adminRegister = await this.adminService.adminRegister({
        name,
        email,
        password,
        phoneNumber,
      });

      return res.status(HttpStatusCode.CREATED).json({
        message: "Admin registered successfully",
        data: adminRegister,
      });
    } catch (error) {
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "An error occurred during registration" });
    }
  }

  public async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Email and password are required" });
      }

      const adminLogin = await this.adminService.adminLogin(email, password);
      console.log("Log details from admin service:", adminLogin);

      if (!adminLogin) {
        return res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ message: "Invalid email or password" });
      }

      const { _id, name, role, isVerified, accesToken, refreshToken } =
        adminLogin;

      res.cookie("accessToken", accesToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      return res.status(HttpStatusCode.OK).json({
        message: "Login successful",
        data: { _id, name, email, role, isVerified, accesToken, refreshToken },
      });
    } catch (error) {
      console.error("Error in admin login:", error);
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "An error occurred during login" });
    }
  }

  public async fetchingUsersDetails(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const fetchingAllUsers = await this.adminService.fetchTotalUsers();
      return res.status(HttpStatusCode.OK).json({
        message: "All users details fetched succesfully ",
        fetchingAllUsers,
      });
    } catch (error) {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  public async fetchingAllDoctors(req: Request, res: Response) :Promise<Response>{
    try {
      const fetchingAllDoctors = await this.adminService.fetchTotalDoctors();
      return res
        .status(HttpStatusCode.OK)
        .json({ message: "fetched all doctors details", fetchingAllDoctors });
    } catch (error) {
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error occuring in fetching doctors" });
    }
  }

  public async blockUserController(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const userId: string = req.params.id;

      const updatedUser = await this.adminService.blockUser(userId);
      console.log("Updated user:", updatedUser);

      return res
        .status(200)
        .json({ message: "Updated the user access in med-tech", updatedUser });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Server error occurred while changing user's status",
      });
    }
  }

  public async unBlockUser(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.id as string;

      const unBlockedUser = await this.adminService.unBlockUserService(userId);
      return unBlockedUser;
    } catch (error) {
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error occurred while unblocking user" });
    }
  }

  public async Logout(req: Request, res: Response):Promise<Response> {
    try {
      const accessToken = req.cookies.accesToken;
      const refreshToken = req.cookies.refreshToken;

      res.cookie("accessToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",

        expires: new Date(0),
      });

      res.cookie("refreshToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",

        expires: new Date(0),
      });

    return  res
        .status(HttpStatusCode.OK)
        .json({ message: "admin logged out successfully " });
    } catch (error) {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
    }
  }

  public async ApprovingDoctorProfile(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const docId = req.query.id as string;

      if (!docId) {
        return res
          .status(HttpStatusCode.FORBIDDEN)
          .json({ message: "doctor is not found" });
      }
      const approvedProfile = await this.adminService.approvingDoctor(docId);
      return res
        .status(HttpStatusCode.OK)
        .json({ message: "success", approvedProfile });
    } catch (error) {
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ "An error occured in the  ApprovingDoctorProfile": null });
    }
  }

  public async rejectingDoctorProfile(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const docId = req.query.id as string;
      if (!docId) {
        return res
          .status(HttpStatusCode.FORBIDDEN)
          .json({ message: "doctor is not found" });
      }
      const rejectedProfile = await this.adminService.rejectDoctorApproval(
        docId
      );
      return res
        .status(HttpStatusCode.OK)
        .json({ message: "success", rejectedProfile });
    } catch (error) {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  public async blockDoctor(req: Request, res: Response): Promise<Response> {
    try {
      const docId = req.params.id as string;

      if (!docId) {
        return res
          .status(400)
          .json({ success: false, message: "Doctor ID is required" });
      }

      const result = await this.adminService.blockDoctor(docId);

      return res
        .status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST)
        .json(result);
    } catch (error) {
      console.error("Error in blockDoctor controller:", error);
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal server error" });
    }
  }
  public async unBlockDoctor(req: Request, res: Response): Promise<Response> {
    try {
      const doctorId = req.params.id as string;

      if (!doctorId) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ success: false, message: "Doctor ID is required" });
      }

      const unblockDoctor = await this.adminService.unBlockDoctor(doctorId);

      if (unblockDoctor.success) {
        return res
          .status(HttpStatusCode.OK)
          .json({ success: true, message: "Doctor unblocked successfully" });
      } else {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ success: false, message: unblockDoctor.message });
      }
    } catch (error) {
      console.error("Error in unBlockDoctor controller:", error);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "An error occurred while unblocking the doctor",
      });
    }
  }

  public async userSearchData(req: Request, res: Response): Promise<Response> {
    const data = req.query.data as string;
    try {
      const fetchedData = await this.adminService.fetchUserSearchData(data);

      if (fetchedData) {
        return res.status(HttpStatusCode.OK).json(fetchedData);
      } else {
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ message: "No users found" });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "An error occurred while fetching users." });
    }
  }

  public async doctorsSearchData(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.query.data as string;

      const fetchedDoctorData = await this.adminService.fetchDoctorData(data);

      if (fetchedDoctorData.length > 0) {
        return res.status(HttpStatusCode.OK).json(fetchedDoctorData);
      } else {
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ message: "No doctors found" });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "An error occurred while fetching doctors." });
    }
  }

  public async filteringDoctors(req: Request, res: Response):Promise<Response> {
    try {
      const { filter } = req.query as { filter: string };

      const filteredDoctors = await this.adminService.adminDocFilter(filter);

      return res.status(HttpStatusCode.OK).json({ doctors: filteredDoctors });
    } catch (error) {
      console.log("Error in filteringDoctors:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  public async getDashboardStats(req: Request, res: Response): Promise<Response> {
    try {
      const dashboardStats = await this.adminService.getDashboardStatService();

      return res.status(HttpStatusCode.OK).json({
        message: "dashboardStats feched succefully completed",
        dashboardStats,
      });
    } catch (error) {
      
     return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error " });
    }
  }

  public async fetchAppointmentGraphData(
    req: Request,
    res: Response
  ): Promise<Response>{
    try {
      const period = (req.query.period || "").toString().toLowerCase();

      let appointmentData;
      if (period === "yearly") {
        appointmentData = await this.adminService.fetchYearlyAppointmentData();
      } else if (period === "monthly") {
        appointmentData = await this.adminService.fetchMonthlyData();
      } else if (period === "daily") {
        appointmentData = await this.adminService.fetchdailyData();
      } else {
        return res.status(400).json({ message: "Invalid period specified" });
      }

      const specialisationData = await this.adminService.specializationData();

     return res.status(HttpStatusCode.OK).json({
        message: "Appointment data fetched successfully",
        appointmentData,
      });
    } catch (error) {
     
    return  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message:
          "An Internal server error occurred in fetchAppointmentGraphData controller",
      });
    }
  }

  public async getDoctorDashStats(req: Request, res: Response): Promise<Response> {
    try {
    
      const countofDoctors = await this.adminService.getDoctorDashStatService();
      return res
        .status(HttpStatusCode.OK)
        .json({ message: "doctors count fetched succesfully", countofDoctors });
    } catch (error) {
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server error" });
    }
  }

  public async fetchingTopRatedDoctors(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const topRatedDoctors = await this.adminService.fetchTopRatedDoctors();
      return res.status(HttpStatusCode.OK).json({
        message: "Top-rated doctors fetched successfully",
        topRatedDoctors,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  }

  public async fetchAvailableDoctors(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const availableDoctors =
        await this.adminService.fetchAvailableDoctorsService();
      return res.status(HttpStatusCode.OK).json({
        message: "available doctors fetched succefully",
        availableDoctors,
      });
    } catch (error) {
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
      console.log(error);
    }
  }

  public async getAppointmentPercentageBySpecialization(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const specailizationPerfcentage =
        await this.adminService.getSpecailizationPercentageService();

    return   res
        .status(HttpStatusCode.OK)
        .json({
          message: "specailisation percenatge fetched succesfully completed",
          specailizationPerfcentage,
        });
    } catch (error) {
     return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  }

  public async fetchApppointmentsForDashboard(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const appointments = await this.adminService.fetchAppointmentsForDash();

      return res
        .status(HttpStatusCode.OK)
        .json({ message: "appointments fetched", appointments });
    } catch (error) {
     return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "internal server error" });
      console.log(error);
    }
  }

  public async fetchPatientDetailsForDashboard(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const period = req.query.period as string;

      const data = await this.adminService.fetchPateintDataForDash(period);
      return res
        .status(HttpStatusCode.OK)
        .json({ message: "data fetching succesfully completed", data });
    } catch (error) {
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  }

  public async getNewPatients(req: Request, res: Response): Promise<Response> {
    try {
      const newPatients = await this.adminService.getNewPatientsService();
      return res
        .status(HttpStatusCode.OK)
        .json({
          message: "new patients data fetched succesfully",
          newPatients,
        });
    } catch (error) {
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  }

  public async fetchAllAppointments(req: Request, res: Response): Promise<Response> {
    try {
      const fetchedAllAppointments =
        await this.adminService.fetchAllAppointmentsService();
      return res
        .status(HttpStatusCode.OK)
        .json({
          message: "appointments fetched succesfully completed",
          fetchedAllAppointments,
        });
    } catch (error) {
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  }

  public async fetchAllPatients(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const fetchAllPatients = await this.adminService.fetchAllPtients();
      return res
        .status(HttpStatusCode.OK)
        .json({ message: "message fetched successfully", fetchAllPatients });
    } catch (error) {
      
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "internal server error" });
    }
  }
}

export default AdminController;
