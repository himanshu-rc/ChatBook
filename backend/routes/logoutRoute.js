const express = require("express");
const router = new express.Router();
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/login");
});
module.exports = router;
