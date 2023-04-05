const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
dotenv.config();
const homeRouter = require("./routes/homeRoute");
const loginRouter = require("./routes/loginRoute");
const registerRouter = require("./routes/registerRoute");
const logoutRouter = require("./routes/logoutRoute");
const path = require("path");
const authenticated = require("./middleware/authenticateUser");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../", "frontend", "views"));
app.use(express.static(path.join(__dirname, "../", "frontend", "public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(homeRouter);
app.use(loginRouter);
app.use(registerRouter);
app.use(logoutRouter);
app.get("*", authenticated);
var server = app.listen(8000);
const io = require("socket.io")(server);
const user = {};
io.on("connection", (socket) => {
  socket.on("new-user-joined", (Name) => {
    user[socket.id] = Name;
    socket.broadcast.emit("user-joined", Name);
  });

  socket.on("send", (message) => {
    socket.broadcast.emit("receive", {
      message: message,
      Name: user[socket.id],
    });
  });

  socket.on("disconnect", (message) => {
    socket.broadcast.emit("left", user[socket.id]);
    delete user[socket.id];
  });
});
