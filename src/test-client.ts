// test-client.ts
import { io } from "socket.io-client";

const socket = io("http://localhost:8080"); // backend portunu yaz

// Otağa qoşul
socket.emit("joinRoom", { roomId: "ROOM_ID" });

// Mesaj göndər
socket.emit("sendMessage", {
  roomId: "ROOM_ID",
  senderId: "USER_ID",
  content: "Salam, bu test mesajıdır",
  isCustomer: true,
});

// Yeni mesaj gəldikdə konsola yaz
socket.on("newMessage", (message) => {
  console.log("Yeni mesaj gəldi:", message);
});
