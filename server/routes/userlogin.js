const express = require("express");
const router = express.Router();

// import controllers
const {
  register,
  login,
  logout,
  getLoggedInUser,
  getUsers,
  deleteUserById,
  changeRoleById,
  addClassToUser,
  removeClassToUser,
  updateProfile,
  // updateProfile,
} = require("../controllers/userlogin");
// import middlewares
const { userRegisterValidator, userById } = require("../middlewares/userlogin");
const { verifyToken } = require("../middlewares/auth");
// api routes
router.post("/register", userRegisterValidator, register);
router.post("/login", login);
router.get("/logout", logout);
// delete a user by id
router.delete("/user/:id", deleteUserById);

// get all the users
router.get("/users", getUsers);

// get logged in user
router.get("/user", verifyToken, userById, getLoggedInUser);

// change role by id
router.put("/user/:id/change-role", changeRoleById);

// add class to user
router.post("/user/assign-class", addClassToUser);

// remmove class from user
router.post("/user/remove-class", removeClassToUser);

//update profile
router.post("/update-profile/:id", updateProfile);

module.exports = router;
