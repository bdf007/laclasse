const HomePhoto = require("../models/homePhoto");
const {
  uploadBase64Image,
  getFileStream,
  deleteFile,
} = require("../services/pcloud");

const PCLOUD_SUBFOLDER = "photos-accueil";

// Liste publique -- seulement les photos visibles
exports.getHomePhotos = async (req, res) => {
  try {
    const photos = await HomePhoto.find({ visible: true }).sort({
      order: 1,
      uploadDate: 1,
    });
    res.json(photos);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des photos" });
  }
};

// Liste admin -- toutes les photos, visibles ou masquées
exports.getAllHomePhotosAdmin = async (req, res) => {
  try {
    const photos = await HomePhoto.find({}).sort({ order: 1, uploadDate: 1 });
    res.json(photos);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des photos" });
  }
};

exports.createHomePhoto = async (req, res) => {
  try {
    const { imageData, aspectRatio } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: "Aucune image reçue" });
    }

    const pcloudFileId = await uploadBase64Image(
      imageData,
      `home-${Date.now()}.webp`,
      PCLOUD_SUBFOLDER,
    );

    const photo = await HomePhoto.create({
      pcloudFileId,
      aspectRatio: aspectRatio || 1,
    });
    res.status(201).json(photo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'ajout de la photo" });
  }
};

exports.updateHomePhotoVisibility = async (req, res) => {
  try {
    const { visible } = req.body;
    const photo = await HomePhoto.findByIdAndUpdate(
      req.params.id,
      { visible },
      { new: true },
    );
    if (!photo) {
      return res.status(404).json({ error: "Photo introuvable" });
    }
    res.json(photo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
};

exports.moveHomePhoto = async (req, res) => {
  try {
    const { direction } = req.body; // "up" | "down"
    const photos = await HomePhoto.find({}).sort({ order: 1, uploadDate: 1 });

    const index = photos.findIndex((p) => p._id.toString() === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Photo introuvable" });
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= photos.length) {
      return res.status(400).json({ error: "Déplacement impossible" });
    }

    // Renumérote toutes les photos selon leur ordre d'affichage actuel,
    // puis échange les deux positions concernées -- garantit des valeurs
    // uniques même pour des photos créées avant l'ajout de ce champ
    // (order valait 0 pour toutes, un simple échange n'aurait rien fait).
    photos.forEach((p, i) => {
      p.order = i;
    });
    const tmp = photos[index].order;
    photos[index].order = photos[swapIndex].order;
    photos[swapIndex].order = tmp;

    await Promise.all(photos.map((p) => p.save()));

    res.json({ message: "Ordre mis à jour" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors du déplacement" });
  }
};

exports.deleteHomePhoto = async (req, res) => {
  try {
    const photo = await HomePhoto.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ error: "Photo introuvable" });
    }

    await deleteFile(photo.pcloudFileId);
    await HomePhoto.findByIdAndDelete(req.params.id);
    res.json({ message: "Photo supprimée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};

// Route-relais publique, comme pour les livres/vins/photos de profil
exports.getHomePhotoImage = async (req, res) => {
  try {
    const photo = await HomePhoto.findById(req.params.id);
    if (!photo) return res.status(404).end();

    const { contentType, stream } = await getFileStream(photo.pcloudFileId);
    res.set("Content-Type", contentType);
    res.set("Cache-Control", "no-store");
    stream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};
