const express = require("express");
const router = express.Router();

// import controllers
const {
  createWine,
  getWines,
  deleteWineById,
  updateWineById,
} = require("../controllers/wine");

// api routes
router.post("/wine", createWine);
router.get("/wines", getWines);
router.delete("/wine/:id", deleteWineById);
router.put("/wine/:id", updateWineById);

module.exports = router;
