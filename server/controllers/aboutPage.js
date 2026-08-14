const AboutPage = require("../models/aboutPage");
const {
  uploadBase64Image,
  getFileStream,
  deleteFile,
} = require("../services/pcloud");

const PCLOUD_SUBFOLDER = "photo-a-propos";

// Public -- il n'y a qu'un seul document, on le récupère (ou on renvoie
// des chaînes vides si rien n'a encore été écrit).
exports.getAboutPage = async (req, res) => {
  try {
    const about = await AboutPage.findOne({});
    res.json(about || { title: "", aboutFr: "", aboutEn: "" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
};

// Admin -- upsert : crée le document unique s'il n'existe pas encore,
// le met à jour sinon.
exports.updateAboutPage = async (req, res) => {
  try {
    const { title, aboutFr, aboutEn } = req.body;
    const about = await AboutPage.findOneAndUpdate(
      {},
      { title, aboutFr, aboutEn, updatedAt: Date.now() },
      { new: true, upsert: true },
    );
    res.json(about);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
};

exports.updateAboutPhoto = async (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: "Aucune image reçue" });
    }

    const existing = await AboutPage.findOne({});

    const newPcloudFileId = await uploadBase64Image(
      imageData,
      `about-${Date.now()}.webp`,
      PCLOUD_SUBFOLDER,
    );

    if (existing && existing.pcloudFileId) {
      await deleteFile(existing.pcloudFileId);
    }

    const about = await AboutPage.findOneAndUpdate(
      {},
      { pcloudFileId: newPcloudFileId, updatedAt: Date.now() },
      { new: true, upsert: true },
    );
    res.json(about);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la photo" });
  }
};

// Route-relais publique, comme pour les autres images du site.
exports.getAboutPhotoImage = async (req, res) => {
  try {
    const about = await AboutPage.findOne({});
    if (!about || !about.pcloudFileId) return res.status(404).end();

    const { contentType, stream } = await getFileStream(about.pcloudFileId);
    res.set("Content-Type", contentType);
    res.set("Cache-Control", "no-store");
    stream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};
