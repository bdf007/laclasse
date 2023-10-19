const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  about: {
    type: String,
    trim: true,
  },
  nextCourse: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model("Class", classSchema);
