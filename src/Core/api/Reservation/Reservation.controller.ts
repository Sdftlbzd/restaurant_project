import { Request, Response } from "express";
import { Reservation } from "../../../DAL/models/Reservation.model";
import { AuthRequest } from "../../../types";
import { EReservationStatus } from "../../app/enums";
import {
  CreateReservationDTO,
  EditReservationStatusDTO,
} from "./Reservation.dto";
import { validate } from "class-validator";
import { formatErrors } from "../../middlewares/error.middleware";

const createReservation = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { reservationDate, startTime, endTime, guests } = req.body;

    if (!guests || guests === 0) {
      res.status(400).json({ message: "There must be at least 1 guest." });
      return;
    }

    const now = new Date();
    const startDateTime = new Date(`${reservationDate}T${startTime}`);
    const endDateTime = new Date(`${reservationDate}T${endTime}`);
    const reservationDay = new Date(reservationDate);

    const today = new Date(now.toDateString());
    if (reservationDay < today) {
      res.status(400).json({ message: "Reservation date cannot be in the past." });
      return;
    }

    const minStartTime = new Date(now.getTime() + 30 * 60 * 1000);
    if (startDateTime < minStartTime) {
      res.status(400).json({ message: "Start time must be at least 30 minutes from now." });
      return;
    }

    if (endDateTime <= startDateTime) {
      res.status(400).json({ message: "End time must be after start time." });
      return;
    }

    const duration = endDateTime.getTime() - startDateTime.getTime();
    if (duration < 30 * 60 * 1000) {
      res.status(400).json({ message: "Reservation duration must be at least 30 minutes." });
      return;
    }

    const dto = new CreateReservationDTO();
    dto.user = user;
    dto.startTime = startDateTime;
    dto.endTime = endDateTime;
    dto.guests = guests;

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    const reservation = Reservation.create({
      user,
      date: reservationDay,
      startTime: startDateTime,
      endTime: endDateTime,
      guests,
    });

    await reservation.save();

    res.status(201).json({
      message: "Reservation created successfully",
      data: reservation,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const getUserReservations = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    const [list, total] = await Reservation.findAndCount({
      where: { user: { id: user.id } },
      relations: ["user"],
      order: { updated_at: "DESC" },
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
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const updateReservationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      res.status(400).json("Id is required");
      return;
    }
    const { status } = req.body;

    const reservation = await Reservation.findOne({ where: { id } });

    if (!reservation) {
      res.status(404).json({ message: "Reservation not found" });
      return;
    }

    if (!Object.values(EReservationStatus).includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    if (reservation.status === status) {
      res.status(304).json("Hech bir deyishiklik yoxdur");
      return;
    }

    const dto = new EditReservationStatusDTO();
    dto.status = status;

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    reservation.status = status;
    await reservation.save();

    res.json({
      message: "Reservation status updated",
      data: reservation,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const cancelReservation = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const id = Number(req.params.id);

    const reservation = await Reservation.findOne({ where: { id, user } });

    if (!reservation) {
      res.status(404).json({ message: "Reservation not found" });
      return;
    }

    reservation.status = EReservationStatus.CANCELLED;
    await reservation.save();

    res.json({ message: "Reservation cancelled", data: reservation });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const getAllReservations = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    const [list, total] = await Reservation.findAndCount({
      relations: ["user"],
      order: { updated_at: "DESC" },
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
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const ReservationController = () => ({
  createReservation,
  getUserReservations,
  updateReservationStatus,
  cancelReservation,
  getAllReservations,
});
