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
  validation: {
    type: Boolean,
    default: false,
  },
  visible: {
    type: Boolean,
    default: true,
  },
  // Modération par un admin : l'avis reste en base (pour que son auteur
  // sache pourquoi il a disparu) mais n'apparaît plus nulle part
  // publiquement.
  deletedByAdmin: {
    type: Boolean,
    default: false,
  },
  deletionReason: {
    type: String,
    trim: true,
    default: "",
  },
});

module.exports = mongoose.model("Review", reviewSchema);
