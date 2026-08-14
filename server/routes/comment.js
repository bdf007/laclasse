const express = require("express");
const router = express.Router();

// import controllers
const {
  getComment,
  getCommentByClasses,
  getCommentCountForClass,
  postComment,
  getCommentById,
  updateCommentById,
  reportCommentById,
  clearReportsById,
  permanentlyDeleteCommentById,
  deleteCommentById,
} = require("../controllers/comment");

// import middlewares
const { authMiddleware, adminAuthMiddleware } = require("../middlewares/auth");

// api routes
// get comment page (protégé : le contrôleur a besoin de req.user pour
// savoir quels messages modérés afficher)
router.get("/comment", authMiddleware, getComment);

// get comment by classes
router.get("/comment/:classes", authMiddleware, getCommentByClasses);

// compte exact des messages liés à une classe (hors messages diffusés)
router.get("/comment/count/:classes", authMiddleware, getCommentCountForClass);

// post comment page
router.post("/comment", authMiddleware, postComment);

// get specific comment by id
router.get("/comment/:id", getCommentById);

// update specific comment by id
router.put("/comment/update/:id", updateCommentById);

// report specific comment by id (protégé : le contrôleur a besoin de
// req.user pour savoir qui signale)
router.post("/comment/:id/report", authMiddleware, reportCommentById);

// clear reports on a comment -- réservé aux admins, motif jugé non fondé
router.put("/comment/:id/clear-reports", adminAuthMiddleware, clearReportsById);

//  delete specific comment by id (protégé : le contrôleur a besoin de
// req.user pour savoir si c'est l'auteur qui supprime ou un admin qui modère)
router.delete("/comment/:id", authMiddleware, deleteCommentById);

// suppression réelle et définitive -- admin uniquement, typiquement sur un
// message déjà modéré
router.delete(
  "/comment/:id/permanent",
  adminAuthMiddleware,
  permanentlyDeleteCommentById,
);

module.exports = router;
