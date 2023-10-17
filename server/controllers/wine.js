const Wine = require("../models/wine");
const mongoose = require("mongoose");

exports.createWine = async (req, res) => {
  const newWine = new Wine(req.body);
  await newWine.save();

  res.status(200).json({
    message: "Wine created successfully",
  });
};

exports.getWines = async (req, res) => {
  try {
    const wines = await Wine.find({});
    res.status(200).json(wines);
  } catch (error) {
    console.log(error);
  }
};

exports.getWineById = async (req, res) => {
  try {
    const id = req.params.id;
    const wine = await Wine.findById(id);
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
    const deletedWine = await Wine.findByIdAndRemove(id);
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
    // if the wine exists, update it
    const updatedWine = await Wine.findByIdAndUpdate(id, req.body, {
      new: true,
    });
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
