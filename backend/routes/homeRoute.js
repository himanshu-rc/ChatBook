const express = require("express");
const router = new express.Router();
router.get("/", (req, res) => {
  if (req.user) res.render("index.ejs", { name: req.user.name });
  else res.render("signup.ejs");
});
module.exports = router;
