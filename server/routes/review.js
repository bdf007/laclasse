const express = require("express");
const router = express.Router();

// import controllers
const {
  getReview,
  getReviewVisibleAndValidated,
  getReviewByEmail,
  postReview,
  getReviewById,
  updateReviewById,
  validateReviewById,
  modifyVisbilityById,
  moderateReviewById,
  deleteReviewById,
} = require("../controllers/review");

// import middlewares
const { adminAuthMiddleware } = require("../middlewares/auth");

// api routes
// get review page
router.get("/review", getReview);

// get review page with visible and validated reviews
router.get("/review/visible", getReviewVisibleAndValidated);

// get review by email of the user
router.get("/review/email/:email", getReviewByEmail);

// post review page
router.post("/review", postReview);

// get specific review by id
router.get("/review/:id", getReviewById);

// update specific review by id
router.put("/review/update/:id", updateReviewById);

// validation specific review by id
router.put("/review/validation/:id", validateReviewById);

// modify visibility of specific review by id
router.put("/review/visibility/:id", modifyVisbilityById);

// modération admin (au lieu d'une suppression réelle) -- garde une trace
// visible pour l'auteur, avec un motif.
router.put("/review/:id/moderate", adminAuthMiddleware, moderateReviewById);

// delete specific review by id (auto-suppression, pas d'auth requise --
// utilisée aussi par des visiteurs non connectés)
router.delete("/review/:id", deleteReviewById);

module.exports = router;
