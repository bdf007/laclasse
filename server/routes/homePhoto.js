const express = require("express");
const router = express.Router();

const {
  getHomePhotos,
  getAllHomePhotosAdmin,
  createHomePhoto,
  updateHomePhotoVisibility,
  moveHomePhoto,
  deleteHomePhoto,
  getHomePhotoImage,
} = require("../controllers/homePhoto");
const { adminAuthMiddleware } = require("../middlewares/auth");

router.get("/home-photos", getHomePhotos);
router.get("/home-photos/image/:id", getHomePhotoImage);
router.get("/admin/home-photos", adminAuthMiddleware, getAllHomePhotosAdmin);
router.post("/admin/home-photos", adminAuthMiddleware, createHomePhoto);
router.put(
  "/admin/home-photos/:id/visibility",
  adminAuthMiddleware,
  updateHomePhotoVisibility,
);
router.put("/admin/home-photos/:id/move", adminAuthMiddleware, moveHomePhoto);
router.delete("/admin/home-photos/:id", adminAuthMiddleware, deleteHomePhoto);

module.exports = router;
