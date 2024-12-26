import { Request, Response } from "express";
import { IAdminService } from "../Interfaces/admin/IAdminService.js";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import { IDoctorService } from "../Interfaces/doctor/IDoctorService.js";

class AdminController {
  private adminService: IAdminService;
  // private doctorService:IDoctorService

  constructor(adminService: IAdminService) {
    this.adminService = adminService;
    // this.doctorService=doctorService
  }

  // Admin registration
  public async register(req: Request, res: Response) {
    try {
      const { name, email, password, phoneNumber } = req.body;
      console.log(name, email, password, phoneNumber);

      // Validate required fields
      if (!name || !email || !password || !phoneNumber) {
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ message: "All fields are required" });
      }

      // Call service to handle registration logic
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
      console.error("Error in admin registration:", error);
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "An error occurred during registration" });
    }
  }

  // Admin login
  public async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      console.log("Email:", email, "Password:", password);

      // Validate input
      if (!email || !password) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Email and password are required" });
      }

      // Call service to handle login logic
      const adminLogin = await this.adminService.adminLogin(email, password);
      console.log("Log details from admin service:", adminLogin);

      if (!adminLogin) {
        return res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ message: "Invalid email or password" });
      }

      const { _id, name, role, isVerified, accesToken, refreshToken } =
        adminLogin;

      // Set accessToken cookie
      res.cookie("accessToken", accesToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure only in production
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      });

      // Set refreshToken cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure only in production
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refreshToken
        path: "/",
      });

      // Do not log req.cookies here, as cookies aren't yet available on the request in the same cycle

      // Return success response with necessary data
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

  public async fetchingUsersDetails(req: Request, res: Response) {
    try {
      const fetchingAllUsers = await this.adminService.fetchTotalUsers();
      return res.status(200).json({
        message: "All users details fetched succesfully ",
        fetchingAllUsers,
      });
    } catch (error) {
      console.log(error);
    }
  }

  public async fetchingAllDoctors(req: Request, res: Response) {
    try {
      const fetchingAllDoctors = await this.adminService.fetchTotalDoctors();
      return res
        .status(200)
        .json({ message: "fetched all doctors details", fetchingAllDoctors });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: "Server error occuring in fetching doctors" });
    }
  }

  public async blockUserController(req: Request, res: Response) {
    try {
      console.log("Hello world");

      const userId: string = req.params.id; // Better to type it as string instead of any
      console.log("userId", userId);

      const updatedUser = await this.adminService.blockUser(userId);
      console.log("Updated user:", updatedUser);

      return res
        .status(200)
        .json({ message: "Updated the user access in med-tech", updatedUser });
    } catch (error) {
      console.log(error); // Log before returning the error response
      return res.status(500).json({
        message: "Server error occurred while changing user's status",
      });
    }
  }

  public async unBlockUser(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.params.id as string;
      console.log("userId", userId);
      const unBlockedUser = await this.adminService.unBlockUserService(userId);
      return unBlockedUser;
    } catch (error) {
      console.log(error);
    }
  }

  public async Logout(req: Request, res: Response) {
    try {
      const accessToken = req.cookies.accesToken;
      const refreshToken = req.cookies.refreshToken;

      res.cookie("accessToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Ensure cookies are sent over HTTPS in production

        expires: new Date(0), // Expire the cookie
      });

      res.cookie("refreshToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Ensure cookies are sent over HTTPS in production

        expires: new Date(0), // Expire the cookie
      });

      res
        .status(HttpStatusCode.OK)
        .json({ message: "admin logged out successfully " });
    } catch (error) {}
  }

  public async ApprovingDoctorProfile(req: Request, res: Response) {
    try {
      console.log("hooo lalalaa");
      const docId = req.query.id as string;
      console.log(docId);
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
      console.log(error);
    }
  }

  public async rejectingDoctorProfile(req: Request, res: Response) {
    try {
      const docId = req.query.id as string;
      if (!docId) {
        return res
          .status(HttpStatusCode.FORBIDDEN)
          .json({ message: "doctor is not found" });
      }
      const rejectedProfile = await this.adminService.rejectingDoctorService(
        docId
      );
      return res
        .status(HttpStatusCode.OK)
        .json({ message: "success", rejectedProfile });
    } catch (error) {
      console.log(error);
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

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Error in blockDoctor controller:", error);
      return res
        .status(500)
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
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          message: "An error occurred while unblocking the doctor",
        });
    }
  }

  public async userSearchData(req: Request, res: Response): Promise<any> {
    const data = req.query.data as string; // Ensure you're accessing the query parameter
    try {
      console.log("hello user search data");
      const fetchedData = await this.adminService.fetchUserSearchData(data);
      console.log("data fetched", fetchedData);

      if (fetchedData) {
        return res.status(200).json(fetchedData); // Return the fetched data
      } else {
        return res.status(404).json({ message: "No users found" });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "An error occurred while fetching users." });
    }
  }

  public async doctorsSearchData(req: Request, res: Response): Promise<any> {
    try {
      const data = req.query.data as string; // Access query parameter

      console.log("hello doctor search data");
      const fetchedDoctorData = await this.adminService.fetchDoctorData(data);
      console.log("data fetched", fetchedDoctorData);

      if (fetchedDoctorData.length > 0) {
        return res.status(200).json(fetchedDoctorData); // Send fetched data if found
      } else {
        return res.status(404).json({ message: "No doctors found" });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "An error occurred while fetching doctors." });
    }
  }

  public async filteringDoctors(req: Request, res: Response) {
    try {
      const { filter } = req.query as { filter: string }; // Get the filter from the query
      console.log("admin doctor filter:", filter);

      // Call the adminDocFilter method to get filtered doctors
      const filteredDoctors = await this.adminService.adminDocFilter(filter);

      // Return the filtered doctors as a response
      return res.status(200).json({ doctors: filteredDoctors });
    } catch (error) {
      console.log("Error in filteringDoctors:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  public async getDashboardStats(req: Request, res: Response): Promise<any> {
    try {
      const dashboardStats = await this.adminService.getDashboardStatService();
      console.log("dashboardStats", dashboardStats);
      return res
        .status(HttpStatusCode.OK)
        .json({
          message: "dashboardStats feched succefully completed",
          dashboardStats,
        });
    } catch (error) {
      console.log(error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error " });
    }
  }

  public async fetchAppointmentGraphData(
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const period = (req.query.period || "").toString().toLowerCase(); // Normalize period to lowercase
      console.log("period", period);

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
      console.log("specialisationdata", specialisationData);

      res.status(HttpStatusCode.OK).json({
        message: "Appointment data fetched successfully",
        appointmentData,
      });
    } catch (error) {
      console.error("Error in fetchAppointmentGraphData:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message:
          "Internal server error occurred in fetchAppointmentGraphData controller",
      });
    }
  }

  public async getDoctorDashStats(req: Request, res: Response): Promise<any> {
    try {
      console.log("hellooo");
      const countofDoctors = await this.adminService.getDoctorDashStatService();
      return res
        .status(HttpStatusCode.OK)
        .json({ message: "doctors count fetched succesfully", countofDoctors });
    } catch (error) {
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server error" });
    }
  }

  public async fetchingTopRatedDoctors(
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const topRatedDoctors = await this.adminService.fetchTopRatedDoctors();
      return res
        .status(HttpStatusCode.OK)
        .json({
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
  ): Promise<any> {
    try {
      const availableDoctors =
        await this.adminService.fetchAvailableDoctorsService();
      return res
        .status(HttpStatusCode.OK)
        .json({
          message: "available doctors fetched succefully",
          availableDoctors,
        });
    } catch (error) {
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
      console.log(error);
    }
  }

//analyzing which specailisation got highest number of  appointments
  public async getAppointmentPercentageBySpecialization(req:Request,res:Response):Promise<any>{
    try{

      const specailizationPerfcentage=await this.adminService.getSpecailizationPercentageService();
      console.log("specailisation percentage",specailizationPerfcentage);
      res.status(HttpStatusCode.OK).json({message:"specailisation percenatge fetched succesfully completed",specailizationPerfcentage})

    }catch(error){
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"Internal Server Error"})
    }
}


public async  fetchApppointmentsForDashboard(req:Request,res:Response):Promise<any>{
  try{

    const appointments=await this.adminService.fetchAppointmentsForDash()

    return res.status(HttpStatusCode.OK).json({message:'appointments fetched',appointments})


  }catch(error){
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:'internal server error'})
    console.log(error)
  }
}

public async fetchPatientDetailsForDashboard(req:Request,res:Response):Promise<any>{
  try{

    const period=req.query.period as string;

    const data =await this.adminService.fetchPateintDataForDash(period)
    return res.status(HttpStatusCode.OK).json({message:"data fetching succesfully completed",data})


  }catch(error){
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"Internal server error"})

  }
}


public async getNewPatients(req:Request,res:Response):Promise<any>{
  try{
    const newPatients=await this.adminService.getNewPatientsService();
    return res.status(HttpStatusCode.OK).json({message:"new patients data fetched succesfully",newPatients});


  }catch(error){
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:'Internal server error'})
    
  }
}

public async fetchAllAppointments(req:Request,res:Response):Promise<any>{
  try{

    const fetchedAllAppointments=await this.adminService.fetchAllAppointmentsService();
    res.status(HttpStatusCode.OK).json({message :"appointments fetched succesfully completed",fetchedAllAppointments})


  }catch(error){
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"Internal server error"})
  }
}

public async fetchAllPatients(req:Request,res:Response):Promise<any>{
  try{
    const fetchAllPatients=await this.adminService.fetchAllPtients()
    return res.status(HttpStatusCode.OK).json({message:"message fetched succesfully",fetchAllPatients})

  }catch(error){
    console.log(error)
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"internal server error"})

  }
}





}

export default AdminController;
