const User = require("../models/userlogin");

exports.userRegisterValidator = (req, res, next) => {
  // firstname is not null
  req.check("firstname", "Firstname is required").notEmpty();
  // lastname is not null
  req.check("lastname", "Lastname is required").notEmpty();
  // email is not null, valid and normalized
  req.check("email", "Email must be between 3 to 32 characters").notEmpty();
  req.check("email", "Invalid email").isEmail();
  // check for password
  req.check("password", "Password is required").notEmpty();
  req
    .check("password")
    .isLength({ min: 6 })
    .withMessage("Password must contain at least 6 characters");
  req
    .check(
      "password",
      "Password must contain at least one numeric digit, one uppercase, one lowercase and one special character"
    )
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/, "i");

  // check for errors
  const errors = req.validationErrors();
  // if error show the first one as they happen
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }

  // proceed to next middleware
  next();
};

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
