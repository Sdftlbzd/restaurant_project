import { Router } from "express";
import { CategoryController } from "./Category.controller";
import { roleCheck, useAuth } from "../../middlewares/auth.middleware";
import { ERoleType } from "../../app/enums";

export const categoryRoutes = Router();
const controller = CategoryController();

categoryRoutes.post("/create", useAuth,roleCheck([ERoleType.ADMIN]), controller.createCategory);
categoryRoutes.put("/update/:id",roleCheck([ERoleType.ADMIN]), controller.updatedCategory);
categoryRoutes.delete("/delete/:id",roleCheck([ERoleType.ADMIN]), controller.deleteCategory);
categoryRoutes.get("/list", controller.categoryList);
