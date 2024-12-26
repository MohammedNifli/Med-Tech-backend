import { IChatRepo } from "../Interfaces/chatInterface/IChatRepo.js";
import Chat from "../models/chatModel.js";
import mongoose from "mongoose";
import Doctor from '../models/doctorModel.js'
import User from '../models/userModel.js'
class ChatRepo implements IChatRepo {
  public async checkExistingChat(participants: string[]) {
    try {
      const existingChat = await Chat.findOne({
        participants: { $all: participants, $size: participants.length },
      });

      return existingChat;
    } catch (error) {
      console.log(error);
      throw Error("error occurin in the ");
    }
  }

  public async createChat(participants: string[]): Promise<any> {
    try {
      const newChat = await Chat.create({
        participants,
        lastMessage: '673af56bf5a5e60fddb47b25',
      });

      return newChat;
    } catch (error) {
      console.log(error);
      throw Error("Error occuring in the creat chat repository");
    }
  }

  public async fetchChatRepository(userId: string): Promise<any> {
    try {
      // Validate userId as a MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }
  
      // Check if userId exists in the Doctor model
      const isDoctor = await Doctor.exists({ _id: userId });
      console.log("User is Doctor:", isDoctor);
  
      // Define model and fields to populate based on whether the user is a Doctor or not
      const modelToPopulate = isDoctor ? "User" : "Doctor"; // Dynamic model selection based on user type
      const fieldsToSelect =
        modelToPopulate === "Doctor"
          ? "personalInfo.name personalInfo.email"
          : "name email";
  
      // Fetch chats where the user is a participant
      const fetchedChats = await Chat.find({
        participants: { $in: [userId] }, // Fetch chats where userId is one of the participants
      });
  
      // Handle no chats found scenario
      if (!fetchedChats || fetchedChats.length === 0) {
        console.log(`No chats found for userId: ${userId}`);
        return []; // Return an empty array
      }
  
      // Populate participants and lastMessage for each chat
      await Promise.all(
        fetchedChats.map(async (chat) => {
          console.log("Chat:", chat); // Log the raw chat object
  
          // Populate participants - Exclude the current user
          const participantModel = isDoctor ? "User" : "Doctor"; // Dynamically choose the model
          await chat.populate({
            path: "participants",
            match: { _id: { $ne: userId } }, // Exclude the current user
            select: fieldsToSelect,
            model: participantModel,
          });
  
          // Check the populated participants
          console.log("Populated Participants:", chat.participants);
  
          // Optionally, populate the lastMessage if it exists
          if (chat.lastMessage) {
            await chat.populate("lastMessage");
            console.log("Populated Last Message:", chat.lastMessage);
          }
  
          return chat;
        })
      );
  
      console.log("Fetched Chats:", fetchedChats);
      return fetchedChats;
    } catch (error) {
      console.error(`Error in fetchChatRepository for userId ${userId}:`, error);
      throw new Error("Error occurred in fetchChatRepository");
    }
  }


  public async fetchChatByIdRepo(chatId:string):Promise<any>{
    try{
      const fetchedChatById=await Chat.findById({_id:chatId});
      return fetchedChatById;

    }catch(error){
      console.log(error)
      throw Error('error happening in the fetchChatByIdRepo')
    }
  }
  
  public async lastMessageUpdateRepo(chatId: string, senderId: string): Promise<any> {
    try {
      const updatedChat = await Chat.findByIdAndUpdate(
        { _id: chatId },
        { lastMessage: senderId },
        { new: true }
      ).lean(); // Use `.lean()` for better performance if needed
      return updatedChat;
    } catch (error) {
      console.error('Error in lastMessageUpdateRepo:', error);
      throw new Error('Error occurred while updating the last message in the database.');
    }
  }
  
  
}

export default ChatRepo;
