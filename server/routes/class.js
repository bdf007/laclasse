const express = require("express");
const router = express.Router();

// import controllers
const {
  createClass,
  getClasses,
  deleteClassById,
  updateClassById,
  classById,
} = require("../controllers/class");
// api routes
router.post("/class", createClass);
router.get("/classes", getClasses);
router.delete("/class/:id", deleteClassById);
router.put("/class/:id", updateClassById);
router.get("/class/:id", classById);

module.exports = router;
