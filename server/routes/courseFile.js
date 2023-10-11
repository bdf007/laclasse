const express = require("express");
const router = express.Router();

// import controllers
const {
  createCourseFile,
  getAllCourseFiles,
  getCourseFileById,
  getAllCourseFilesByClassId,
  updateCourseFile,
  deleteCourseFile,
} = require("../controllers/courseFile");

// api routes
router.post("/courseFile", createCourseFile);
router.get("/courseFiles", getAllCourseFiles);
router.get("/courseFilesByClass/:id", getAllCourseFilesByClassId);
router.get("/courseFile/:id", getCourseFileById);
router.put("/courseFile/:id", updateCourseFile);
router.delete("/courseFile/:id", deleteCourseFile);

module.exports = router;
