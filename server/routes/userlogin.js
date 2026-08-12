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
  updateProfilePhoto,
  getUserPhoto,
  getUserById,
} = require("../controllers/userlogin");
// import middlewares
const { userRegisterValidator, userById } = require("../middlewares/userlogin");
const { authMiddleware, adminAuthMiddleware } = require("../middlewares/auth");

// api routes
router.post("/register", userRegisterValidator, register);
router.post("/login", login);
router.get("/logout", logout);
// delete a user by id
router.delete("/user/:id", adminAuthMiddleware, deleteUserById);

// get all the users//
router.get("/users", getUsers);

// get logged in user
router.get("/user", authMiddleware, userById, getLoggedInUser);

// change role by id
router.put("/user/:id/change-role", adminAuthMiddleware, changeRoleById);

// add class to user
router.post("/user/assign-class", adminAuthMiddleware, addClassToUser);

// remmove class from user
router.post("/user/remove-class", adminAuthMiddleware, removeClassToUser);

//update profile
router.post("/update-profile/:id", authMiddleware, updateProfile);

// update profile photo (JSON avec photoData en Base64, plus de multipart)
router.post("/update-profile-photo/:id", authMiddleware, updateProfilePhoto);

// get profile photo (relayée depuis pCloud)
router.get("/user/:id/photo", authMiddleware, getUserPhoto);

// get user by id
router.get("/user/:id", authMiddleware, getUserById);

module.exports = router;
