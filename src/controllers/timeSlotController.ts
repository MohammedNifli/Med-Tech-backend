import { Request, Response } from "express";
import timeSlotService from "../services/timeSlotService.js";
import { ITimeSlotService } from "../Interfaces/timeSlot/ITimeSlotService.js";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import moment from 'moment-timezone';
class TimeSlotController {
  private timeSlotService: ITimeSlotService;
  static createTimeSlot: any;
  constructor(timeSlotService: ITimeSlotService) {
    this.timeSlotService = timeSlotService;
  }

  public async addTimeSlots(req: Request, res: Response): Promise<Response> {
    const { doctorId, startDate, endDate, timeSlots,availableDays,consultationMode } = req.body;
    console.log("req.body from doctor add slot", req.body);

    try {
        // Check for required fields and validate input
        if (!doctorId || !startDate || !endDate || !Array.isArray(timeSlots) || timeSlots.length === 0 || !Array.isArray(availableDays)) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Missing or invalid required fields" });
        }

        // Ensure startDate and endDate are valid Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Invalid date format" });
        }

        // Check if the time slots already exist
        const existingSlots = await this.timeSlotService.checkSlotExistancy(doctorId, start, end, timeSlots);
        if (existingSlots) {
            return res
                .status(HttpStatusCode.CONFLICT)
                .json({ message: "Some of the requested time slots already exist" });
        }

        if (existingSlots) {
            return res.status(HttpStatusCode.CONFLICT).json({ message: "Time slots already exist for the doctor" });
        }

        // Call the service to generate and add slots
        const addedSlots = await this.timeSlotService.generateAndAddSlots({
            doctorId,
            startDate: start,
            endDate: end,
            timeSlots,
            availableDays,
            consultationMode
        });


        console.log("Added slots:", addedSlots);

        return res.status(HttpStatusCode.CREATED).json({ message: "Slots added successfully", slots: addedSlots });
    } catch (error: any) {
        console.error("Error adding time slots:", error);
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Error adding time slots", error: error.message });
    }
}

public async fetchSlots(req:Request,res:Response):Promise<any>{
    try{
        const doctorId=req.query.id as string;
        console.log("doctorID in fethcing slots ",doctorId)
        if(!doctorId){
            
            res.status(HttpStatusCode.NOT_FOUND).json({message:"doctor id is not found"})
        }
        const fetchedSlots=await this.timeSlotService.fetchDoctorSlotsService(doctorId);
       

        return res.status(HttpStatusCode.OK).json({message:"slots fetched succesfully",fetchedSlots})
    }catch(error:any){
        console.error("Erorr fetching time slots",error);
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"Error happens in fetching tim slots",error:error.message})
    }
}



public async fetchDoctorAllSlots(req: Request, res: Response): Promise<any> {
    const doctorId = req.query.id as string;
    const date = req.query.date as string;

    try {
        if (!doctorId || !date) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                message: "Doctor ID and date are required."
            });
        }

        const slots = await this.timeSlotService.fetchDoctorAllSlots(doctorId, date);
        console.log('fetchedTimeSlots',slots)
        res.status(HttpStatusCode.OK).json({
            message: "Slots fetched successfully",
            slots
        });
    } catch (error) {
        console.error("Error in fetchDoctorAllSlots (Controller):", error);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching slots"
        });
    }
}





public async deleteTimeSlot(req: Request, res: Response): Promise<any> {
    try {
        console.log("time slot delete controller")
      const { docId, date, time } = req.body;
        console.log(date,time,docId)
      if (!docId || !date || !time) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      const deleted = await this.timeSlotService.deleteTimeSlotService(docId, date, time);
      console.log('deleted',deleted)
  
      if (deleted.modifiedCount > 0) {
        return res.status(200).json({ message: "Slot deleted successfully" });
      } else {
        return res.status(404).json({ message: "Slot not found or already deleted" });
      }
    } catch (error:any) {
      console.error("Error deleting slot:", error);
      return res.status(500).json({ message: "Error deleting slot", error: error.message });
    }
  }
  


 // Controller
 public async editTimeSlot(req: Request, res: Response): Promise<any> {
    try {
      const { sendSlot } = req.body;
      console.log("sendSlot", sendSlot);
  
      const { doctorId, oldDateAndTime, day, startDateTime, endDateTime } = sendSlot;
      console.log("kitto", doctorId, oldDateAndTime);
  
      // Validate inputs
      if (!doctorId || !oldDateAndTime || !day || !startDateTime || !endDateTime) {
        return res.status(HttpStatusCode.FORBIDDEN).json({ message: 'Data is missing' });
      }
  
      // Validate the date values
      const parsedStartDateTime = new Date(oldDateAndTime);
      const parsedEndDateTime = new Date(endDateTime);
      console.log("prsedT",parsedEndDateTime,parsedStartDateTime)
  
      if (isNaN(parsedStartDateTime.getTime()) || isNaN(parsedEndDateTime.getTime())) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Invalid date format' });
      }
  
      // Prepare the slot data to send to the service
      const slotData = {
        doctorId,
        oldDateAndTime,
        day,
        startDateTime, 
        endDateTime,
      };
  
      // Call the service layer to update the time slot
      const updatedSlot = await this.timeSlotService.editTimeSlot(slotData);
      console.log("updated", updatedSlot);
  
      if (!updatedSlot) {
        return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Slot not found' });
      }
  
      // Respond with the updated slot
      return res.status(HttpStatusCode.OK).json({ message: 'Slot updated successfully', data: updatedSlot });
    } catch (error) {
      console.log(error);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error occurred' });
    }
  }

  public async changeSlotStatus(req: Request, res: Response): Promise<any> {
    try {
      const { docId, appointmentDate, time } = req.body;
  
      console.log('req.body', req.body);
  
      // Validate required fields
      if (!docId || !appointmentDate || !time) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: 'Required fields are missing in the request.' });
      }
  
      // Convert UTC to the required format
      const convertedDate = moment.utc(appointmentDate) // Interpret as UTC
        .subtract(5,'hours')
        .subtract(30,'minutes') // Apply IST offset
        .format("YYYY-MM-DDTHH:mm:ss.SSSZ"); // Output as ISO string with offset
  
      console.log('Converted Date in IST Format:', convertedDate);
  
      const updatedSlot = await this.timeSlotService.changeSlotStatus(
        docId,
        convertedDate,
        time,
        'booked'
      );
  
      // Check if slot status is successfully updated
      if (!updatedSlot) {
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ message: 'Time slot not found or cannot be updated.' });
      }
  
      res
        .status(HttpStatusCode.OK)
        .json({
          message: 'Time slot status updated successfully.',
          data: updatedSlot,
        });
    } catch (error: any) {
      console.error('Error:', error.message);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error.',
          error: error.message,
        });
    }
  }
  
  
  
  

}

export default TimeSlotController;
