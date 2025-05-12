import { Router } from "express";
import { addRating } from "./Raiting.controller";

export const raitingRoutes = Router();

raitingRoutes.post("/add", addRating);
