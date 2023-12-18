const Book = require("../models/books");
const User = require("../models/userlogin");
const mongoose = require("mongoose");

exports.createBook = async (req, res) => {
  const newBook = new Book(req.body);
  await newBook.save();

  res.status(200).json({
    message: "Book created successfully",
  });
};

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find({});
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
    const deletedBook = await Book.findByIdAndRemove(id);
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
    // if the book exists, update it
    const updatedBook = await Book.findByIdAndUpdate(id, req.body, {
      new: true,
    });
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
    // convert the id to a mongoose object
    const _id = new mongoose.Types.ObjectId(id);
    const bookInfo = await Book.findById(_id);
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
    // get the books with emprrunteur not null
    const books = await Book.find({ emprunteur: { $ne: null } }).select(
      "emprunteur"
    );
    res.status(200).json(books);
  } catch (error) {
    console.log(error);
  }
};
