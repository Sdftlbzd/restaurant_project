import { Router } from "express";
import { useAuth } from "../../middlewares/auth.middleware";
import { AuthController } from "./Auth.controller";

export const authRoutes = Router();
const controller = AuthController();

authRoutes.post("/register", controller.register);
authRoutes.post("/login", controller.login);
authRoutes.put("/update", useAuth, controller.updateUser);
authRoutes.get("/me", useAuth, controller.aboutMe);
authRoutes.post("/forget/password", controller.ForgetPass);
authRoutes.post("/create/password/:token", controller.CreatePass);
