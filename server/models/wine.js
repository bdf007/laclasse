const mongoose = require("mongoose");

const wineSchema = new mongoose.Schema({
  nomDuChateau: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  Year: {
    type: Number,
    trim: true,
  },
  Region: {
    type: String,
    trim: true,
    lowercase: true,
  },
  Country: {
    type: String,
    trim: true,
    lowercase: true,
  },
  typeDeVin: {
    type: String,
    trim: true,
    lowercase: true,
  },
  whereIFindIt: {
    type: String,
    trim: true,
    lowercase: true,
  },
  price: {
    type: Number,
    trim: true,
  },
  pictureData: {
    type: String,
    trim: true,
  },
  quantity: {
    type: Number,
    trim: true,
  },
  literage: {
    type: String,
    enum: [
      "Picola - 0.20 l",
      "Chopine ou quart - 0.25 l",
      "Fillette - 0.375 l",
      "Medium - 0.5 l",
      "Bouteille - 0.75 l",
      "Magnum - 1.5 l",
      "Jeroboam - 3 l",
      "Rehoboam - 4.5 l",
      "Mathusalem 6 l",
      "Salmanazar - 9 l",
      "Balthazar - 12 l",
      "Nabuchodonosor - 15 l",
      "Melchior ou Salomon - 18 l",
      "Souverain - 26,25 l",
      "Primat - 27 l",
      "Midas ou Melchizedek - 30 l",
    ],
    default: "Bouteille - 0.75 l",
  },
  comments: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Wine", wineSchema);
