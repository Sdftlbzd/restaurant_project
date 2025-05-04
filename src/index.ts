import express from "express";
import "reflect-metadata";
import { AppDataSource } from "./DAL/config/data-source";
import { appConfig } from "./consts";
import { v1Routes } from "./Routes";
import http from "http";
import { Server } from "socket.io";
import { registerChatHandlers } from "./socket/chat.socket";
import { socketAuth } from "./Core/middlewares/socket.auth.middleware";
import path from "path";

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");

    const app = express();
    const port = appConfig.PORT;

    app.use(express.json());
    app.use("/api/v1", v1Routes);

    app.use(express.static(path.join(__dirname, "../public")));

    // Socket.IO üçün HTTP server yaradılır
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "*", // frontend hələ yoxdursa, * qoy
        methods: ["GET", "POST"],
      },
    });

    io.use(socketAuth); // auth burada tətbiq olunur

    // Socket.io connection
    io.on("connection", (socket) => {
      console.log("Yeni istifadəçi qoşuldu:", socket.id);
      registerChatHandlers(socket, io); // chat üçün handlerləri buradan idarə edirsən
    });

    // Socket ilə birlikdə HTTP serveri işə sal
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to database", error);
  });
