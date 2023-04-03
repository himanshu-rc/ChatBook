const express = require("express");
const bcrypt = require("bcrypt");
require("../config/db");
const User = require("../model/userModel");
const router = new express.Router();
router.get("/login", (req, res) => {
  res.render("login.ejs");
});

router.post("/login", async (req, res) => {
  let errors = [];
  User.find({ email: req.body.email })
    .then(async (user) => {
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
    })
    .catch((e) => {
      res.send(e);
    });
});
module.exports = router;
