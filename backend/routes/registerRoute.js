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
    User.find({ email: req.body.email }).then(async (user) => {
      if (user.length == 0) {
        let user = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        });
        user.generateAuthToken();
        user
          .save()
          .then(() => {
            res.redirect("/login");
          })
          .catch((e) => {
            res.render("signup.ejs");
          });
      } else {
        errors.push({
          message: "Email is already registered",
        });
        res.render("signup.ejs", { errors });
      }
    });
  }
});
router.get("/register", (req, res) => {
  res.render("signup.ejs");
});
module.exports = router;
