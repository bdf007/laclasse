const Comment = require("../models/comments");
const mongoose = require("mongoose");
const User = require("../models/userlogin");

exports.getComment = async (req, res) => {
  try {
    const comments = await Comment.find({});
    // Extract user IDs from the comments
    const userIds = comments.map((comment) => comment.user);

    // Fetch user roles based on the user IDs
    const users = await User.find({ _id: { $in: userIds } });

    // Create a mapping of user IDs to their roles
    const userRoles = users.reduce((role, user) => {
      role[user._id] = user.role;
      return role;
    }, {});

    // Merge user roles into comments
    const commentsWithRoles = comments.map((comment) => ({
      ...comment.toObject(), // Convert Mongoose document to a plain JavaScript object
      userRole: userRoles[comment.user], // Add the user's role to the comment
    }));

    res.json(commentsWithRoles);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.getCommentByClasses = async (req, res) => {
  try {
    const classes = req.params.classes;
    const comments = await Comment.find({ classes: classes });

    // Extract user IDs from the comments
    const userIds = comments.map((comment) => comment.user);

    // Fetch user roles based on the user IDs
    const users = await User.find({ _id: { $in: userIds } });

    // Create a mapping of user IDs to their roles
    const userRoles = users.reduce((role, user) => {
      role[user._id] = user.role;
      return role;
    }, {});

    // Merge user roles into comments
    const commentsWithRoles = comments.map((comment) => ({
      ...comment.toObject(), // Convert Mongoose document to a plain JavaScript object
      userRole: userRoles[comment.user], // Add the user's role to the comment
    }));

    res.json(commentsWithRoles);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.postComment = async (req, res) => {
  try {
    const comment = new Comment(req.body);
    await comment.save();
    await res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.getCommentById = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the provided id is a valid ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Invalid ID format",
      });
    }
    // Check if the comment id exists
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.updateCommentById = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the provided id is a valid ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Invalid ID format",
      });
    }
    // Check if the comment id exists
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }
    // if comment Id exists, update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.deleteCommentById = async (req, res) => {
  try {
    const id = req.params.id;
    // Check if the comment id exists
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }
    // if comment id exists, delete the comment
    const deletedComment = await Comment.findByIdAndRemove(id);
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
