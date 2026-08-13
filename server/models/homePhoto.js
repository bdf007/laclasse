const mongoose = require("mongoose");

const homePhotoSchema = new mongoose.Schema({
  pcloudFileId: { type: Number, required: true },
  visible: { type: Boolean, default: true },
  aspectRatio: { type: Number, default: 1 },
  order: { type: Number, default: 0 },
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("HomePhoto", homePhotoSchema);
