const User = require("../models/userlogin");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async (req, res) => {
  // check if user already exists
  // const usernameExists = await User.findOne({ username: req.body.username });
  const emailExists = await User.findOne({ email: req.body.email });

  // if (usernameExists) {
  //   return res.status(403).json({
  //     error: "Username is already taken",
  //   });
  // }
  if (emailExists) {
    return res.status(403).json({
      error: "Email is already taken",
    });
  }

  // if new user, create a new user
  const user = new User(req.body);
  await user.save();

  res.status(200).json({
    message: "Signup success! Please login.",
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("jwt", token, { expire: new Date() + 9999, httpOnly: true });

    const { firstname, lastname } = user;
    return res.json({
      message: "Login success",
      firstname,
      lastname,
    });
  } catch (error) {
    // Handle any potential errors
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.logout = (req, res) => {
  // clear the cookie
  res.clearCookie("jwt");
  return res.json({
    message: "Logout success",
  });
};

exports.getLoggedInUser = (req, res) => {
  const { firstname, role } = req.user;
  return res.status(200).json({
    firstname,
    role,
    message: "User is still logged in",
  });
};

// exports.getUsers = async (req, res) => {
//   try {
//     const users = await User.find({}).select("username email createdAt");
//     console.log(users);
//     return res.status(200).json(users);
//   } catch (error) {
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

// get all the users with all the fields
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// delete a user by id
exports.deleteUserById = async (req, res) => {
  try {
    const id = req.params.id;
    // Check if the aboutId exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }
    // if aboutId exists, delete the about
    const deleteUser = await User.findByIdAndRemove(id);
    res.json({ message: "user deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// get user info
exports.userById = async (req, res, next, id) => {
  try {
  } catch (error) {}
};
