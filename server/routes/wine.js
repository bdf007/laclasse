const express = require("express");
const router = express.Router();

// import controllers
const {
  createWine,
  getWines,
  getWinesWithoutImageData,
  getWineById,
  deleteWineById,
  updateWineById,
  getWineImage,
} = require("../controllers/wine");

// api routes
router.post("/wine", createWine);
router.get("/wines", getWines);
router.get("/wines/noimage", getWinesWithoutImageData);
router.get("/wine/:id", getWineById);
router.delete("/wine/:id", deleteWineById);
router.put("/wine/:id", updateWineById);

// GET route for the image proxy (public, no auth needed)
router.get("/wine/image/:id", getWineImage);

module.exports = router;
