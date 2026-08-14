const Comment = require("../models/comments");
const mongoose = require("mongoose");
const User = require("../models/userlogin");

// Masque le contenu d'un message supprimé par un admin, sauf pour son
// auteur (qui doit voir le motif) et pour les admins (pour leurs
// archives). Pour tout le monde d'autre, le message est retiré de la
// liste -- "plus lisible par les autres élèves".
const applyModeration = (comments, requestingUserId, requestingUserRole) => {
  const isAdminViewer =
    requestingUserRole === "admin" || requestingUserRole === "superadmin";

  return comments
    .filter((comment) => {
      if (!comment.deletedByAdmin) return true;
      const isAuthor =
        comment.user && comment.user.toString() === requestingUserId;
      return isAuthor || isAdminViewer;
    })
    .map((comment) => {
      const obj = comment.toObject ? comment.toObject() : comment;
      if (obj.deletedByAdmin) {
        obj.comment = `Ce message a été supprimé par l'administrateur. Motif : ${
          obj.deletionReason || "non précisé"
        }`;
      }
      return obj;
    });
};

const attachUserRoles = async (comments) => {
  const userIds = comments.map((comment) => comment.user).filter(Boolean);
  const users = await User.find({ _id: { $in: userIds } });
  const userRoles = users.reduce((role, user) => {
    role[user._id] = user.role;
    return role;
  }, {});

  return comments.map((comment) => ({
    ...comment,
    userRole: userRoles[comment.user],
  }));
};

exports.getComment = async (req, res) => {
  try {
    const comments = await Comment.find({});
    const moderated = applyModeration(
      comments,
      req.user._id.toString(),
      req.user.role,
    );
    const commentsWithRoles = await attachUserRoles(moderated);
    res.json(commentsWithRoles);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.getCommentByClasses = async (req, res) => {
  try {
    const classes = req.params.classes;
    // "" (diffusion à toutes les classes) s'ajoute toujours aux messages
    // propres à la classe demandée.
    const comments = await Comment.find({
      $or: [{ classes: classes }, { classes: "" }],
    });
    const moderated = applyModeration(
      comments,
      req.user._id.toString(),
      req.user.role,
    );
    const commentsWithRoles = await attachUserRoles(moderated);
    res.json(commentsWithRoles);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Compte exact des messages liés à une classe précise (pas les messages
// diffusés à toutes les classes) -- utilisé pour avertir avant la
// suppression d'une classe.
exports.getCommentCountForClass = async (req, res) => {
  try {
    const classes = req.params.classes;
    const count = await Comment.countDocuments({ classes });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.postComment = async (req, res) => {
  try {
    const isAdminUser =
      req.user.role === "admin" || req.user.role === "superadmin";

    if (!isAdminUser) {
      // Un élève doit être assigné à une classe pour pouvoir poster --
      // vérifié ici aussi (pas seulement côté interface), au cas où.
      const poster = await User.findById(req.user._id);
      if (!poster || !poster.classes) {
        return res.status(403).json({
          error: "Vous devez être assigné à une classe pour poster un message",
        });
      }
    }

    const comment = new Comment(req.body);
    await comment.save();
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.getCommentById = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the provided id is a valid ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Invalid ID format",
      });
    }
    // Check if the comment id exists
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.updateCommentById = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the provided id is a valid ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Invalid ID format",
      });
    }
    // Check if the comment id exists
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }
    // if comment Id exists, update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true },
    );
    res.json(updatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Réécrit : l'auteur qui supprime son propre message continue de le
// supprimer réellement. Si c'est quelqu'un d'autre (un admin qui modère),
// le message est masqué (deletedByAdmin + motif) plutôt que réellement
// supprimé, pour que son auteur sache pourquoi il a disparu.
// Un élève signale un message -- ajoute son nom au tableau "reports" du
// message si ce n'est pas déjà fait (pas de doublon pour le même élève).
exports.reportCommentById = async (req, res) => {
  try {
    const id = req.params.id;
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }

    const requestingUserId = req.user._id.toString();

    if (comment.user) {
      const author = await User.findById(comment.user);
      if (author && (author.role === "admin" || author.role === "superadmin")) {
        return res.status(403).json({
          error: "Impossible de signaler un message d'un administrateur",
        });
      }
    }

    const alreadyReported = comment.reports.some(
      (r) => r.user && r.user.toString() === requestingUserId,
    );
    if (alreadyReported) {
      return res.json({ message: "Message déjà signalé", comment });
    }

    const reporter = await User.findById(req.user._id);
    comment.reports.push({
      user: req.user._id,
      firstname: reporter ? reporter.firstname : "",
      lastname: reporter ? reporter.lastname : "",
    });
    await comment.save();
    res.json({ message: "Message signalé à l'administrateur", comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Admin uniquement -- efface les signalements d'un message sans toucher
// à son contenu ni à sa visibilité (le message avait été jugé correct
// après vérification).
exports.clearReportsById = async (req, res) => {
  try {
    const id = req.params.id;
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }
    comment.reports = [];
    await comment.save();
    res.json({ message: "Signalements ignorés", comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Admin uniquement -- suppression réelle et irréversible, typiquement
// utilisée pour faire le ménage sur un message déjà modéré (la route de
// suppression normale ferait juste une modération de plus, pas une vraie
// suppression, puisque l'admin n'est généralement pas l'auteur).
exports.permanentlyDeleteCommentById = async (req, res) => {
  try {
    const id = req.params.id;
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }
    await Comment.findByIdAndDelete(id);
    res.json({ message: "Comment permanently deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.deleteCommentById = async (req, res) => {
  try {
    const id = req.params.id;
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }

    const requestingUserId = req.user._id.toString();
    const isAuthor =
      comment.user && comment.user.toString() === requestingUserId;

    if (isAuthor) {
      await Comment.findByIdAndDelete(id);
      return res.json({ message: "Comment deleted successfully" });
    }

    const { reason } = req.body;
    comment.deletedByAdmin = true;
    comment.deletionReason = reason || "";
    await comment.save();
    res.json({ message: "Comment moderated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
