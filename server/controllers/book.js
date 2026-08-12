const Book = require("../models/books");
const User = require("../models/userlogin");
const mongoose = require("mongoose");
const {
  uploadBase64Image,
  getFileStream,
  deleteFile,
} = require("../services/pcloud");

const PCLOUD_SUBFOLDER = "bibliotheque";

exports.createBook = async (req, res) => {
  try {
    const bookData = { ...req.body };

    if (bookData.imageData) {
      const fileid = await uploadBase64Image(
        bookData.imageData,
        `book-${Date.now()}.webp`,
        PCLOUD_SUBFOLDER,
      );
      bookData.pcloudFileId = fileid;
    }
    delete bookData.imageData;

    const newBook = new Book(bookData);
    await newBook.save();

    res.status(200).json({
      message: "Book created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find({}).select("-imageData");
    res.status(200).json(books);
  } catch (error) {
    console.log(error);
  }
};

exports.getBooksWithoutImageData = async (req, res) => {
  try {
    const books = await Book.find({}).select("-imageData");
    res.status(200).json(books);
  } catch (error) {
    console.log(error);
  }
};

exports.deleteBookById = async (req, res) => {
  try {
    const id = req.params.id;
    const bookToDelete = await Book.findById(id);
    if (!bookToDelete) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }

    if (bookToDelete.pcloudFileId) {
      await deleteFile(bookToDelete.pcloudFileId);
    }

    await Book.findByIdAndDelete(id);
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.updateBookById = async (req, res) => {
  try {
    const id = req.params.id;
    const bookToUpdate = await Book.findById(id);
    if (!bookToUpdate) {
      return res.status(404).json({
        error: "ID does not exist",
      });
    }

    const updateData = { ...req.body };

    if (updateData.imageData) {
      const fileid = await uploadBase64Image(
        updateData.imageData,
        `book-${Date.now()}.webp`,
        PCLOUD_SUBFOLDER,
      );
      if (bookToUpdate.pcloudFileId) {
        await deleteFile(bookToUpdate.pcloudFileId);
      }
      updateData.pcloudFileId = fileid;
    }
    delete updateData.imageData;

    const updatedBook = await Book.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-imageData");
    res.status(200).json({
      message: "Book updated successfully",
      updatedBook: updatedBook,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// get book info
exports.getBookById = async (req, res) => {
  try {
    const id = req.params.id;
    const _id = new mongoose.Types.ObjectId(id);
    const bookInfo = await Book.findById(_id).select("-imageData");
    if (!bookInfo) {
      return res.status(404).json({
        error: "Book not found",
      });
    }

    res.status(200).json(bookInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.getAllBookForAUSser = async (req, res) => {
  try {
    const id = req.params.id;
    const books = await Book.find({ emprunteur: id }).select("title");
    res.status(200).json(books);
  } catch (error) {
    console.log(error);
  }
};

exports.getListOfAllBooker = async (req, res) => {
  try {
    const books = await Book.find({ emprunteur: { $ne: null } }).select(
      "emprunteur",
    );
    res.status(200).json(books);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Route-relais pour l'image d'un livre. URL stable pour le frontend,
 * redemande un lien pCloud frais à chaque appel. Fallback sur l'ancien
 * Base64 pour les entrées pas encore migrées.
 */
exports.getBookImage = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select(
      "pcloudFileId imageData",
    );
    if (!book) return res.status(404).end();

    if (book.pcloudFileId) {
      const { contentType, stream } = await getFileStream(book.pcloudFileId);
      res.set("Content-Type", contentType);
      res.set("Cache-Control", "no-store");
      return stream.pipe(res);
    }

    if (book.imageData) {
      const matches = book.imageData.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        res.set("Content-Type", matches[1]);
        return res.send(Buffer.from(matches[2], "base64"));
      }
    }

    return res.status(404).end();
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};
