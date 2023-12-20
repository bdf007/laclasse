const Photo = require("../models/photo");
const mongoose = require("mongoose");

exports.createPhoto = async (req, res) => {
  const newPhoto = new Photo(req.body);
  await newPhoto.save();

  res.status(200).json({
    message: "Photo created successfully",
  });
};

exports.getPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({});
    res.status(200).json(photos);
  } catch (error) {
    console.log(error);
  }
};

exports.assignPositionToPhoto = async (req, res) => {
  try {
    const id = req.params.id;
    const photoToUpdate = await Photo.findById(id);
    if (!photoToUpdate) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }
    // if the photo exists, update it
    const updatedPhoto = await Photo.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({
      message: "Photo updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.deletePhotoById = async (req, res) => {
  try {
    const id = req.params.id;
    const photoToDelete = await Photo.findById(id);
    if (!photoToDelete) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }
    const deletedPhoto = await Photo.findByIdAndRemove(id);
    res.json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
