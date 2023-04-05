const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("../config/db");
const User = require("../model/userModel");
const router = new express.Router();
router.get("/login", (req, res) => {
  res.render("login.ejs");
});
const maxAge = 3 * 24 * 60 * 60;
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: maxAge,
  });
};
router.post("/login", async (req, res) => {
  let errors = [];
  User.findOne({ email: req.body.email })
    .then(async (user) => {
      if (!user) {
        errors.push({
          message: "Email is Not Registered",
        });
        res.render("signup.ejs", { errors });
      } else {
        if (bcrypt.compare(req.body.password, user.password)) {
          const token = generateToken(user._id);
          res.cookie("jwt", token, {
            maxAge: maxAge * 1000,
          });
          res.redirect("/");
        } else {
          errors.push({
            message: "Password is Incorrect",
          });
          res.render("login.ejs", { errors });
        }
      }
    })
    .catch((e) => {
      console.log(e);
      res.send(e);
    });
});
module.exports = router;
