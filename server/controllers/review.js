const Review = require("../models/review");
const mongoose = require("mongoose");

exports.getReview = async (req, res) => {
  try {
    const review = await Review.find({});
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.getReviewVisibleAndValidated = async (req, res) => {
  try {
    const review = await Review.find({ visible: true, validate: true });
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.postReview = async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    await res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the provided id is a valid ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Invalid ID format",
      });
    }
    // Check if the reviewId exists
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.updateReviewById = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the provided id is a valid ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Invalid ID format",
      });
    }

    // Check if the reviewId exists
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }

    // Update the review
    await Review.findByIdAndUpdate(id, req.body, { new: true });
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.validateReviewById = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the provided id is a valid ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Invalid ID format",
      });
    }

    // Check if the reviewId exists
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }

    // Update the validation
    await Review.findByIdAndUpdate(
      id,
      { validate: req.body.validate },
      { new: true }
    );
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.modifyVisbilityById = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the provided id is a valid ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Invalid ID format",
      });
    }

    // Check if the reviewId exists
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }

    // Update the visibility
    await Review.findByIdAndUpdate(
      id,
      { visible: req.body.visible },
      { new: true }
    );
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.deleteReviewById = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the provided id is a valid ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Invalid ID format",
      });
    }

    // Check if the reviewId exists
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }

    // Delete the review
    await Review.findByIdAndDelete(id);
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
