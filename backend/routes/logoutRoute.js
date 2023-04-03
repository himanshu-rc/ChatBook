const express = require("express");
const router = new express.Router();
router.post("/logout", (req, res) => {
  res.render("login.ejs");
});
module.exports = router;
