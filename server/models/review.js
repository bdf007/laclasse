const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  classes: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  star: {
    type: Number,
    required: true,
  },
  validate: {
    type: Boolean,
    default: false,
  },
  visible: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
