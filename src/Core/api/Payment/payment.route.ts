import { Router } from "express";
import { PaymentController } from "./payment.controller";

export const paymentRoutes = Router();
const controller = PaymentController();

paymentRoutes.post("/pay", controller.payForOrder);
