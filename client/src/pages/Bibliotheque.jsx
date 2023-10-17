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
  //get the size of the window
  const [width, setWidth] = useState(window.innerWidth);
  const [show, setShow] = useState(true);

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
      const fetchUserPromises = await response.data.map((book) => {
        if (book.statut === "emprunté") {
          const user = listOfUsers.find((user) => user._id === book.emprunteur);
          if (user) {
            book.emprunteurName = `${user.firstname} ${user.lastname}`;
          } else {
            book.emprunteurName = null;
          }
        } else {
          book.emprunteurName = null;
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
        getListOfBooks();
        toast.success("Livre ajouté avec succès");
        setListOfBooks((prevBooks) => [...prevBooks, response.data]);
      };
      resetForm();
    } catch (error) {
      toast.error("Erreur lors de l'ajout du livre");
    }
  };

  // Filter condition that checks if the properties exist before calling toLowerCase()
  const filterdBooks = listOfBooks.filter((book) => {
    const matchesSearchTitle =
      !searchTitle ||
      (book.title &&
        book.title.toLowerCase().includes(searchTitle.toLowerCase()));
    const matchesSearchAuthor =
      !searchAuthor ||
      (book.author &&
        book.author.toLowerCase().includes(searchAuthor.toLowerCase()));
    const matchesSearchGenre =
      !searchGenre ||
      (book.genre &&
        book.genre.toLowerCase().includes(searchGenre.toLowerCase()));
    return matchesSearchTitle && matchesSearchAuthor && matchesSearchGenre;
  });

  const deleteBookById = async (id) => {
    try {
      // check if the book is emprunté
      const book = listOfBooks.find((book) => book._id === id);
      if (book.statut === "emprunté") {
        toast.error("Ce livre est emprunté, vous ne pouvez pas le supprimer");
        return;
      }
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
    e.preventDefault();
    const value = e.target.value;
    setSearchAuthor(value);
    localStorage.setItem("searchAuthor", value);
  };

  const handleSearchTitle = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setSearchTitle(value);
    localStorage.setItem("searchTitle", value);
  };

  const handleSearchGenre = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setSearchGenre(value);
    localStorage.setItem("searchGenre", value);
  };

  // check if the size of the window is a mobile size
  const handleResize = () => {
    const newWidth = window.innerWidth;
    setWidth(newWidth);
    if (newWidth < 768) {
      setShow(false);
    } else {
      setShow(true);
    }
  };
  useEffect(() => {
    handleResize(); // Call it on initial render
    window.addEventListener("resize", handleResize); // Attach it to the resize event

    // Don't forget to remove the event listener on cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [width]);

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
    <div className="container " style={{ paddingBottom: "12rem" }}>
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
                  {show === true && <th scope="col">résumé</th>}
                  <th scope="col">couverture</th>
                </tr>
              </thead>
              <tbody>
                {show === true && (
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
                    {show === true && <td></td>}
                    <td></td>
                  </tr>
                )}
                {!listOfBooks || listOfBooks.length === 0 ? (
                  <tr>
                    {show === true ? (
                      <td colSpan="8">Aucun livre</td>
                    ) : (
                      <td colSpan="7">Aucun livre</td>
                    )}
                  </tr>
                ) : (
                  listOfBooks
                    .filter(
                      (book) =>
                        book.author &&
                        book.author
                          .toLowerCase()
                          .includes(searchAuthor.toLowerCase()) &&
                        book.title &&
                        book.title
                          .toLowerCase()
                          .includes(searchTitle.toLowerCase()) &&
                        book.genre &&
                        book.genre
                          .toLowerCase()
                          .includes(searchGenre.toLowerCase())
                    )
                    .map((book) => (
                      <tr key={book._id}>
                        <th className="text-justify">{book.title}</th>
                        <td className="text-justify">{book.author}</td>
                        <td>{book.genre}</td>
                        {show === true && (
                          <td className="text-justify">{book.description}</td>
                        )}
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
                  {show === true && (
                    <>
                      <th scope="col">résumé</th>
                      <th scope="col">disponibilité</th>
                    </>
                  )}
                  <th scope="col">couverture</th>
                  {(user.role === "admin" || user.role === "superadmin") &&
                    show === true && (
                      <>
                        <th scope="col">emprunteur</th>
                        <th scope="col">action</th>
                      </>
                    )}
                </tr>
              </thead>
              <tbody>
                {show === true && (
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
                    {show === true && <td></td>}
                    <td></td>
                    {(user.role === "admin" || user.role === "superadmin") &&
                      show === true && (
                        <>
                          <td></td>
                          <td></td>
                        </>
                      )}
                  </tr>
                )}
                {!listOfBooks || listOfBooks.length === 0 ? (
                  <tr>
                    {show === true ? (
                      <td colSpan="8">Aucun livre</td>
                    ) : (
                      <td colSpan="4">Aucun livre</td>
                    )}
                  </tr>
                ) : (
                  filterdBooks.map((book) => (
                    <tr key={book._id}>
                      <th className="text-justify">{book.title}</th>
                      <td className="text-justify">{book.author}</td>
                      <td>{book.genre}</td>
                      {show === true && (
                        <td className="text-justify">{book.description}</td>
                      )}
                      {show === true && <td>{book.statut}</td>}
                      <td>
                        <img
                          src={book.imageData}
                          alt={book.title}
                          className="img-thumbnail"
                        />
                      </td>
                      {show === true && <td>{book.emprunteurName}</td>}
                      {(user.role === "admin" || user.role === "superadmin") &&
                        show === true && (
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

                {(user.role === "admin" || user.role === "superadmin") &&
                  show === true && (
                    <tr>
                      {selectedFile ? (
                        <>
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
                        </>
                      ) : (
                        <>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </>
                      )}
                      <td>
                        <input
                          type="file"
                          id="file"
                          accept="image/jpg, image/jpeg, image/png"
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
