import { Router } from "express";
import { MessageController } from "./Message.controller";

export const messageRoutes = Router();
const controller = MessageController();

messageRoutes.post("/create", controller.sendMessage);
messageRoutes.get("/get/room/:id", controller.getMessagesByRoomId);
