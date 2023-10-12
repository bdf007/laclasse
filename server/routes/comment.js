const express = require("express");
const router = express.Router();

// import controllers
const {
  getComment,
  getCommentByClasses,
  postComment,
  getCommentById,
  updateCommentById,
  deleteCommentById,
} = require("../controllers/comment");

// import middlewares

// api routes
// get comment page
router.get("/comment", getComment);

// get comment by classes
router.get("/comment/:classes", getCommentByClasses);

// post comment page
router.post("/comment", postComment);

// get specific comment by id
router.get("/comment/:id", getCommentById);

// update specific comment by id
router.put("/comment/update/:id", updateCommentById);

//  delete specific comment by id
router.delete("/comment/:id", deleteCommentById);

module.exports = router;
