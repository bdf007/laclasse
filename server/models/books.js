const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    author: {
      type: String,
      trim: true,
    },
    genre: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageData: {
      type: String,
      trim: true,
    },
    salt: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
