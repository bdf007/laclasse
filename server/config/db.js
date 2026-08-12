const mongoose = require("mongoose");
require("dotenv").config();

module.exports = async function connection() {
  try {
    const connectionParams = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    if (!process.env.MONGO_URI) {
      throw new Error("MongoDB URI not configured");
    }

    await mongoose.connect(process.env.MONGO_URI, connectionParams);
    console.log("Connected to database"); // Version optimisée
  } catch (error) {
    console.error("Could not connect to database:", error.message);
    throw error; // Rejette l'erreur pour une gestion externe
  }
};
