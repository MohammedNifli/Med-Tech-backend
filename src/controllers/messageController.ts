import { HttpStatusCode } from "../enums/httpStatusCodes.js";
import { IMessageService } from "../Interfaces/message/IMessageService.js";
import { Request, Response } from "express";
import { IMessageController } from "../Interfaces/message/IMessageController.js";

class MessageController implements IMessageController {
  private messageService: IMessageService;

  constructor(messageService: IMessageService) {
    this.messageService = messageService;
  }

  public async createMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { chatId, sender, content } = req.body;

      if (!chatId || !sender || !content) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "chatId, sender, and content are required" });
      }

      const newSavedMessage = await this.messageService.createMessageService(
        chatId,
        sender,
        content
      );

      return res
        .status(HttpStatusCode.CREATED)
        .json({
          message: "Message created successfully",
          data: newSavedMessage,
        });
    } catch (error: any) {
      console.error("Error in createMessage:", error);
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error", error: error.message });
    }
  }

  public async fetchLatestMessage(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const messageId = req.query.chatId as string;
      if (!messageId) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "messageId is missing" });
      }
      const lastMessage = await this.messageService.fetchLatestMessageService(
        messageId
      );
      return res
        .status(HttpStatusCode.OK)
        .json({ message: "message fetched succesfully", lastMessage });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error occured" });
    }
  }

  public async loadChatMessages(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const chatId = req.query.chatId as string;
      if (!chatId) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "chatID is missing" });
      }

      const loadedMessages = await this.messageService.loadMessagesService(
        chatId
      );
      return res
        .status(HttpStatusCode.OK)
        .json({
          message: "message loaded succesfully completed",
          loadedMessages,
        });
    } catch (error) {
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "intenral server error" });
    }
  }
}

export default MessageController;
