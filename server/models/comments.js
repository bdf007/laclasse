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
    // "" = visible par toutes les classes (message diffusé par un admin
    // sans choisir de classe précise).
    classes: {
      type: String,
      trim: true,
      default: "",
    },
    // Suppression "douce" par un admin : le message reste en base, mais
    // n'est plus lisible par les autres élèves -- seul son auteur (et les
    // admins) peut encore voir le motif.
    deletedByAdmin: {
      type: Boolean,
      default: false,
    },
    deletionReason: {
      type: String,
      trim: true,
      default: "",
    },
    // Signalements par des élèves -- un tableau pour permettre plusieurs
    // signalements du même message.
    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        firstname: { type: String, trim: true },
        lastname: { type: String, trim: true },
        date: { type: Date, default: Date.now },
      },
    ],
    Date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Comment", commentSchema);
