

const http = require('http');
const express = require('express');

const app = express(); // creating instance of express
const server = http.createServer(app) // creating http server from express instance & enabling cross access origin resource sharing
const io = require("socket.io")(server, {
  cors: {  // this is required or else you will receive a CORS error, if you are using v3 of socket.io
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"],
    
  }
}); // creating socketio server side with express http server


// server-side
io.on("connection", (socket) => {
  
  console.log(socket.id + " has connected"); // x8WIv7-mJelg7on_ALbx
  console.log(socket.connected);
  
});

const PORT = 8080;

server.listen(PORT , () => console.log(`Server running on port:${PORT}`));