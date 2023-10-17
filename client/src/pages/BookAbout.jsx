import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { Link } from "react-router-dom";

const BookAbout = () => {
  const { user } = useContext(UserContext);
  const [book, setBook] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [updatedAuthor, setUpdatedAuthor] = useState("");
  const [updatedGenre, setUpdatedGenre] = useState("");
  const [updatedDescription, setUpdatedDescription] = useState("");

  // Get bookId from URL
  const bookId = window.location.pathname.split("/")[2];

  const getBookById = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/book/${bookId}`
      );

      setBook(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const UpdateBook = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/book/${editingBookId}`,
        {
          title: updatedTitle,
          author: updatedAuthor,
          genre: updatedGenre,
          description: updatedDescription,
        }
      );
      setEditing(false);
      getBookById();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteBook = async () => {
    try {
      // check the statut of the book before deleting it
      if (book.statut === "disponible") {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/book/${bookId}`
        );
        window.location.href = "/Bibliotheque";
      } else {
        alert("Le livre n'est pas disponible");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const startEditingBook = (bookId, title, author, genre, description) => {
    setEditing(true);
    setEditingBookId(bookId);
    setUpdatedTitle(title);
    setUpdatedAuthor(author);
    setUpdatedGenre(genre);
    setUpdatedDescription(description);
  };

  useEffect(() => {
    getBookById();
  }, [setBook]);
  return !book ? (
    <div
      className="container"
      style={{ paddingBottom: "12rem", paddingTop: "5rem" }}
    >
      <h2>Chargement...</h2>
    </div>
  ) : !user ? (
    <div
      className="container"
      style={{ paddingBottom: "15rem", paddingTop: "5rem" }}
    >
      <div className="d-flex justify-content-center">
        <h2>{book.title}</h2>
      </div>
      <div className="row">
        <div className="col-6">
          <img src={book.imageData} alt={book.title} className="img-fluid" />
        </div>
        <div className="col-6">
          <p>Auteur: {book.author}</p>
          <p>Genre: {book.genre}</p>
          <p>Résumé: {book.description}</p>
          <p>{book.statut}</p>

          <div className="d-flex justify-content-center">
            <Link to="/Bibliotheque">retour a la bibliothéque</Link>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div
      className="container"
      style={{ paddingBottom: "15rem", paddingTop: "5rem" }}
    >
      {editing && (user.role === "admin" || user.role === "superadmin") ? (
        <div className="d-flex justify-content-center">
          <h2>
            Titre :
            <input
              type="text"
              value={updatedTitle}
              onChange={(e) => setUpdatedTitle(e.target.value)}
            />
          </h2>
        </div>
      ) : (
        <div className="d-flex justify-content-center">
          <h2>{book.title}</h2>
        </div>
      )}
      <div className="row">
        <div className="col-6">
          <img src={book.imageData} alt={book.title} className="img-fluid" />
        </div>
        {editing && (user.role === "admin" || user.role === "superadmin") ? (
          <div className="col-6">
            <p>
              Auteur :
              <input
                type="text"
                value={updatedAuthor}
                onChange={(e) => setUpdatedAuthor(e.target.value)}
              />
            </p>
            <p>
              Genre :
              <input
                type="text"
                value={updatedGenre}
                onChange={(e) => setUpdatedGenre(e.target.value)}
              />
            </p>

            <p>
              Résume :
              <textarea
                type="text"
                value={updatedDescription}
                onChange={(e) => setUpdatedDescription(e.target.value)}
              />
            </p>
            {book.statut === "disponible" ? (
              <p>{book.statut}</p>
            ) : (
              <p>
                emprunté par: {book.firstname} {book.lastname}
              </p>
            )}
            <button className="btn btn-success" onClick={UpdateBook}>
              Valider
            </button>
            <button
              className="btn btn-warning"
              onClick={() => setEditing(false)}
            >
              Annuler
            </button>
          </div>
        ) : (
          <div className="col-6">
            <p>Auteur: {book.author}</p>
            <p>Genre: {book.genre}</p>
            <p>Résumé: {book.description}</p>
            {(user.role === "student" || user.role === "user") && (
              <p>{book.statut}</p>
            )}
            {user.role === "admin" ||
              (user.role === "superadmin" && (
                <>
                  {book.statut === "disponible" ? (
                    <p>{book.statut}</p>
                  ) : (
                    <p>
                      emprunté par: {book.firstname} {book.lastname}
                    </p>
                  )}
                  <button
                    className="btn btn-warning"
                    onClick={() =>
                      startEditingBook(
                        bookId,
                        book.title,
                        book.author,
                        book.genre,
                        book.description
                      )
                    }
                  >
                    Modifier
                  </button>

                  <button className="btn btn-danger" onClick={deleteBook}>
                    Supprimer
                  </button>
                </>
              ))}
          </div>
        )}

        <div className="d-flex justify-content-center">
          <Link to="/Bibliotheque">retour a la bibliothéque</Link>
        </div>
      </div>
    </div>
  );
};
export default BookAbout;
