const express = require("express");
const bcrypt = require("bcrypt");
require("../config/db");
const User = require("../model/userModel");
const router = new express.Router();
router.post("/register", async (req, res) => {
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
    Userer.find({ email: req.body.email }).then(async (user) => {
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
router.get("/register", (req, res) => {
  res.render("signup.ejs");
});
module.exports = router;
