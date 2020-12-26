const http = require("http");
const express = require("express");

const app = express(); // creating instance of express
const server = http.createServer(app); // creating http server from express instance & enabling cross access origin resource sharing
const io = require("socket.io")(server, {
  cors: {
    // this is required or else you will receive a CORS error, if you are using v3 of socket.io
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
}); // creating socketio server side with express http server

// server-side
io.on("connection", (socket) => {
  console.log(socket.id + " has connected"); // x8WIv7-mJelg7on_ALbx

  msgToClient = socket.id + " this is the server speaking";
  socket.emit("Hello", msgToClient);

  socket.on("PrivateMessage", (messageObject) => {
    console.log("private message received by server");
    console.log(messageObject);
    let privMsg = {
      recipientID: messageObject.recipientID,
      senderID: messageObject.senderID,
      message: messageObject.messageContent,
    };
    console.log("sending to : " + privMsg.recipientID);
    socket.broadcast.emit(privMsg.recipientID, privMsg);
  });
});
// receives a PrivateMessage request with a message object attached
/* io.on("PrivateMessage", (messageObject) => {
  console.log("private message received by server");
  let privMsg = {
    recipientID: messageObject.recipientID,
    senderID: messageObject.senderID,
    message: messageObject.messageContent,
  };

  io.to(privMsg.recipientID).emit(privMsg.recipientID, privMsg);
}); */

const PORT = 8080;

server.listen(PORT, () => console.log(`Server running on port:${PORT}`));
