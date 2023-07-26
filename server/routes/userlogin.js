const express = require("express");
const router = express.Router();

// import controllers
const {
  register,
  login,
  logout,
  getLoggedInUser,
  getUsers,
} = require("../controllers/userlogin");
// import middlewares
const { userRegisterValidator, userById } = require("../middlewares/userlogin");
const { verifyToken } = require("../middlewares/auth");
// api routes
router.post("/register", userRegisterValidator, register);
router.post("/login", login);
router.get("/logout", logout);

// get all the users
router.get("/users", getUsers);

// get logged in user
router.get("/user", verifyToken, userById, getLoggedInUser);

module.exports = router;
