import { Router } from "express";
import { LocationController } from "./Location.controller";

export const locationRoutes = Router();
const controller = LocationController();

locationRoutes.post("/create", controller.createLocation);
locationRoutes.delete("/delete/:id", controller.deleteLocation);
locationRoutes.get("/list", controller.locationList);
