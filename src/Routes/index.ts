import { Router } from "express";
import { authRoutes } from "../Core/api/Auth/Auth.route";
import { roleCheck, useAuth } from "../Core/middlewares/auth.middleware";
import { ERoleType } from "../Core/app/enums";
import { adminRoutes } from "../Core/api/Admin/Admin.route";
import { categoryRoutes } from "../Core/api/Category/Category.route";
import { menuRoutes } from "../Core/api/Menu/Menu.route";
import { orderRoutes } from "../Core/api/Order/Order.route";
import { reservationRoutes } from "../Core/api/Reservation/Reservation.route";
import { locationRoutes } from "../Core/api/Location/Location.route";
import { messageRoutes } from "../Core/api/Message/Message.route";
import { paymentRoutes } from "../Core/api/Payment/payment.route";
import { raitingRoutes } from "../Core/api/Raiting/Raiting.route";

export const v1Routes = Router();

v1Routes.use("/auth", authRoutes);
v1Routes.use(
  "/admin",
  useAuth,
  roleCheck([ERoleType.ADMIN]),
  roleCheck(["ADMIN"]),
  adminRoutes
);
v1Routes.use("/menu", useAuth, menuRoutes);
v1Routes.use("/category", useAuth, categoryRoutes);
v1Routes.use("/order", useAuth, orderRoutes);
v1Routes.use("/reservation", useAuth, reservationRoutes);
v1Routes.use("/location", useAuth, locationRoutes);
v1Routes.use("/message", useAuth, messageRoutes);
v1Routes.use("/payment", useAuth, paymentRoutes);
v1Routes.use("/raiting", useAuth, raitingRoutes);
