const express = require("express");
const router = express.Router();

// import controllers
const {
  createPhoto,
  getPhotos,
  assignPositionToPhoto,
  deletePhotoById,
} = require("../controllers/photo");

// api routes
router.post("/photo", createPhoto);
router.get("/photos", getPhotos);
router.put("/photo/:id", assignPositionToPhoto);
router.delete("/photo/:id", deletePhotoById);

module.exports = router;
