import { NextFunction, Request, Response } from "express";
import { validate } from "class-validator";
import fs from "fs/promises";
import { AuthRequest } from "../../../types";
import { CreateMenuItemDTO, EditMenuItemDTO } from "./Menu.dto";
import { Category } from "../../../DAL/models/Category.model";
import { MenuItem } from "../../../DAL/models/Menu.model";
import { formatErrors } from "../../middlewares/error.middleware";

const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { name, description, price, available, category_id } = req.body;

    const image = req.file;

    if (!category_id) {
      res.status(400).json("Id is required");
      return;
    }

    const category = await Category.findOne({
      where: { id: category_id },
    });
    if (!category) {
      res.status(404).json({ message: "category not found" });
      return;
    }

    const dto = new CreateMenuItemDTO();
    dto.name = name;
    dto.description = description;
    dto.price = price;
    dto.category = category;
    dto.available = available;

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    const newMenuItem = MenuItem.create({
      name,
      description,
      price,
      category,
      available,
      imagePath: image?.filename,
    });

    await newMenuItem.save();

    const data = await MenuItem.findOne({
      where: { id: newMenuItem.id },
      relations: ["category"],
      select: ["id", "name", "description", "price", "available"],
    });

    res.status(201).json(data);
  } catch (error: any) {
    if (req.file) {
      console.log("file var", req.file.filename);
      const filePath = `uploads/${req.file.filename}`;

      try {
        await fs.access(filePath);
        console.log("file exists");

        await fs.unlink(filePath);
        console.log("file deleted");
      } catch (err) {
        console.log("Fayl mövcud deyil və ya silinərkən xəta baş verdi:", err);
      }
    }
    res.status(500).json({
      message: "An error occurred while create the menu item",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const editMenuItem = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const menuItem_id = Number(req.params.id);

    if (!menuItem_id) {
      new Error("Id is required");
      return;
    }

    const menuItem = await MenuItem.findOne({
      where: { id: menuItem_id },
      relations: ["category"],
    });

    if (!menuItem) {
      res.status(404).json({ message: "Menu item not found" });
      return;
    }

    const { name, description, price, available, category_id } = req.body;

    const image = req.file;

    if (!category_id) {
      res.status(400).json("Id is required");
      return;
    }

    const category = await Category.findOne({
      where: { id: category_id },
    });
    if (!category) {
      res.status(404).json({ message: "category not found" });
      return;
    }

    const dto = new EditMenuItemDTO();
    dto.name = name;
    dto.description = description;
    dto.price = price;
    dto.category = category;
    dto.available = available;

    const errors = await validate(dto);

    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    await MenuItem.update(menuItem_id, {
      name,
      description,
      price,
      category,
      available,
      imagePath: image?.filename,
    });

    const updatedData = await MenuItem.findOne({
      where: { id: menuItem_id },
      relations: ["category"],
      select: ["id", "name", "description", "price", "available"],
    });

    res.json({
      message: "Menu item updated successfully",
      data: updatedData,
    });
  } catch (error: any) {
    if (req.file) {
      console.log("file var", req.file.filename);
      const filePath = `uploads/${req.file.filename}`;

      try {
        await fs.access(filePath);
        console.log("file exists");

        await fs.unlink(filePath);
        console.log("file deleted");
      } catch (err) {
        console.log("Fayl mövcud deyil və ya silinərkən xəta baş verdi:", err);
      }
    }
    res.status(500).json({
      message: "An error occurred while update the education",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const deleteMenuItem = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const menuItem_id = Number(req.params.id);

    if (!menuItem_id) {
      new Error("Id is required");
      return;
    }

    const menuItem = await MenuItem.findOne({
      where: { id: menuItem_id },
      relations: ["category"],
    });

    if (!menuItem) {
      res.status(404).json({ message: "Menu item not found" });
      return;
    }

    if (menuItem.imagePath) {
      const filePath = `uploads/${menuItem.imagePath}`;

      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        console.log("Image deleted:", filePath);
      } catch (err) {
        console.log("File not found or error deleting file:", err);
      }
    }

    await menuItem.softRemove();

    res.status(204).json({ message: "Menu Item deleted successfully" });
  } catch (error) {
    console.log("Error deleting menu item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const menuList = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const name = (req.query.name as string)?.trim() || undefined;
    const minPrice = req.query.minPrice
      ? Number(req.query.minPrice)
      : undefined;
    const maxPrice = req.query.maxPrice
      ? Number(req.query.maxPrice)
      : undefined;
    const categoryId = req.query.categoryId
      ? Number(req.query.categoryId)
      : undefined;
    const available =
      req.query.available !== undefined
        ? req.query.available === "true"
        : undefined;

    const query = MenuItem.createQueryBuilder("menu")
      .leftJoinAndSelect("menu.category", "category")
      .select([
        "menu.id",
        "menu.name",
        "category.id",
        "category.name",
      ])      
      .skip(skip)
      .take(limit);

    if (name) {
      query.andWhere("menu.name LIKE :name", { name: `%${name}%` });
    }

    if (minPrice !== undefined) {
      query.andWhere("menu.price >= :minPrice", { minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere("menu.price <= :maxPrice", { maxPrice });
    }

    if (categoryId) {
      query.andWhere("category.id = :categoryId", { categoryId });
    }

    if (available !== undefined ) {
      query.andWhere("menu.available = :available", { available });
    }

    const [list, total] = await query.getManyAndCount();

    res.status(200).json({
      data: list,
      pagination: {
        total,
        page,
        per_page: list.length,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const MenuController = () => ({
  create,
  editMenuItem,
  deleteMenuItem,
  menuList,
});
