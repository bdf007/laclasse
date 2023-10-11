const mongoose = require("mongoose");

const courseFileSchema = new mongoose.Schema({
  courseFileTitle: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  courseFileData: {
    type: String,
    required: true,
    trim: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
});

module.exports = mongoose.model("CourseFile", courseFileSchema);
