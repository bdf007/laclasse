const express = require("express");
const multer = require("multer");

const router = express.Router();
const ctrl = require("../controllers/courseFile");
const { authMiddleware, adminAuthMiddleware } = require("../middlewares/auth");

// Le fichier reste en mémoire (req.file.buffer), jamais écrit sur le
// disque du serveur — parti directement vers pCloud depuis le contrôleur.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Seuls les fichiers PDF sont acceptés"));
    }
    cb(null, true);
  },
});

router.post(
  "/admin/classes/:classId/courseFiles",
  adminAuthMiddleware,
  upload.single("courseFile"),
  ctrl.uploadCourseFile,
);

router.get(
  "/courseFilesByClass/:classId",
  authMiddleware,
  ctrl.getCourseFilesByClass,
);
router.get(
  "/courseFiles/:fileId/download",
  authMiddleware,
  ctrl.downloadCourseFile,
);
router.delete(
  "/admin/courseFiles/:fileId",
  adminAuthMiddleware,
  ctrl.deleteCourseFile,
);

module.exports = router;
