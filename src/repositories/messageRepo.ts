import { IMessageRepo } from "../Interfaces/message/IMessageRepo.js";
import Message from "../models/messageModel.js";
import { IMessage } from "../types/message.types.js";

class MessageRepo implements IMessageRepo {
  public async createMessageRepo(
    chatId: string,
    sender: string,
    content: string
  ): Promise<IMessage> {
    try {
      const newSavedMessage = await Message.create({ chatId, sender, content });
      return newSavedMessage;
    } catch (error) {
      console.error("Error in createMessageRepo:", error);
      throw new Error(
        "Error occurred while creating the message in the repository"
      );
    }
  }

  public async fetchLatestMessage(messageId: string): Promise<IMessage> {
    try {
      const latestMessage = await Message.find({ _id: messageId })
        .sort({ createdAt: -1 })
        .limit(1);
      if (!latestMessage || latestMessage.length === 0) {
        throw new Error("No messages found");
      }
      return latestMessage[0];
    } catch (error) {
      console.log(error);
      throw Error("error is hitting the messge fetching reposritory");
    }
  }

  public async loadMessagesRepo(chatId: string): Promise<IMessage[]> {
    try {
      const loadedMessages = await Message.find({ chatId });

      if (!loadedMessages || loadedMessages.length === 0) {
        throw new Error("No messages found for the given chat ID.");
      }

      return loadedMessages as IMessage[];
    } catch (error: any) {
      console.error("Error in loadMessagesRepo:", error.message);
      throw new Error("An error occurred while loading messages.");
    }
  }
}

export default MessageRepo;
