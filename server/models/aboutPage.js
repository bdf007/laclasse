const mongoose = require("mongoose");

const aboutPageSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  aboutFr: { type: String, default: "" },
  aboutEn: { type: String, default: "" },
  pcloudFileId: { type: Number, default: null },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AboutPage", aboutPageSchema);
