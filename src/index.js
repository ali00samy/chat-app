const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generatMessage,
  generatLocationMessage,
} = require("../src/utils/messages");
const {
  getUser,
  addUser,
  getUserInRoom,
  removeUser,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 888;

app.use(express.static(path.join(__dirname, "../public")));

io.on("connection", (socket) => {
  console.log("websocket connection !!");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generatMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit("message", generatMessage("Admin", `${user.username} has joined!`));

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callBack) => {
    const user = getUser(socket.id);

    const filter = new Filter();

    message = filter.clean(message);

    io.to(user.room).emit("message", generatMessage(user.username, message));
    callBack();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generatMessage("Admin", `${user.username} has left !`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room),
      });
    }
  });

  socket.on("sendLocation", (coords) => {
    io.emit(
      "locationMessage",
      generatLocationMessage(
        `https://www.google.com/maps?q=${coords.lat},${coords.long}`
      )
    );
  });
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
