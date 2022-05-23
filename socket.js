const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
   res.sendFile(__dirname + "/index.html");
});
let socketId;
io.on("connection", (socket) => {
   console.log("a user connected");
   console.log(socket.id);
   socketId = socket.id;
   console.log(socket.handshake.id);
   console.log(io.sockets.adapter.rooms.size);
   console.log(io.sockets.sockets.get(socketId)?.emit("chat message", "HOLA"));
   //socket.disconnect();
   // socket.client;
   // setInterval(() => {
   //    socket.i;
   //    socket.emit("chat message", "HOLA");
   // }, 500);
   socket.on("chat message", function (msg) {
      const message = JSON.parse(msg);
      console.log(socket.id);
      console.log("Cliente " + message.clientId + " - " + message.message);
   });
});

server.listen(3333, () => {
   console.log("listening on *:3000");
});
