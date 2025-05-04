import { Router } from "express";
import { ReservationController } from "./Reservation.controller";
import { roleCheck } from "../../middlewares/auth.middleware";
import { ERoleType } from "../../app/enums";

export const reservationRoutes = Router();
const controller = ReservationController();

reservationRoutes.post("/create", controller.createReservation);
reservationRoutes.get("/me", controller.getUserReservations);
reservationRoutes.put("/update/status/:id", roleCheck([ERoleType.ADMIN, ERoleType.STAFF]),controller.updateReservationStatus);
reservationRoutes.delete("/delete/:id",controller.cancelReservation);
reservationRoutes.get("/all", roleCheck([ERoleType.ADMIN, ERoleType.STAFF]), controller.getAllReservations);
