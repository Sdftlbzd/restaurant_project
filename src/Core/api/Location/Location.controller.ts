import { Response } from "express";
import { AuthRequest } from "../../../types";
import { Location } from "../../../DAL/models/Location.model";
import { LocationCreateDto } from "./Location.dto";
import { validate } from "class-validator";
import { formatErrors } from "../../middlewares/error.middleware";

export const createLocation = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { title, address } = req.body;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const existingLocation = await Location.findOne({ where: { title, user } });
    if (existingLocation) {
      res.status(409).json({ message: "Bu adda location artıq mövcuddur" });
      return;
    }

    const dto = new LocationCreateDto();
    dto.title = title;
    dto.address = address;

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    const location = Location.create({ title, address, user });
    await location.save();

    res.status(201).json({ message: "Location əlavə olundu", data: location });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Xəta baş verdi", error });
  }
};

export const deleteLocation = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const locationId = Number(req.params.id);

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const location = await Location.findOne({
      where: { id: locationId, user },
    });

    if (!location) {
      res.status(404).json({ message: "Location tapılmadı" });
      return;
    }

    await location.softRemove();
    res.status(200).json({ message: "Location silindi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Xəta baş verdi", error });
  }
};

const locationList = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    const [list, total] = await Location.findAndCount({
      where: { user: { id: user.id } },
      relations: ["user"],
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

export const LocationController = () => ({
  createLocation,
  deleteLocation,
  locationList,
});
