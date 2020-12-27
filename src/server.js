const http = require("http");
const express = require("express");

const app = express(); // creating instance of express
const server = http.createServer(app); // creating http server from express instance & enabling cross access origin resource sharing
const serverBaseURL = "http://localhost:8080";
const URLfrontEnd = "http://localhost:3000"; // place react app url here
const io = require("socket.io")(server, {
  cors: {
    // this is required or else you will receive a CORS error, if you are using v3 of socket.io
    origin: URLfrontEnd,
    methods: ["GET", "POST"],
  },
}); // creating socketio server side with express http server
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("finalShake", (Object) => {
    socket.broadcast.emit(Object.ownerId, Object.usrId);
  });
  socket.on("JoinGame", (joinObject) => {
    console.log("JoinGame request received from " + joinObject.senderId);
    console.log("password of room: " + joinObject.pw);
    socket.broadcast.emit("gameSend", joinObject);
  });
});
const PORT = 8080;

server.listen(PORT, () => console.log(`Server running on port:${PORT}`));
