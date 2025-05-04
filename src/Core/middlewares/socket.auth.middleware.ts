import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { appConfig } from "../../consts";
import { User } from "../../DAL/models/User.model";

export const socketAuth = async (socket: Socket, next: (err?: any) => void) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Token yoxdur"));
  }

  try {
    const decoded = jwt.verify(
      token,
      String(appConfig.JWT_SECRET)
    ) as jwt.JwtPayload;

    const user = await User.findOne({ where: { id: Number(decoded.sub) } });

    if (!user) {
      return next(new Error("İstifadəçi tapılmadı"));
    }

    // socket üzərində user obyektini saxla
    (socket as any).user = user;

    next();
  } catch (err) {
    console.error("Socket auth error:", err);
    return next(new Error("Token etibarsızdır"));
  }
};
