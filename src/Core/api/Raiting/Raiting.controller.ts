import { Request, Response } from "express";
import { AuthRequest } from "../../../types";
import { MenuItem } from "../../../DAL/models/Menu.model";
import { Rating } from "../../../DAL/models/Raiting.model";
import { OrderItem } from "../../../DAL/models/OrderItem.model";

export const addRating = async (req: AuthRequest, res: Response) => {
  const { menuItemId, rating } = req.body;
  const user = req.user;

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (rating < 1 || rating > 5) {
    res.status(400).json({ message: "Rating must be between 1 and 5." });
    return;
  }

  const menuItem = await MenuItem.findOne({ where: { id: menuItemId } });
  if (!menuItem) {
    res.status(404).json({ message: "Menu item not found" });
    return;
  }

  const hasOrdered = await OrderItem.createQueryBuilder("orderItem")
    .leftJoinAndSelect("orderItem.order", "order")
    .where("order.customer = :userId", { userId: user.id })
    .andWhere("orderItem.menuItem = :menuItemId", { menuItemId })
    .getOne(); // Bu menu item-in sifarişinin olub-olmadığını yoxlayırıq

  if (!hasOrdered) {
    res
      .status(400)
      .json({ message: "You can only rate items you have ordered." });
    return;
  }

  // İstifadəçi artıq reytinq veribsə, xəbərdarlıq göndəririk
  const existingRating = await Rating.findOne({
    where: { user:{id:user.id}, menuItem: {id:menuItemId} },
  });

  console.log(existingRating)

  if (existingRating) {
    res.status(400).json({ message: "You have already rated this item." });
    return;
  }

  // Yeni rating daxil edirik
  const newRating = Rating.create({
    user: user,
    menuItem: menuItem,
    rating: rating,
  });

  await newRating.save();

  // Yeni ortalama reytinqi hesablama
  const allRatings = await Rating.createQueryBuilder("rating")
    .select("AVG(rating.rating)", "average")
    .where("rating.menuItemId = :menuItemId", { menuItemId })
    .getRawOne();

  const newAverageRating = allRatings ? allRatings.average : rating;

  // Menu item-in reytinqini yeniləyirik
  menuItem.rating = newAverageRating;
  await menuItem.save();

  res.status(200).json({
    message: "Rating added successfully",
    averageRating: newAverageRating,
  });
};
