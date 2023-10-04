const Class = require("../models/class");
const mongoose = require("mongoose");

exports.createClass = async (req, res) => {
  const newClass = new Class(req.body);
  await newClass.save();

  res.status(200).json({
    message: "Class created successfully",
  });
};

exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find({});
    res.status(200).json(classes);
  } catch (error) {
    console.log(error);
  }
};

exports.deleteClassById = async (req, res) => {
  try {
    const id = req.params.id;
    const classToDelete = await Class.findById(id);
    if (!classToDelete) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }
    const deletedClass = await Class.findByIdAndRemove(id);
    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.updateClassById = async (req, res) => {
  try {
    const id = req.params.id;
    const classToUpdate = await Class.findById(id);
    if (!classToUpdate) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }
    // if the class exists, update it
    const updateClass = await Class.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json({
      message: "Class updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// get class by id
exports.classById = async (req, res) => {
  try {
    const id = req.params.id;
    // convert the id to a mongoose object id
    const _id = new mongoose.Types.ObjectId(id);
    const classInfo = await Class.findOne(_id);
    if (!classInfo) {
      return res.status(404).json({
        error: "Class not found",
      });
    }
    res.status(200).json(classInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
