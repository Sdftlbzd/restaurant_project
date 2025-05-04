import { Router } from "express";
import { AdminController } from "./Admin.controller";

export const adminRoutes = Router();
const controller = AdminController();

adminRoutes.post("/create/staff", controller.staffCreate);
adminRoutes.delete("/delete/staff/:id", controller.staffDelete);
