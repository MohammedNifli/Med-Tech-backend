import { ObjectId } from "mongoose";


export interface IMessage{
     chatId: ObjectId; 
      sender: ObjectId; 
      content: string; 
      createdAt: Date; 
      updatedAt: Date;
      readBy?: ObjectId[];
      isDeleted?: boolean; 
}