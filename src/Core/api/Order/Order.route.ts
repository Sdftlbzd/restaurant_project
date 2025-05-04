import { Router } from "express";
import { OrderController } from "./Order.controller";
import { roleCheck } from "../../middlewares/auth.middleware";
import { ERoleType } from "../../app/enums";

export const orderRoutes = Router();
const controller = OrderController();

orderRoutes.post("/create", controller.createOrder);
orderRoutes.put("/update/status/:id", roleCheck([ERoleType.ADMIN, ERoleType.STAFF]),controller.updateOrderStatus);
orderRoutes.get("/me", controller.getOrdersByUser);
