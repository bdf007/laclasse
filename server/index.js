const express = require("express");
const { json, urlencoded } = express;
const app = express();
const connection = require("./config/db");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");

// get the user routes for connection
const userRoutes = require("./routes/userlogin");
// get the class routes for connection
const classRoutes = require("./routes/class");
// get the book routes for connection
const bookRoutes = require("./routes/book");
// get the contact routes for connection
const contactRoutes = require("./routes/contact");
// get the course file routes for connection
const courseFileRoutes = require("./routes/courseFile");
// get the comment routes for connection
const commentRoutes = require("./routes/comment");
// get the wine routes for connection
const wineRoutes = require("./routes/wine");
// get the review routes for connection
const reviewRoutes = require("./routes/review");

// middleware
app.use(json({ limit: "10mb" }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL.split(",") ?? "http://localhost:3000",
    credentials: true,
  })
);
app.use(urlencoded({ limit: "10mb", extended: false }));
app.use(cookieParser());
app.use(expressValidator());

//db connection
connection();

app.use(express.static(path.join(__dirname, "..", "client", "build")));

// routes
// use the user routes for connection
app.use("/api/", userRoutes);
// use the class routes for connection
app.use("/api/", classRoutes);
// use the book routes for connection
app.use("/api/", bookRoutes);
// use the contact routes for connection
app.use("/api/", contactRoutes);
// use the course file routes for connection
app.use("/api/", courseFileRoutes);
// use the comment routes for connection
app.use("/api/", commentRoutes);
// use the wine routes for connection
app.use("/api/", wineRoutes);
// use the review routes for connection
app.use("/api/", reviewRoutes);

// Serve the React app
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
});

// Port
const port = process.env.PORT || 8000;

// listen to port
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
