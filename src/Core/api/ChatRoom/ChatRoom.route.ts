import { Router } from "express";
import { useAuth } from "../../middlewares/auth.middleware";
import { ChatRoomController } from "./ChatRoom.controller";

export const chatRoutes = Router();
const controller = ChatRoomController();

chatRoutes.post("/create", useAuth, controller.createChatRoomIfNotExists);
chatRoutes.post("/sistem/messages", useAuth, controller.sendSystemMessage);
