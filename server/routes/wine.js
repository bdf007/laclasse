const express = require("express");
const router = express.Router();

// import controllers
const {
  createWine,
  getWines,
  getWineById,
  deleteWineById,
  updateWineById,
} = require("../controllers/wine");

// api routes
router.post("/wine", createWine);
router.get("/wines", getWines);
router.get("/wine/:id", getWineById);
router.delete("/wine/:id", deleteWineById);
router.put("/wine/:id", updateWineById);

module.exports = router;
