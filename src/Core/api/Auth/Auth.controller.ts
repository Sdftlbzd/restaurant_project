import { NextFunction, Request, Response } from "express";
import { validate } from "class-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { appConfig } from "../../../consts";
import { User } from "../../../DAL/models/User.model";
import { AuthRequest } from "../../../types";
import { formatErrors } from "../../middlewares/error.middleware";
import { CreatePassDTO, CreateUserDTO, UpdateUserDTO } from "./Auth.dto";
import { transporter } from "../../../helpers";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

const register = async (req: Request, res: Response) => {
  try {
    const { name, surname, email, password, location, phone } = req.body;

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

    const dto = new CreateUserDTO();
    dto.name = name;
    dto.surname = surname;
    dto.email = email;
    dto.password = password;
    dto.phone = phone;
    dto.locations = location;

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = User.create({
      name,
      surname,
      email,
      password: hashedPassword,
      phone,
      locations: location,
    });

    await newUser.save();

    res.status(201).json({
      message: "İstifadəçi uğurla qeydiyyatdan keçdi",
      user: {
        id: newUser.id,
        name: newUser.name,
        surname: newUser.surname,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Xəta baş verdi", error });
  }
};

const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { name, surname, location, phone } = req.body;

    const dto = new UpdateUserDTO();
    dto.name = name;
    dto.surname = surname;
    dto.phone = phone;
    dto.locations = location;

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    await User.update(user.id, {
      name,
      surname,
      phone,
      locations: location,
    });

    const updatedUser = await User.findOne({
      where: { id: user.id },
      select: [
        "id",
        "name",
        "surname",
        "email",
        "phone",
        "locations",
        "updated_at",
      ],
    });

    res.status(201).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Xəta baş verdi", error });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Email və ya şifrə yanlışdır" });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: "Email və ya şifrə yanlışdır" });
      return;
    }

    const token = jwt.sign({ sub: user.id }, appConfig.JWT_SECRET!, {
      expiresIn: "1d",
    });

    res.status(200).json({ access_token: token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const aboutMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const data = await User.findOne({
      where: { id: user.id },
      select: ["id", "name", "surname", "email", "phone"],
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const ForgetPass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({
      where: { email: req.body.email },
    });

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const token = uuidv4();
    const resetExpiredIn = moment()
      .add(appConfig.VALIDITY_MINUTE_MAIL, "minutes")
      .toDate();

    user.passToken = token;
    user.resetExpiredIn = resetExpiredIn;

    await user.save();

    const resetUrl = `${appConfig.CREATE_PASS_URL}${token}`;

    const mailOptions = {
      from: appConfig.EMAIL,
      to: req.body.email,
      subject: "Password Reset Request",
      html: `<h3>Password Reset</h3>
                 <p>To reset your password, click the link below:</p>
                 <a href="${resetUrl}">Reset Password</a>
                 <p>This link is valid for ${appConfig.VALIDITY_MINUTE_MAIL} minute.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.status(500).json({ message: "Error sending email", error });
        return;
      }
      res.status(200).json({
        message: "Password reset email sent successfully.Check your email",
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const CreatePass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { newPassword } = req.body;

    const user = await User.findOne({
      where: { passToken: req.params.token },
    });

    const dto = new CreatePassDTO();
    dto.password = newPassword;

    const errors = await validate(dto);

    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    if (!user || !newPassword) {
      res.status(401).json({
        message: "Token və ya password yoxdur",
      });
      return;
    }

    if (user.resetExpiredIn.getTime() < Date.now()) {
      res.status(401).json({
        message: "Artıq vaxt bitib, yenidən cəhd edin!!!",
      });
      return;
    }

    const ValidPassword = await bcrypt.compare(newPassword, user.password);

    if (ValidPassword) {
      res.status(400).json("Əvvəlki parolu yaza bilməzsiniz");
      return;
    }

    const password = await bcrypt.hash(newPassword, 10);

    user.password = password;
    user.passToken = "";

    await user.save();
    res.status(201).send(`${user.email} mailinin password-ü yeniləndi`);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const AuthController = () => ({
  register,
  login,
  updateUser,
  aboutMe,
  ForgetPass,
  CreatePass,
});
