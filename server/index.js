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
const ADMIN = "Admin";

import { fileURLToPath } from "url"; // this are used for get dirname in ejs format(we are using import)
// Remove the unused import statement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(port, () => {
  console.log(`listening ${port}`);
});

const UsersState = {
  users: [],
  setUsers: function (newarray) {
    this.users = newarray;
  },
};

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
  //upon connections to particular
  socket.emit("message", buildmsg(ADMIN, "Welcome to chat APP"));

  socket.on("enterroom", ({ name, room }) => {
    const prevroom = getCurrentUserid(socket.id)?.room;
    if (prevroom) {
      socket.leave(prevroom);
      io.to(prevroom).emit("message", buildmsg(ADMIN, `${name} left the room`));
    }

    const user = activateUser(socket.id, name, room);
    if (prevroom) {
      io.to(prevroom).emit("userlist", {
        users: getCurrentRoomid(prevroom),
      });
    }

    //join room
    socket.join(user.room);

    //to user who joined
    socket.emit("message", buildmsg(ADMIN, `Welcome ${name} to ${room}`));

    socket.broadcast
      .to(user.room)
      .emit("message", buildmsg(ADMIN, `${name} has joined the room`));

    //Update users

    io.to(user.room).emit("userlist", {
      users: getCurrentRoomid(user.room),
    });

    //update rooms
    io.emit("roomlist", {
      rooms: allrooms(),
    });
  });

  socket.on("disconnect", () => {
    const user = getCurrentUserid(socket.id);
    userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        buildmsg(ADMIN, `${user.name} has left the room`)
      );
      io.to(user.room).emit("userlist", {
        users: getCurrentRoomid(user.room),
      });
      io.emit("roomlist", {
        rooms: allrooms(),
      });
    }
  });
  //Lsitening for a messagge event
  socket.on("message", ({ name, text }) => {
    const room = getCurrentUserid(socket.id)?.room;
    if (room) {
      io.to(room).emit("message", buildmsg(name, text));
    }
  });

  //disconnect

  socket.on("activity", (name) => {
    const room = getCurrentUserid(socket.id)?.room;
    if (room) {
      socket.broadcast.to(room).emit("activity", name);
    }
  });
});

function buildmsg(name, text) {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date()),
  };
}

//user functions
function activateUser(id, name, room) {
  const user = { id, name, room };
  UsersState.setUsers([
    ...UsersState.users.filter((user) => user.id !== id),
    user,
  ]);
  return user;
}

function userLeave(id) {
  UsersState.setUsers(UsersState.users.filter((user) => user.id !== id));
}

function getCurrentUserid(id) {
  return UsersState.users.find((user) => user.id === id);
}

function getCurrentRoomid(room) {
  return UsersState.users.filter((user) => user.room === room);
}

function allrooms() {
  return Array.from(new Set(UsersState.users.map((user) => user.room)));
}
