const Class = require("../models/class");

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
exports.classById = async (req, res, id) => {
  console.log("hello", id);
  try {
    const classInfo = await Class.findById(id);
    if (!classInfo) {
      return res.status(404).json({
        error: "Class not found",
      });
    }
    req.classInfo = classInfo;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
