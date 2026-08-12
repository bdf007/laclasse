const express = require("express");
const router = express.Router();

// import controllers
const {
  createBook,
  getBooks,
  getBooksWithoutImageData,
  deleteBookById,
  updateBookById,
  getBookById,
  getAllBookForAUSser,
  getListOfAllBooker,
  getBookImage,
} = require("../controllers/book");
// api routes
router.post("/book", createBook);
router.get("/books", getBooks);
router.get("/books/noimage", getBooksWithoutImageData);
router.delete("/book/:id", deleteBookById);
router.put("/book/:id", updateBookById);
router.get("/book/:id", getBookById);
router.get("/get-all-books-from-a-user/:id", getAllBookForAUSser);
router.get("/get-list-of-all-booker", getListOfAllBooker);

// GET route for the image proxy (public, no auth needed)
router.get("/book/image/:id", getBookImage);

module.exports = router;
