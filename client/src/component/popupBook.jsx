import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import spin from "../assets/Spin.gif";

const PopupBook = ({ book, onClose, user, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState(book.title);
  const [updatedAuthor, setUpdatedAuthor] = useState(book.author);
  const [updatedDescription, setUpdatedDescription] = useState(
    book.description
  );
  const [updatedGenre, setUpdatedGenre] = useState(book.genre);

  const updateBook = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/book/${book._id}`, {
        title: updatedTitle,
        author: updatedAuthor,
        genre: updatedGenre,
        description: updatedDescription,
      });
      setEditing(false);
      // toast success message
      toast.success("Le livre a été mis à jour");
      onUpdate();
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  // Fonction pour gérer le clic enn dehors de la popup
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return !book ? (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div
        className="popup-content"
        // style={{ paddingBottom: "12rem", paddingTop: "5rem" }}
      >
        <h1>Chargement Livre</h1>

        <img
          className="img-fluid"
          src={spin}
          alt="spin"
          style={{ width: "3rem", height: "3rem" }}
        />
      </div>
    </div>
  ) : !user ? (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div
        className="popup-content"
        // style={{ paddingBottom: "12rem", paddingTop: "5rem" }}
      >
        <div>
          <h2 className="text-center">{book.title}</h2>
          <img
            src={book.imageData}
            alt={book.title}
            className="img-fluid rounded mx-auto d-block"
          />
        </div>
        <p>
          <p>Auteur: {book.author}</p>
          <p>
            Genre:{" "}
            {book.genre ? (
              <span>{book.genre}</span>
            ) : (
              <span>
                Aucun genre renseigné. Prendre contact avec stéphanie pour plus
                d'infos.
              </span>
            )}
          </p>
          <p>
            Résumé:{" "}
            {book.description ? (
              <span>{book.description}</span>
            ) : (
              <span>
                pas de résumé pour le moment. Contactez stéphanie pour plus
                d'infos
              </span>
            )}
          </p>
          <p>{book.statut}</p>
        </p>
      </div>
    </div>
  ) : (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div
        className="popup-content"
        // style={{ paddingBottom: "12rem", paddingTop: "5rem" }}
      >
        {editing === true &&
        (user.role === "admin" || user.role === "superadmin") ? (
          <div>
            <div className="form-group d-flex justify-content-between">
              <label
                className="mb-0 fw-bolder text-decoration-underline"
                style={{ whiteSpace: "nowrap" }}
              >
                Titre :
              </label>
              <input
                className="flex-grow-1 ml-2"
                type="text"
                value={updatedTitle}
                onChange={(e) => setUpdatedTitle(e.target.value)}
              />
            </div>
            <div className="d-flex justify-content-center">
              <p className="d-flex justify-content-center">
                <img
                  src={book.imageData}
                  alt={book.title}
                  className="img-fluid rounded mx-auto d-block"
                />
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-center">{book.title}</h2>
            <img
              src={book.imageData}
              alt={book.title}
              className="img-fluid rounded mx-auto d-block"
            />
          </div>
        )}

        <p>
          {user &&
          editing &&
          (user.role === "admin" || user.role === "superadmin") ? (
            <div>
              <div className="form-group d-flex justify-content-between">
                <label
                  className="mb-0 fw-bolder text-decoration-underline"
                  style={{ whiteSpace: "nowrap" }}
                >
                  Auteur :
                </label>
                <input
                  className="flex-grow-1 ml-2"
                  type="text"
                  value={updatedAuthor}
                  onChange={(e) => setUpdatedAuthor(e.target.value)}
                />
              </div>
              <div className="form-group d-flex justify-content-between">
                <label
                  className="mb-0 fw-bolder text-decoration-underline"
                  style={{ whiteSpace: "nowrap" }}
                >
                  Genre :
                </label>
                <input
                  className="flex-grow-1 ml-2"
                  type="text"
                  value={updatedGenre}
                  onChange={(e) => setUpdatedGenre(e.target.value)}
                />
              </div>

              <div className="form-group d-flex justify-content-between">
                Résume :
                <textarea
                  type="text"
                  value={updatedDescription}
                  onChange={(e) => setUpdatedDescription(e.target.value)}
                />
              </div>
              {book.statut === "disponible" ? (
                <p>{book.statut}</p>
              ) : (
                <p>
                  emprunté par: {book.firstname} {book.lastname}
                </p>
              )}
              <button className="btn btn-success" onClick={updateBook}>
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
            <div>
              <p>Auteur: {book.author}</p>
              <p>
                Genre:{" "}
                {book.genre ? (
                  <span>{book.genre}</span>
                ) : (
                  <span>
                    Aucun genre renseigné. Prendre contact avec stéphanie pour
                    plus d'infos.
                  </span>
                )}
              </p>
              <p>
                Résumé:{" "}
                {book.description ? (
                  <span>{book.description}</span>
                ) : (
                  <span>
                    pas de résumé pour le moment. Contactez stéphanie pour plus
                    d'infos
                  </span>
                )}
              </p>
              {(user.role === "student" || user.role === "user") && (
                <p>{book.statut}</p>
              )}
              {(user.role === "admin" || user.role === "superadmin") && (
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
                    onClick={() => setEditing(true)}
                  >
                    Modifier
                  </button>
                  {/* <button
                    className="btn btn-danger"
                    onClick={() => setEditing(false)}
                  >
                    Annuler
                  </button> */}
                </>
              )}
            </div>
          )}
        </p>
      </div>
    </div>
  );
};

export default PopupBook;
