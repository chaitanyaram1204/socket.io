/* const ws = require("ws");
const server = new ws.Server({ port: 4000 });

server.on("connection", (socket) => {
  socket.on("message", (message) => {
    const b = Buffer.from(message);
    console.log(b.toString());
    socket.send(`${message}`);
  });
}); */

/* import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    //Cross Origin Resource Request
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://localhost:5500", "http://127.0.0.1:5500"],
  },
});

io.on("connection", (socket) => {
  console.log(`user ${socket.id} connected`);
  socket.on("message", (data) => {
    console.log(data);
    io.emit("message", `${socket.id.substring(0, 5)} : ${data}`);
  });
});

httpServer.listen(4000, () => {
  console.log("port 4000");
}); */

import express from "express";
import { Server } from "socket.io";
import path from "path";
const port = process.env.PORT || 4000;

import { fileURLToPath } from "url"; // this are used for get dirname in ejs format(we are using import)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(port, () => {
  console.log(`listening ${port}`);
});

const io = new Server(expressServer, {
  cors: {
    //Cross Origin Resource Request
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://localhost:5500", "http://127.0.0.1:5500"],
  },
});

io.on("connection", (socket) => {
  console.log(`user ${socket.id} connected`);
  socket.on("message", (data) => {
    console.log(data);
    io.emit("message", `${socket.id.substring(0, 5)} : ${data}`);
  });
});
