const express = require("express");
const { json, urlencoded } = express;
const app = express();
const connection = require("./config/db");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");

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
// get the home photo routes for connection
const homePhotoRoutes = require("./routes/homePhoto");
// get the about page routes for connection
const aboutPageRoutes = require("./routes/aboutPage");

// middleware
app.use(json({ limit: "10mb" }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL.split(",") ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.use(urlencoded({ limit: "10mb", extended: false }));
app.use(cookieParser());

// Correctif léger pour GHSA-wgrm-67xf-hhpq (pdfjs-dist / @react-pdf-viewer/core,
// projet archivé, plus de correctif à venir) : bloque spécifiquement eval()/
// new Function(), le seul vecteur d'exploitation de cette faille, sans
// restreindre le reste (scripts externes, workers, styles).
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' 'unsafe-inline' https:; " +
      "worker-src 'self' https:; " +
      "style-src 'self' 'unsafe-inline' https:; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https: blob:;",
  );
  next();
});

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
// use the home photo routes for connection
app.use("/api/", homePhotoRoutes);
// use the about page routes for connection
app.use("/api/", aboutPageRoutes);

// Serve the React app
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
});

// Port
const port = process.env.PORT || 8000;

// Le serveur n'accepte des requêtes qu'une fois la connexion MongoDB
// réellement établie -- évite les requêtes prises en course avant que
// la base soit prête (timeout de buffering Mongoose).
connection()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Impossible de démarrer le serveur :", err.message);
    process.exit(1);
  });
