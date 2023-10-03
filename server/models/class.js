const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  about: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model("Class", classSchema);
