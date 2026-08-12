const CourseFile = require("../models/courseFile");
const Class = require("../models/class");
const {
  uploadBuffer,
  getFileStream,
  deleteFile,
} = require("../services/pcloud");

const PCLOUD_SUBFOLDER = "cours-pdf";

exports.uploadCourseFile = async (req, res) => {
  const { classId } = req.params;
  const { courseFileTitle } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier reçu" });
  }
  if (!courseFileTitle) {
    return res.status(400).json({ error: "Le titre du fichier est requis" });
  }

  try {
    const filename = `${Date.now()}-${req.file.originalname}`;
    const pcloudFileId = await uploadBuffer(
      req.file.buffer,
      filename,
      PCLOUD_SUBFOLDER,
    );

    const created = await CourseFile.create({
      courseFileTitle,
      classId,
      pcloudFileId,
    });
    res.status(201).json(created);
  } catch (err) {
    console.error("Erreur upload fichier de cours :", err);
    res.status(500).json({ error: "Échec de l'enregistrement du fichier" });
  }
};

exports.getCourseFilesByClass = async (req, res) => {
  try {
    const files = await CourseFile.find({ classId: req.params.classId }).select(
      "_id courseFileTitle classId createdAt",
    );
    res.json(files);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des fichiers" });
  }
};

exports.downloadCourseFile = async (req, res) => {
  try {
    const file = await CourseFile.findById(req.params.fileId);
    if (!file) return res.status(404).json({ error: "Fichier introuvable" });

    const user = req.user;
    const isAdmin = user.role === "admin" || user.role === "superadmin";
    const targetClass = await Class.findById(file.classId);
    const isPublicClass = targetClass?.name === "public";
    const belongsToClass = String(user.classes) === String(file.classId);

    if (!isAdmin && !isPublicClass && !belongsToClass) {
      return res.status(403).json({ error: "Accès non autorisé à ce fichier" });
    }

    const { contentType, stream } = await getFileStream(file.pcloudFileId);
    res.set("Content-Type", contentType || "application/pdf");
    res.set(
      "Content-Disposition",
      `attachment; filename="${file.courseFileTitle}.pdf"`,
    );
    res.set("Cache-Control", "no-store");
    stream.pipe(res);
  } catch (err) {
    console.error("Erreur téléchargement fichier de cours :", err);
    res.status(500).json({ error: "Erreur lors du téléchargement" });
  }
};

exports.deleteCourseFile = async (req, res) => {
  try {
    const file = await CourseFile.findById(req.params.fileId);
    if (!file) return res.status(404).json({ error: "Fichier introuvable" });

    await deleteFile(file.pcloudFileId);
    await CourseFile.findByIdAndDelete(req.params.fileId);
    res.json({ message: "Fichier supprimé" });
  } catch (err) {
    console.error("Erreur suppression fichier de cours :", err);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};
