import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { appConfig } from "../../../consts";
import { User } from "../../../DAL/models/User.model";
import { validate } from "class-validator";
import { transporter } from "../../../helpers";
import { In } from "typeorm";
import { ERoleType } from "../../app/enums";
import { formatErrors } from "../../middlewares/error.middleware";
import { CreateStaffDTO } from "./Admin.dto";

const staffCreate = async (req: Request, res: Response) => {
  try {
    const { name, surname, email, password, phone } = req.body;

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      res.status(409).json({ message: "Bu email artıq istifadə olunub" });
      return;
    }

    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      res.status(409).json({ message: "Bu nömrə artıq istifadə olunub" });
      return;
    }

    const dto = new CreateStaffDTO();
    dto.name = name;
    dto.surname = surname;
    dto.email = email;
    dto.password = password;
    dto.phone = phone;
    dto.role = ERoleType.STAFF;

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = User.create({
      name,
      surname,
      email,
      phone,
      role: ERoleType.STAFF,
      password: hashedPassword,
    });

    await newStaff.save();

    const data = await User.findOne({
      where: { email },
      select: ["id", "name", "surname", "email", "phone", "role", "created_at"],
    });

    const mailOptions = {
      from: appConfig.EMAIL,
      to: email,
      subject: "Yeni istifadəçi yaradıldı",
      html: `<h3>Yeni istifadəçi profiliniz yaradıldı</h3>
               <p>Əlavə edilən məlumatlar:</p>
               <ul>
                 <li><strong>Ad:</strong> ${newStaff.name}</li>
                 <li><strong>Soyad:</strong> ${newStaff.surname}</li>
                 <li><strong>Email:</strong> ${newStaff.email}</li>
                 <li><strong>Telefon:</strong> ${newStaff.phone}</li>
                 <li><strong>Rol:</strong> ${newStaff.role}</li>
               </ul>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email göndərilə bilmədi:", error);
        res.status(500).json({ message: "Email göndərilmədi", error });
        return;
      }

      console.log("Email göndərildi:", info.response);
      res.status(201).json({ data });
    });
  } catch (error) {
    res.status(500).json({
      message: "Xəta baş verdi",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const staffDelete = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({
      where: { id: Number(req.params.id), role: ERoleType.STAFF },
    });

    if (!user) {
      res.status(404).json({ message: "İstifadəçi tapılmadı" });
      return;
    }

    await User.softRemove(user);

    res.status(204).json({ message: "İşçi uğurla silindi!" });
  } catch (error) {
    res.status(500).json({
      message: "Xəta baş verdi",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const AdminController = () => ({
  staffCreate,
  staffDelete,
});
