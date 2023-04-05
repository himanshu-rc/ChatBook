const express = require("express");
const authenticated = require("../middleware/authenticateUser");
const router = new express.Router();
router.get("/", authenticated, (req, res) => {
  res.render("index.ejs");
});
module.exports = router;
