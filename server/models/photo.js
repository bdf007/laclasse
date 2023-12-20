const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  imageData: {
    type: String,
    trim: true,
  },
  position: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model("Photo", photoSchema);
