const Wine = require("../models/wine");
const mongoose = require("mongoose");
const {
  uploadBase64Image,
  getFileStream,
  deleteFile,
} = require("../services/pcloud");

const PCLOUD_SUBFOLDER = "vinotheque";

exports.createWine = async (req, res) => {
  try {
    const wineData = { ...req.body };

    if (wineData.pictureData) {
      const fileid = await uploadBase64Image(
        wineData.pictureData,
        `wine-${Date.now()}.webp`,
        PCLOUD_SUBFOLDER,
      );
      wineData.pcloudFileId = fileid;
    }
    delete wineData.pictureData;

    const newWine = new Wine(wineData);
    await newWine.save();

    res.status(200).json({
      message: "Wine created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getWines = async (req, res) => {
  try {
    const wines = await Wine.find({}).select("-pictureData");
    res.status(200).json(wines);
  } catch (error) {
    console.log(error);
  }
};

exports.getWinesWithoutImageData = async (req, res) => {
  try {
    // Corrigé : le champ s'appelle pictureData, pas imageData (qui n'existe
    // pas sur ce modèle) — cette route ne retirait donc jamais rien avant.
    const wines = await Wine.find({}).select("-pictureData");
    res.status(200).json(wines);
  } catch (error) {
    console.log(error);
  }
};

exports.getWineById = async (req, res) => {
  try {
    const id = req.params.id;
    const wine = await Wine.findById(id).select("-pictureData");
    if (!wine) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }
    res.status(200).json(wine);
  } catch (error) {
    console.log(error);
  }
};

exports.deleteWineById = async (req, res) => {
  try {
    const id = req.params.id;
    const wineToDelete = await Wine.findById(id);
    if (!wineToDelete) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }

    if (wineToDelete.pcloudFileId) {
      await deleteFile(wineToDelete.pcloudFileId);
    }

    await Wine.findByIdAndDelete(id);
    res.json({ message: "Wine deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.updateWineById = async (req, res) => {
  try {
    const id = req.params.id;
    const wineToUpdate = await Wine.findById(id);
    if (!wineToUpdate) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }

    const updateData = { ...req.body };

    if (updateData.pictureData) {
      const fileid = await uploadBase64Image(
        updateData.pictureData,
        `wine-${Date.now()}.webp`,
        PCLOUD_SUBFOLDER,
      );
      if (wineToUpdate.pcloudFileId) {
        await deleteFile(wineToUpdate.pcloudFileId);
      }
      updateData.pcloudFileId = fileid;
    }
    delete updateData.pictureData;

    const updatedWine = await Wine.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-pictureData");
    res.status(200).json({
      message: "Wine updated successfully",
      updatedWine: updatedWine,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

/**
 * Route-relais pour l'image d'un vin. URL stable pour le frontend,
 * redemande un lien pCloud frais à chaque appel. Fallback sur l'ancien
 * Base64 pour les entrées pas encore migrées.
 */
exports.getWineImage = async (req, res) => {
  try {
    const wine = await Wine.findById(req.params.id).select(
      "pcloudFileId pictureData",
    );
    if (!wine) return res.status(404).end();

    if (wine.pcloudFileId) {
      const { contentType, stream } = await getFileStream(wine.pcloudFileId);
      res.set("Content-Type", contentType);
      res.set("Cache-Control", "no-store");
      return stream.pipe(res);
    }

    if (wine.pictureData) {
      const matches = wine.pictureData.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        res.set("Content-Type", matches[1]);
        return res.send(Buffer.from(matches[2], "base64"));
      }
    }

    return res.status(404).end();
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};
