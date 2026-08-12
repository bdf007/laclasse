const { body, validationResult } = require("express-validator");
const User = require("../models/userlogin");

exports.userRegisterValidator = [
  body("firstname", "Firstname is required").notEmpty(),
  body("lastname", "Lastname is required").notEmpty(),
  body("email", "Email must be between 3 to 32 characters").notEmpty(),
  body("email", "Invalid email").isEmail(),
  body("password", "Password is required").notEmpty(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must contain at least 6 characters"),
  body(
    "password",
    "Password must contain at least one numeric digit, one uppercase, one lowercase and one special character",
  ).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      return res.status(400).json({ error: firstError });
    }
    next();
  },
];

exports.userById = async (req, res, next) => {
  try {
    const user = await User.findById(req._id).exec();
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.addClassToUser = async (req, res) => {
  const { userId, classId } = req.params;

  try {
    // find the user and the class based on the provided ids
    const user = await User.findById(userId);
    const classToAdd = await Class.findById(classId);

    // check if the user and the class exist
    if (!user || !classToAdd) {
      return res.status(404).json({
        error: "User or class does not exist",
      });
    }

    // add the class to the user array
    user.classes.push(classToAdd);

    // save the updated user
    await user.save();

    res.json({ message: "Class added successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
