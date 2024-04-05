const Review = require("../models/review");
const mongoose = require("mongoose");

exports.getReview = async (req, res) => {
  try {
    const reviews = await Review.find({});
    // Calculate average stars from all reviews validated
    const reviewsValidated = reviews.filter(
      (review) => review.validation === true
    );
    const average =
      reviewsValidated.reduce((acc, review) => acc + review.star, 0) /
      reviewsValidated.length;

    // Create an object with reviews and averageStars
    const responseData = {
      reviews: reviews,
      averageStars: average,
    };

    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

//  get review by email of the user
exports.getReviewByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const review = await Review.find({ email: email });
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
    const review = await Review.find({ visible: true, validation: true });
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
    // check if the email is already used
    const email = req.body.email;
    const reviewByEmail = await Review.find({ email: email });
    if (reviewByEmail.length > 0) {
      return res.status(400).json({
        error: "Email already used",
      });
    }
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
      { validation: req.body.validation },
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
