const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/userlogin");
const Class = require("../models/class");
const CourseFile = require("../models/courseFile");
const {
  uploadBase64Image,
  getFileStream,
  deleteFile,
} = require("../services/pcloud");

const PCLOUD_SUBFOLDER = "photos-profil";

exports.register = async (req, res) => {
  try {
    const emailExists = await User.findOne({ email: req.body.email });

    if (emailExists) {
      return res.status(403).json({
        error: "Email is already taken",
      });
    }

    const user = new User(req.body);
    await user.save();

    res.status(200).json({
      message: "Signup success! Please login.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
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

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    const { _id, firstname, lastname, role, classes } = user;

    if (classes) {
      const classInfo = await Class.findById(classes);
      return res.json({
        message: "Connexion réussie",
        _id,
        firstname,
        lastname,
        role,
        classes: classInfo?.name || null,
      });
    } else {
      return res.json({
        message: "Connexion réussie",
        _id,
        firstname,
        lastname,
        role,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("jwt");
  return res.json({
    message: "Déconnexion réussie",
  });
};

exports.getLoggedInUser = async (req, res) => {
  try {
    const {
      _id,
      firstname,
      lastname,
      email,
      role,
      classes,
      profilePicturePcloudId,
      profilePictureData,
    } = req.user;

    if (classes) {
      const classInfo = await Class.findById(classes);
      const courseFiles = classInfo
        ? await CourseFile.find({ classId: classes }).select(
            "_id courseFileTitle classId createdAt",
          )
        : [];

      return res.status(200).json({
        message: "User is still logged in",
        _id,
        firstname,
        lastname,
        email,
        role,
        classes: classInfo?.name || null,
        aboutClass: classInfo?.about || null,
        nextClass: classInfo?.nextCourse || null,
        courseFiles,
        hasProfilePicture: Boolean(
          profilePicturePcloudId || profilePictureData,
        ),
      });
    } else {
      return res.json({
        message: "User is still logged in",
        _id,
        firstname,
        lastname,
        email,
        role,
        hasProfilePicture: Boolean(
          profilePicturePcloudId || profilePictureData,
        ),
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get all the users with all the fields
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-hashedPassword -salt").lean();

    for (let i = 0; i < users.length; i++) {
      if (users[i].classes) {
        const classInfo = await Class.findById(users[i].classes);
        users[i].classes = classInfo?.name || null;
      }
      // hasProfilePicture calculé ici, puis le Base64 brut (lourd) est
      // retiré avant l'envoi au navigateur -- c'est là que ça compte.
      users[i].hasProfilePicture = Boolean(
        users[i].profilePicturePcloudId || users[i].profilePictureData,
      );
      delete users[i].profilePictureData;
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// delete a user by id
exports.deleteUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }

    if (user.profilePicturePcloudId) {
      await deleteFile(user.profilePicturePcloudId);
    }

    await User.findByIdAndDelete(id);
    res.json({ message: "user deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.changeRoleById = async (req, res) => {
  try {
    const id = req.params.id;
    const { role } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: "cet ID n'existe pas",
      });
    }
    user.role = role;
    await user.save();
    res.status(200).json({
      message: "role de l'utilisateur mis à jour avec succès",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "erreur lors de la mise à jour du rôle de l'utilisateur",
    });
  }
};

exports.addClassToUser = async (req, res) => {
  try {
    const { userId, classId } = req.body;

    const user = await User.findById(userId);
    const classInfo = await Class.findById(classId);

    if (!user || !classInfo) {
      return res.status(400).json({ message: "User or class not found" });
    }

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

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User or class not found" });
    }

    user.classes = null;
    await user.save();

    res.status(200).json({ message: "Class removed from user successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error removing class from user" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const _id = req.params.id;

    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
    const isSelf = req.user._id.toString() === _id;
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.firstname = req.body.firstname || user.firstname;
    user.lastname = req.body.lastname || user.lastname;
    user.email = req.body.email || user.email;

    if (req.body.newPassword) {
      user.setPassword(req.body.newPassword);
    }

    await user.save();

    res.status(200).json({ message: "User profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Photo de profil : envoyée en Base64 dans le JSON (photoData), uploadée
// vers pCloud. Plus de multer, plus de fichier sur le disque du serveur.
exports.updateProfilePhoto = async (req, res) => {
  try {
    const _id = req.params.id;

    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
    const isSelf = req.user._id.toString() === _id;
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (req.body.removePhoto === true || req.body.removePhoto === "true") {
      if (user.profilePicturePcloudId) {
        await deleteFile(user.profilePicturePcloudId);
      }
      user.profilePicturePcloudId = null;
      await user.save();
      return res.status(200).json({ message: "Photo de profil supprimée" });
    }

    const { photoData } = req.body;
    if (!photoData) {
      return res.status(400).json({ error: "Aucune photo reçue" });
    }

    const pcloudFileId = await uploadBase64Image(
      photoData,
      `profile-${_id}-${Date.now()}.webp`,
      PCLOUD_SUBFOLDER,
    );

    // Supprime l'ancienne photo sur pCloud pour ne pas accumuler de fichiers orphelins
    if (user.profilePicturePcloudId) {
      await deleteFile(user.profilePicturePcloudId);
    }

    user.profilePicturePcloudId = pcloudFileId;
    await user.save();

    res.status(200).json({ message: "Photo de profil mise à jour" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Sert la photo de profil en la relayant depuis pCloud (jamais de redirection
// directe vers pCloud, plus fiable sur tous les navigateurs/appareils).
// Accès restreint : soi-même ou un admin, comme avant.
exports.getUserPhoto = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (
      !targetUser ||
      (!targetUser.profilePicturePcloudId && !targetUser.profilePictureData)
    ) {
      return res.status(404).json({ error: "Photo introuvable" });
    }

    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
    const isSelf = req.user._id.toString() === req.params.id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    if (targetUser.profilePicturePcloudId) {
      const { contentType, stream } = await getFileStream(
        targetUser.profilePicturePcloudId,
      );
      res.set("Content-Type", contentType);
      res.set("Cache-Control", "no-store");
      return stream.pipe(res);
    }

    // Repli sur l'ancien Base64, pour les comptes pas encore migrés
    const matches = targetUser.profilePictureData.match(
      /^data:(.+);base64,(.+)$/,
    );
    if (matches) {
      res.set("Content-Type", matches[1]);
      return res.send(Buffer.from(matches[2], "base64"));
    }

    return res.status(404).json({ error: "Photo introuvable" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors du chargement de la photo" });
  }
};

// get user by id and send only firstname, lastname and id
exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const _id = new mongoose.Types.ObjectId(id);
    const userInfo = await User.findById(_id);
    if (!userInfo) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json({
      _id: userInfo._id,
      firstname: userInfo.firstname,
      lastname: userInfo.lastname,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
