const mongoose = require("mongoose");

const courseFileSchema = new mongoose.Schema({
  courseFileTitle: { type: String, required: true },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  pcloudFileId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CourseFile", courseFileSchema);
