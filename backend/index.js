const express = require("express");
const app = express();
const bcrypt = require("bcrypt"); // Importing bcrypt package
const passport = require("passport");
const initializePassport = require("./passport-config.js");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");
const path = require("path");
require("./config/db");
const User = require("./model/userModel");
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

const users = [];
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../", "frontend", "pages"));
app.use(express.static(path.join(__dirname, "../", "frontend", "public")));
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // We wont resave the session variable if nothing is changed
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// Configuring the register post functionality
app.post("/login", async (req, res) => {
  const user = await User.find({ email: req.body.email });
  // console.log(user[0]);
  const salt = user[0].salt;
  const current_password = await bcrypt.hash(req.body.password, salt);
  // console.log(user);
  console.log(user[0].password);
  console.log(current_password);
  if (user.length > 0 && user[0].password === current_password) {
    res.render("index.ejs", { name: user[0].name });
  } else {
    res.redirect("/login");
  }
});

// Configuring the register post functionality
app.post("/register", async (req, res) => {
  // console.log("aww");
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      salt: salt,
    });
    user.save().then(() => {
      res.redirect("/login");
    });
  } catch (e) {
    res.redirect("/register");
  }
});

// Routes
app.get("/", (req, res) => {
  res.render("index.ejs", { name: req.user.name });
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("signup.ejs");
});

app.delete("/logout", (req, res) => {
  req.logout(req.user, (err) => {
    if (err) return next(err);
    res.render("login.ejs");
  });
});
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
