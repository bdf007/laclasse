const User = require("../models/userlogin");
const Class = require("../models/class");

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

    const { firstname, lastname, role, classes } = user;
    // if the classis not null, get the info of the class and add it to the user
    if (classes) {
      const classInfo = await Class.findById(classes);
      return res.json({
        message: "Login success",
        firstname,
        lastname,
        role,
        classes: classInfo.name,
      });
    } else {
      return res.json({
        message: "Login success",
        firstname,
        lastname,
        role,
      });
    }
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

exports.getLoggedInUser = async (req, res) => {
  const { firstname, lastname, email, role, classes } = req.user;
  // if the classis not null, get the info of the class and add it to the user
  if (classes) {
    const classInfo = await Class.findById(classes);
    return res.status(200).json({
      message: "User is still logged in",
      firstname,
      lastname,
      email,
      role,
      classes: classInfo.name,
      aboutClass: classInfo.about,
    });
  } else {
    return res.json({
      message: "User is still logged in",
      firstname,
      lastname,
      email,
      role,
    });
  }
};

// exports.getUsers = async (req, res) => {
//   try {
//     const users = await User.find({}).select("username email createdAt");
//     return res.status(200).json(users);
//   } catch (error) {
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

// get all the users with all the fields
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    // replace the id of the class with the name of the class and dont show the id of the class
    for (let i = 0; i < users.length; i++) {
      if (!users[i].classes) continue;
      const classInfo = await Class.findById(users[i].classes);
      users[i].classes = classInfo.name;
    }

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

exports.changeRoleById = async (req, res) => {
  try {
    const id = req.params.id;
    const { role } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }
    // if the user exists, update it
    user.role = role;
    await user.save();
    res.status(200).json({
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating user role",
    });
  }
};

exports.addClassToUser = async (req, res) => {
  try {
    const { userId, classId } = req.body;

    // Find the user and class documents
    const user = await User.findById(userId);
    const classInfo = await Class.findById(classId);

    if (!user || !classInfo) {
      return res.status(400).json({ message: "User or class not found" });
    }

    // Update the user's classes field with the assigned class ID
    user.classes = classId;
    await user.save();

    res.status(200).json({ message: "Class assigned to user successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error assigning class to user" });
  }
};

exports.removeClassToUser = async (req, res) => {
  try {
    const { userId } = req.body;

    // Find the user and class documents
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User or class not found" });
    }

    // Update the user's classes field with the assigned class ID
    user.classes = null;
    await user.save();

    res.status(200).json({ message: "Class removed from user successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error removing class from user" });
  }
};

// exports.updateProfile = async (req, res) => {
//   try {
//     const { firstname, lastname, email, password } = req.body;
//     const user = await User.findById(req._id);

//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     user.firstname = firstname;
//     user.lastname = lastname;
//     user.email = email;
//     user.password = password;

//     await user.save();

//     res.status(200).json({ message: "Profile updated successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Error updating profile" });
//   }
// };
