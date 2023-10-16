const mongoose = require("mongoose");
const uuidv1 = require("uuidv1");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: [
        "user",
        "student",
        "admin",
        "superadmin",
        "oldstudent",
        "AdminVin",
      ],
      default: "user",
    },
    // add a class by the id of the class
    classes: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    profilePictureData: {
      type: String,
      trim: true,
    },

    salt: String,
  },
  { timestamps: true }
);

// virtual field
userSchema.virtual("password").set(function (password) {
  // create temporary variable called _password
  this._password = password;
  // generate a timestamp, uuidv1 gives us a unique timestamp
  this.salt = uuidv1();
  // encrypt the password function call
  this.hashedPassword = this.encryptPassword(password);
});

// methods
userSchema.methods = {
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },
  setPassword: function (newPassword) {
    // Generate a new salt
    this.salt = uuidv1();
    // Encrypt the new password and update hashedPassword
    this.hashedPassword = this.encryptPassword(newPassword);
  },
};

module.exports = mongoose.model("User", userSchema);
