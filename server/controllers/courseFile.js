const CourseFile = require("../models/courseFile");

// Create a new course file
exports.createCourseFile = async (req, res) => {
  try {
    const { courseFileTitle, courseFileData, classId } = req.body; // Destructure the specific fields you want
    const newCourseFile = new CourseFile({
      courseFileTitle,
      courseFileData,
      classId,
    });

    const savedCourseFile = await newCourseFile.save();

    res.status(201).json(savedCourseFile);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a list of all course files
exports.getAllCourseFiles = async (req, res) => {
  try {
    const courseFiles = await CourseFile.find();
    res.status(200).json(courseFiles);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllCourseFilesByClassId = async (req, res) => {
  const classId = req.params.id;

  try {
    const courseFiles = await CourseFile.find({ classId: classId });
    res.status(200).json(courseFiles);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single course file by ID
exports.getCourseFileById = async (req, res) => {
  const courseId = req.params.id;

  try {
    const courseFile = await CourseFile.findById(courseId);

    if (!courseFile) {
      return res.status(404).json({ error: "Course file not found" });
    }

    res.status(200).json(courseFile);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a course file by ID
exports.updateCourseFile = async (req, res) => {
  const courseId = req.params.id;

  try {
    const updatedCourseFile = await CourseFile.findByIdAndUpdate(
      courseId,
      req.body,
      { new: true }
    );

    if (!updatedCourseFile) {
      return res.status(404).json({ error: "Course file not found" });
    }

    res.status(200).json(updatedCourseFile);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a course file by ID
exports.deleteCourseFile = async (req, res) => {
  const courseId = req.params.id;

  try {
    const deletedCourseFile = await CourseFile.findByIdAndRemove(courseId);

    if (!deletedCourseFile) {
      return res.status(404).json({ error: "Course file not found" });
    }

    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
