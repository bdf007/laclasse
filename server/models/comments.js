const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    classes: {
      type: String,
      trim: true,
    },
    Date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
