const express = require("express");
const app = express();
const bcrypt = require("bcrypt"); // Importing bcrypt package
const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
require("./config/db");
const User = require("./model/userModel");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../", "frontend", "pages"));
app.use(express.static(path.join(__dirname, "../", "frontend", "public")));
app.use(express.urlencoded({ extended: false }));
app.post("/login", async (req, res) => {
  let errors = [];
  User.find({ email: req.body.email }).then(async (user) => {
    if (!user) {
      errors.push({
        message: "Email is Not Registered",
      });
      res.render("signup.ejs", { errors });
    } else {
      const salt = user[0].salt;
      const current_password = await bcrypt.hash(req.body.password, salt);
      if (user[0].password === current_password) {
        res.render("index.ejs", { name: user[0].name });
      } else {
        errors.push({
          message: "Password is Incorrect",
        });
        res.render("login.ejs", { errors });
      }
    }
  });
});

// Configuring the register post functionality
app.post("/register", async (req, res) => {
  let errors = [];
  if (!req.body.name || !req.body.email || !req.body.password) {
    errors.push({
      message: "Please fill all the fields",
    });
  }
  if (req.body.password.length < 6) {
    errors.push({
      message: "Password must be of length atleast 6",
    });
  }
  if (errors.length > 0) {
    res.render("signup.ejs", { errors });
  } else {
    User.find({ email: req.body.email }).then(async (user) => {
      if (user) {
        errors.push({
          message: "Email is already registered",
        });
        res.render("signup.ejs", { errors });
      } else {
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
      }
    });
  }
});

// Routes
app.get("/", (req, res) => {
  if (req.user) res.render("index.ejs", { name: req.user.name });
  else res.render("signup.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("signup.ejs");
});

app.post("/logout", (req, res) => {
  res.render("login.ejs");
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
