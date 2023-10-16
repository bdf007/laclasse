const express = require("express");
const router = express.Router();

// import controllers
const {
  createBook,
  getBooks,
  deleteBookById,
  updateBookById,
  getBookById,
  getAllBookForAUSser,
} = require("../controllers/book");
// api routes
router.post("/book", createBook);
router.get("/books", getBooks);
router.delete("/book/:id", deleteBookById);
router.put("/book/:id", updateBookById);
router.get("/book/:id", getBookById);
router.get("/get-all-books-from-a-user/:id", getAllBookForAUSser);

module.exports = router;
