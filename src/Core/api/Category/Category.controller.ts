import { NextFunction, Response } from "express";
import { Category } from "../../../DAL/models/Category.model";
import { AuthRequest } from "../../../types";
import { validate } from "class-validator";
import { formatErrors } from "../../middlewares/error.middleware";
import { CategoryUpdateDto } from "./Category.dto";

const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { name, description } = req.body;

    if (!name || !description) {
      res.status(400).json({ message: "Name and description are required" });
      return;
    }

    const newCategory = new Category();
    newCategory.name = name;
    newCategory.description = description;

    await newCategory.save();

    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const updatedCategory = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const category_id = Number(req.params.id);
    if (!category_id) {
      res.status(400).json("Id is required");
      return;
    }

    const { name, description } = req.body;
    const dto = new CategoryUpdateDto();
    dto.name = name;
    dto.description = description;

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }
    const category = await Category.findOne({
      where: { id: category_id },
    });
    if (!category) {
      res.status(404).json({ message: "category not found" });
      return;
    }

    await Category.update(category_id, {
      name,
      description,
    });
    const updatedData = await Category.findOne({
      where: { id: category_id },
    });
    res.status(200).json({
      message: "Category updated succesfully",
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};

const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const category_id = Number(req.params.id);
    if (!category_id) {
      res.status(400).json("Id is required");
      return;
    }

    const category = await Category.findOne({
      where: { id: category_id },
    });

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    await category.softRemove();

    res.status(204).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error,
    });
  }
};

const categoryList = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    const [list, total] = await Category.findAndCount({
      skip,
      take: limit,
    });

    res.status(200).json({
      data: list,
      pagination: {
        total,
        page,
        items_on_page: list.length,
        per_page: Math.ceil(Number(total) / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const CategoryController = () => ({
  createCategory,
  updatedCategory,
  deleteCategory,
  categoryList,
});
