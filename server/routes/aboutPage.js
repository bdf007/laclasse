const express = require("express");
const router = express.Router();

const {
  getAboutPage,
  updateAboutPage,
  updateAboutPhoto,
  getAboutPhotoImage,
} = require("../controllers/aboutPage");
const { adminAuthMiddleware } = require("../middlewares/auth");

router.get("/about", getAboutPage);
router.get("/about/photo", getAboutPhotoImage);
router.put("/admin/about", adminAuthMiddleware, updateAboutPage);
router.put("/admin/about/photo", adminAuthMiddleware, updateAboutPhoto);

module.exports = router;
