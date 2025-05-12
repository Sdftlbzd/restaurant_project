import { Router } from "express";
import { MenuController } from "./Menu.controller";
import { uploads } from "../../middlewares/multer.middleware";
import { roleCheck } from "../../middlewares/auth.middleware";
import { ERoleType } from "../../app/enums";

export const menuRoutes = Router();
const controller = MenuController();

menuRoutes.post("/create",roleCheck([ERoleType.ADMIN]), uploads.single("image"), controller.create);
menuRoutes.put("/update/:id",roleCheck([ERoleType.ADMIN]), uploads.single("image"), controller.editMenuItem);
menuRoutes.delete("/delete/:id",roleCheck([ERoleType.ADMIN]), controller.deleteMenuItem);
menuRoutes.get("/list", controller.menuList);
