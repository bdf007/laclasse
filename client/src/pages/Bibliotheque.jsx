import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { toast } from "react-toastify";

const Bibliotheque = () => {
  const { user } = useContext(UserContext);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [listOfBooks, setListOfBooks] = useState([]);
  const [listOfUsers, setListOfUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [searchAuthor, setSearchAuthor] = useState(
    localStorage.getItem("searchAuthor") || ""
  );
  const [searchTitle, setSearchTitle] = useState(
    localStorage.getItem("searchTitle") || ""
  );
  const [searchGenre, setSearchGenre] = useState(
    localStorage.getItem("searchGenre") || ""
  );

  const getListOfUsers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users`
      );

      setListOfUsers(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Erreur lors de la récupération des utilisateurs");
    }
  };

  const getListOfBooks = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/books`
      );

      // Create an array of promises to fetch user data for all books
      const fetchUserPromises = response.data.map((book) => {
        if (book.statut === "emprunté") {
          const user = listOfUsers.find((user) => user._id === book.emprunteur);
          if (user) {
            book.emprunteur = `${user.firstname} ${user.lastname}`;
          } else {
            book.emprunteur = null;
          }
        } else {
          book.emprunteur = null;
          book.statut = "disponible";
        }
        return book;
      });

      // Wait for all user data fetching promises to resolve
      const updatedBooks = await Promise.all(fetchUserPromises);

      // Set the list of books with the updated data
      setListOfBooks(updatedBooks);
    } catch (error) {
      console.log(error);
      toast.error("Erreur lors de la récupération des livres");
    }
  };

  const assignUserToBook = async (bookId) => {
    try {
      let emprunteurValue = selectedUser;

      // Get the book to update
      const book = listOfBooks.find((book) => book._id === bookId);

      // Check if selectedUser is "aucun" and set emprunteurValue to null
      if (selectedUser === "none") {
        emprunteurValue = null;
        book.statut = "disponible";
        await axios
          .put(`${process.env.REACT_APP_API_URL}/api/book/${bookId}`, {
            emprunteur: emprunteurValue,
            statut: "disponible",
          })
          .then(() => {
            toast.success("emprunteur assigné avec succès");
            // get the response from the server and update the book in the state
            getListOfBooks();
            setSelectedUser("");
          });
      } else {
        await axios
          .put(`${process.env.REACT_APP_API_URL}/api/book/${bookId}`, {
            emprunteur: emprunteurValue,
            statut: "emprunté",
          })
          .then(() => {
            toast.success("emprunteur assigné avec succès");
            // get the response from the server and update the book in the state
            getListOfBooks();
            setSelectedUser("");
          });
      }
    } catch (error) {
      toast.error("Erreur lors de l'assignation de l'emprunteur");
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleAuthorChange = (e) => {
    setAuthor(e.target.value);
  };

  const handleGenreChange = (e) => {
    setGenre(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleUploadBook = () => {
    try {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(selectedFile);

      fileReader.onload = async () => {
        const base64Data = fileReader.result;

        const bookData = {
          title,
          author,
          genre,
          description,
          imageData: base64Data,
        };

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/book`,
          bookData
        );
        toast.success("Livre ajouté avec succès");
        setListOfBooks((prevBooks) => [...prevBooks, response.data]);
      };
      resetForm();
      window.location.reload();
    } catch (error) {
      toast.error("Erreur lors de l'ajout du livre");
    }
  };

  const deleteBookById = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/book/${id}`);
      toast.success("Livre supprimé avec succès");
      setListOfBooks(listOfBooks.filter((book) => book._id !== id));
    } catch (error) {
      toast.error("Erreur lors de la suppression du livre");
    }
  };

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setGenre("");
    setDescription("");
    setSelectedFile(null);
    setSearchAuthor("");
    setSearchTitle("");
    setSearchGenre("");
    // clear input file
    document.getElementById("file").value = null;
    document.getElementById("title").value = "";
    document.getElementById("author").value = "";
    document.getElementById("genre").value = "";
    document.getElementById("description").value = "";
  };

  const handleSearchAuthor = (e) => {
    const value = e.target.value;
    setSearchAuthor(value);
    localStorage.setItem("searchAuthor", value);
  };

  const handleSearchTitle = (e) => {
    const value = e.target.value;
    setSearchTitle(value);
    localStorage.setItem("searchTitle", value);
  };

  const handleSearchGenre = (e) => {
    const value = e.target.value;
    setSearchGenre(value);
    localStorage.setItem("searchGenre", value);
  };

  useEffect(() => {
    getListOfBooks();
    if (!user) {
      return;
    } else if (user.role === "admin" || user.role === "superadmin") {
      getListOfUsers();
    }
    //eslint-disable-next-line
  }, [setListOfBooks, setListOfUsers, user]);

  return (
    <div
      className="container "
      style={{ marginBottom: "12rem", paddingBottom: "10rem" }}
    >
      <div className="row">
        <h1 className="mx-auto text-center">La bibliothéque de Stéphanie</h1>

        <div className="table-responsive">
          {/* Search input fields */}

          {!user ? (
            <table className="table table-striped table-bordered table-hover">
              <thead>
                <tr>
                  <th scope="col">titre</th>
                  <th scope="col">auteur</th>
                  <th scope="col">genre</th>
                  <th scope="col">résumé</th>
                  <th scope="col">couverture</th>
                </tr>
              </thead>
              <tbody>
                <tr className="search-fields">
                  <td>
                    <input
                      type="text"
                      value={searchTitle}
                      placeholder="recherche par titre"
                      onChange={handleSearchTitle}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={searchAuthor}
                      placeholder="recherche par auteur"
                      onChange={handleSearchAuthor}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={searchGenre}
                      placeholder="recherche par genre"
                      onChange={handleSearchGenre}
                    />
                  </td>
                  <td></td>
                  <td></td>
                </tr>
                {!listOfBooks || listOfBooks.length === 0 ? (
                  <tr>
                    <td colSpan="8">Aucun livre</td>
                  </tr>
                ) : (
                  listOfBooks
                    .filter(
                      (book) =>
                        book.author
                          .toLowerCase()
                          .includes(searchAuthor.toLowerCase()) &&
                        book.title
                          .toLowerCase()
                          .includes(searchTitle.toLowerCase()) &&
                        book.genre
                          .toLowerCase()
                          .includes(searchGenre.toLowerCase())
                    )
                    .map((book) => (
                      <tr key={book._id}>
                        <th className="text-justify">{book.title}</th>
                        <td className="text-justify">{book.author}</td>
                        <td>{book.genre}</td>
                        <td className="text-justify">{book.description}</td>
                        <td>
                          <img
                            src={book.imageData}
                            alt={book.title}
                            className="img-thumbnail"
                            style={{ maxWidth: "200px", maxHeight: "200px" }}
                          />
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="table table-striped table-bordered table-hover">
              <thead>
                <tr className="">
                  <th scope="col">titre</th>
                  <th scope="col">auteur</th>
                  <th scope="col">genre</th>
                  <th scope="col">résumé</th>
                  <th scope="col">disponibilité</th>
                  <th scope="col">couverture</th>
                  {(user.role === "admin" || user.role === "superadmin") && (
                    <>
                      <th scope="col">emprunteur</th>
                      <th scope="col">action</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr className="search-fields">
                  <td>
                    <input
                      type="text"
                      value={searchTitle}
                      placeholder="recherche par titre"
                      onChange={handleSearchTitle}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={searchAuthor}
                      placeholder="recherche par auteur"
                      onChange={handleSearchAuthor}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={searchGenre}
                      placeholder="recherche par genre"
                      onChange={handleSearchGenre}
                    />
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  {(user.role === "admin" || user.role === "superadmin") && (
                    <>
                      <td></td>
                      <td></td>
                    </>
                  )}
                </tr>
                {!listOfBooks || listOfBooks.length === 0 ? (
                  <tr>
                    <td colSpan="8">Aucun livre</td>
                  </tr>
                ) : (
                  listOfBooks
                    .filter(
                      (book) =>
                        book.author
                          .toLowerCase()
                          .includes(searchAuthor.toLowerCase()) &&
                        book.title
                          .toLowerCase()
                          .includes(searchTitle.toLowerCase()) &&
                        book.genre
                          .toLowerCase()
                          .includes(searchGenre.toLowerCase())
                    )
                    .map((book) => (
                      <tr key={book._id}>
                        <th className="text-justify">{book.title}</th>
                        <td className="text-justify">{book.author}</td>
                        <td>{book.genre}</td>
                        <td className="text-justify">{book.description}</td>
                        <td>{book.statut}</td>
                        <td>
                          <img
                            src={book.imageData}
                            alt={book.title}
                            className="img-thumbnail"
                          />
                        </td>
                        <td>{book.emprunteur}</td>
                        {(user.role === "admin" ||
                          user.role === "superadmin") && (
                          <>
                            <td>
                              <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => deleteBookById(book._id)}
                              >
                                supprimer
                              </button>
                              <br />
                              <br />
                              <select
                                className="form-select"
                                aria-label="Default select example"
                                value={selectedUser}
                                onChange={(e) =>
                                  setSelectedUser(e.target.value)
                                }
                              >
                                <option value="">Choisir un emprunteur</option>
                                {listOfUsers.map((user) => (
                                  <option key={user._id} value={user._id}>
                                    {user.firstname} {user.lastname}
                                  </option>
                                ))}
                                <option value="none">Aucun</option>
                              </select>
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => assignUserToBook(book._id)}
                              >
                                assigner
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                )}

                {(user.role === "admin" || user.role === "superadmin") && (
                  <tr>
                    <td>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        className="form-control"
                        placeholder="titre"
                        onChange={handleTitleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        id="author"
                        value={author}
                        className="form-control"
                        placeholder="auteur"
                        onChange={handleAuthorChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        id="genre"
                        value={genre}
                        className="form-control"
                        placeholder="genre"
                        onChange={handleGenreChange}
                      />
                    </td>
                    <td>
                      <textarea
                        type="text"
                        id="description"
                        value={description}
                        placeholder="résumé"
                        onChange={handleDescriptionChange}
                      />
                    </td>
                    <td></td>
                    <td>
                      <input
                        type="file"
                        id="file"
                        accept="image/*"
                        className="form-control"
                        placeholder="couverture"
                        onChange={handleFileInputChange}
                      />
                    </td>
                    <td></td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleUploadBook}
                      >
                        Ajouter
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bibliotheque;
