import { Router } from "express";
import { MenuController } from "./Menu.controller";
import { uploads } from "../../middlewares/multer.middleware";

export const menuRoutes = Router();
const controller = MenuController();

menuRoutes.post("/create", uploads.single("image"), controller.create);
menuRoutes.put("/update/:id", uploads.single("image"), controller.editMenuItem);
menuRoutes.delete("/delete/:id", controller.deleteMenuItem);
menuRoutes.get("/list", controller.menuList);
