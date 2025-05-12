import { Router } from "express";
import { OrderController } from "./Order.controller";
import { roleCheck } from "../../middlewares/auth.middleware";
import { ERoleType } from "../../app/enums";
import {
  createChatRoomIfNotExists,
  sendSystemMessage,
  setOrderCustomer,
} from "../../middlewares/chat.middleware";
import { orderLimiter } from "../../../helpers";

export const orderRoutes = Router();
const controller = OrderController();

orderRoutes.post("/create", orderLimiter, controller.createOrder);
orderRoutes.put(
  "/update/status/:id",
  roleCheck([ERoleType.ADMIN, ERoleType.STAFF]),
  setOrderCustomer,
  createChatRoomIfNotExists,
  controller.updateOrderStatus
);
orderRoutes.get("/me", controller.getOrdersByUser);
