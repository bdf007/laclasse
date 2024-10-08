import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { toast } from "react-toastify";
import PopupBook from "../component/popupBook";

//design
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import spin from "../assets/Spin.gif";

const Bibliotheque = () => {
  const { user } = useContext(UserContext);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [listOfBooks, setListOfBooks] = useState([]);
  const [listOfUsers, setListOfUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [searchTitle, setSearchTitle] = useState(
    localStorage.getItem("searchTitle") || ""
  );
  const [searchAuthor, setSearchAuthor] = useState(
    localStorage.getItem("searchAuthor") || ""
  );
  const [searchGenre, setSearchGenre] = useState(
    localStorage.getItem("searchGenre") || ""
  );
  const [searchStatus, setSearchStatus] = useState(
    localStorage.getItem("searchStatus") || ""
  );
  const [addNewBook, setAddNewBook] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [show, setShow] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);

  // get the list of the users
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

  // get the list of the books
  const getListOfBooks = async () => {
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/books/noimage`
      );

      // sort the book by author
      response.data.sort((a, b) => {
        if (a.author < b.author) {
          return -1;
        }
        if (a.author > b.author) {
          return 1;
        }
        return 0;
      });

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
    setIsLoading(false);
  };

  const openBookPopup = async (bookId) => {
    try {
      bookId = bookId._id;
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/book/${bookId}`
      );
      setSelectedBook(response.data);
      setIsPopupOpen(true);
    } catch (error) {
      console.log(error);
      toast.error("Erreur lors de la récupération du livre");
    }
  };

  // close the popup
  const closeBookPopup = () => {
    setSelectedBook(null);
    setIsPopupOpen(false);
  };

  // assign a user to a book
  const assignUserToBook = async (bookId) => {
    try {
      let emprunteurValue = selectedUser;

      // Get the book to update
      const book = listOfBooks.find((book) => book._id === bookId);

      // Check if selectedUser is "aucun" and set emprunteurValue to null
      if (selectedUser === "none") {
        emprunteurValue = null;
        book.statut = "disponible";
        book.firstname = null;
        book.lastname = null;
        await axios
          .put(`${process.env.REACT_APP_API_URL}/api/book/${bookId}`, {
            emprunteur: emprunteurValue,
            firstname: null,
            lastname: null,
            statut: "disponible",
          })
          .then(() => {
            toast.success("emprunteur assigné avec succès");
            // get the response from the server and update the book in the state
            getListOfBooks();
            setSelectedUser("");
          });
      } else {
        // Get the info of the selectedUser
        await axios
          .get(`${process.env.REACT_APP_API_URL}/api/user/${selectedUser}`)
          .then((res) => {
            book.firstname = res.data.firstname;
            book.lastname = res.data.lastname;
          });

        await axios
          .put(`${process.env.REACT_APP_API_URL}/api/book/${bookId}`, {
            emprunteur: emprunteurValue,
            firstname: book.firstname,
            lastname: book.lastname,
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

  const handleUploadBook = async () => {
    try {
      const fileReader = new FileReader();

      const base64Data = await new Promise((resolve, reject) => {
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.onerror = reject;
        fileReader.readAsDataURL(selectedFile);
      });

      // Convert the base64 image data to an Image object
      const image = new Image();
      image.src = base64Data;

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      // Set the maximum width or height for the resized image
      const maxWidth = 800;
      const maxHeight = 600;

      let newWidth = image.width;
      let newHeight = image.height;

      // Resize the image while maintaining the aspect ratio
      if (image.width > maxWidth) {
        newWidth = maxWidth;
        newHeight = (image.height * maxWidth) / image.width;
      }

      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = (image.width * maxHeight) / image.height;
      }

      // Create a canvas to draw the resized image
      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;

      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, newWidth, newHeight);

      // Convert the canvas content to base64 with WebP format
      const base64WebpData = canvas.toDataURL("image/webp");

      const bookData = {
        title,
        author,
        genre,
        description,
        imageData: base64WebpData,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/book`,
        bookData
      );

      getListOfBooks();
      toast.success("Livre ajouté avec succès");
      setListOfBooks((prevBooks) => [...prevBooks, response.data]);
      resetForm();
      setAddNewBook(false);
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

  const cancelEditing = () => {
    setAddNewBook(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setGenre("");
    setDescription("");
    setSelectedFile(null);
  };

  const resetFilters = () => {
    setSearchTitle("");
    setSearchAuthor("");
    setSearchGenre("");
    setSearchStatus("");
    localStorage.removeItem("searchTitle");
    localStorage.removeItem("searchAuthor");
    localStorage.removeItem("searchGenre");
    localStorage.removeItem("searchStatus");
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

  const handleSearchStatus = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setSearchStatus(value);
    localStorage.setItem("searchStatus", value);
  };

  // Scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const handleBookUpdate = () => {
    getListOfBooks();
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
    resetFilters();
    if (!user) {
      return;
    } else if (user.role === "admin" || user.role === "superadmin") {
      getListOfUsers();
    }
    //eslint-disable-next-line
  }, [setListOfBooks, setListOfUsers, user]);

  return isLoading ? (
    <div className="container">
      <div
        className="d-flex justify-content-center"
        style={{ paddingBottom: "12rem", paddingTop: "5rem" }}
      >
        <h2>Chargement de la Bibliothéque</h2>
        <span>
          <img
            src={spin}
            alt="loading"
            style={{ width: "3rem", height: "3rem" }}
          />
        </span>
      </div>
    </div>
  ) : (
    <div className="container " style={{ paddingBottom: "12rem" }}>
      <div className="row">
        <h1 className="mx-auto text-center">La bibliothéque de Stéphanie</h1>

        {(!user || user.role === "user") && (
          <div>
            {showSearch ? (
              <div className="d-flex justify-content-center">
                <CancelOutlinedIcon
                  onClick={() => {
                    setShowSearch(false);
                    resetFilters();
                  }}
                  style={{ fontSize: "3rem", cursor: "pointer" }}
                />
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <td colSpan="2" className="text-center">
                          Recherche
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-center">
                          <input
                            type="text"
                            placeholder="Titre"
                            className="form-control"
                            value={searchTitle}
                            onChange={handleSearchTitle}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Auteur"
                            className="form-control"
                            value={searchAuthor}
                            onChange={handleSearchAuthor}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <input
                            type="text"
                            placeholder="Genre"
                            className="form-control"
                            value={searchGenre}
                            onChange={handleSearchGenre}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="status"
                            className="form-control"
                            value={searchStatus}
                            onChange={handleSearchStatus}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="text-center">
                          <button
                            className="btn btn-warning"
                            onClick={resetFilters}
                          >
                            Reset
                          </button>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              setShowSearch(!showSearch);
                              resetFilters();
                            }}
                          >
                            annuler la recherche
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="d-flex justify-content-around">
                <SearchOutlinedIcon
                  onClick={() => {
                    setShowSearch(!showSearch);
                  }}
                  style={{ fontSize: "3rem", cursor: "pointer" }}
                />
              </div>
            )}
            <div className="table-responsive">
              <table className="table table-striped table-bordered table-hover">
                <thead>
                  <tr className="text-center">
                    {/* <th scope="col">Couverture</th> */}
                    <th scope="col">
                      <p className="text-bold">Titre</p>
                      {!show && <p className="fst-italic">Auteur</p>}
                    </th>
                    {show && <th scope="col">Auteur</th>}
                    <th scope="col">
                      <p>genre</p>
                    </th>
                    {show && <th scope="col">Résumé</th>}
                  </tr>
                </thead>
                <tbody>
                  {filterdBooks.map((book) => (
                    <tr key={book._id}>
                      {/* <td>
                       
                          <img
                            src={book.imageData}
                            alt={book.title}
                            className="img-thumbnail"
                            style={{ maxWidth: "200px", maxHeight: "200px" }}
                          />
                       
                      </td> */}

                      <th>
                        {" "}
                        <span
                          className="text-wrap"
                          onClick={() => openBookPopup(book)}
                          style={{ cursor: "pointer" }}
                        >
                          <h6 className="text-decoration-underline">
                            {book.title}
                          </h6>
                        </span>
                        {!show && book.author && (
                          <p className="fst-italic">par {book.author}</p>
                        )}
                      </th>
                      {show && <td>{book.author}</td>}
                      <td>{book.genre}</td>
                      {show && <td>{book.description}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {user && user.role === "student" && (
          <div>
            {showSearch ? (
              <div className="d-flex justify-content-center">
                <CancelOutlinedIcon
                  onClick={() => {
                    setShowSearch(false);
                    resetFilters();
                  }}
                  style={{ fontSize: "3rem", cursor: "pointer" }}
                />
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <td colSpan="2" className="text-center">
                          Recherche
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-center">
                          <input
                            type="text"
                            placeholder="Titre"
                            className="form-control"
                            value={searchTitle}
                            onChange={handleSearchTitle}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Auteur"
                            className="form-control"
                            value={searchAuthor}
                            onChange={handleSearchAuthor}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <input
                            type="text"
                            placeholder="Genre"
                            className="form-control"
                            value={searchGenre}
                            onChange={handleSearchGenre}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="status"
                            className="form-control"
                            value={searchStatus}
                            onChange={handleSearchStatus}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="text-center">
                          <button
                            className="btn btn-warning"
                            onClick={resetFilters}
                          >
                            Reset
                          </button>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              setShowSearch(!showSearch);
                              resetFilters();
                            }}
                          >
                            annuler la recherche
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="d-flex justify-content-around">
                <SearchOutlinedIcon
                  onClick={() => {
                    setShowSearch(!showSearch);
                  }}
                  style={{ fontSize: "3rem", cursor: "pointer" }}
                />
              </div>
            )}
            <div className="table-responsive">
              <table className="table table-striped table-bordered table-hover">
                <thead>
                  <tr className="text-center">
                    {/* <th scope="col">Couverture</th> */}
                    <th scope="col">
                      <p className="text-bold">Titre</p>
                      {!show && <p className="fst-italic">Auteur</p>}
                    </th>
                    {show && <th scope="col">Auteur</th>}
                    <th scope="col">
                      <p>genre</p>
                      {!show && <p className="fst-italic">emprunteur</p>}
                    </th>
                    {show && (
                      <>
                        {" "}
                        <th scope="col">Résumé</th>
                        <th scope="col">disponibilité</th>
                        <th scope="col">emprunteur</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filterdBooks.map((book) => (
                    <tr key={book._id}>
                      {/* <td>
                       
                          <img
                            src={book.imageData}
                            alt={book.title}
                            className="img-thumbnail"
                            style={{ maxWidth: "200px", maxHeight: "200px" }}
                          />
                       
                      </td> */}
                      <th>
                        {" "}
                        <span
                          className="text-wrap"
                          onClick={() => openBookPopup(book)}
                          style={{ cursor: "pointer" }}
                        >
                          <h6 className="text-decoration-underline">
                            {book.title}
                          </h6>
                        </span>
                        {!show && book.author && (
                          <p className="fst-italic">par {book.author}</p>
                        )}
                      </th>
                      {show && <td>{book.author}</td>}
                      <td>
                        <p>{book.genre}</p>
                        {!show && (
                          <p>
                            {book.firstname && book.lastname
                              ? `${book.firstname} ${book.lastname}`
                              : "aucun"}
                          </p>
                        )}
                      </td>
                      {show && (
                        <>
                          <td>{book.description}</td>
                          <td>{book.statut}</td>
                          <td>
                            {book.firstname && book.lastname
                              ? `${book.firstname} ${book.lastname}`
                              : "aucun"}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {user && (user.role === "admin" || user.role === "superadmin") && (
          <div>
            <div className="col-12 col-md-6 mx-auto ">
              <div className="d-flex justify-content-around">
                {addNewBook ? (
                  <div className="row">
                    <CancelOutlinedIcon
                      onClick={() => cancelEditing()}
                      style={{ fontSize: "3rem", cursor: "pointer" }}
                    />
                    <form>
                      {selectedFile && (
                        <>
                          <div className="form-group">
                            <label htmlFor="title">Titre</label>
                            <input
                              id="title"
                              type="text"
                              placeholder="Titre"
                              className="form-control"
                              value={title}
                              onChange={handleTitleChange}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="author">Auteur</label>
                            <input
                              id="author"
                              type="text"
                              placeholder="Auteur"
                              className="form-control"
                              value={author}
                              onChange={handleAuthorChange}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="genre">Genre</label>
                            <input
                              id="genre"
                              type="text"
                              placeholder="Genre"
                              className="form-control"
                              value={genre}
                              onChange={handleGenreChange}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="description">Résumé</label>
                            <textarea
                              id="description"
                              type="text"
                              placeholder="Résumé"
                              className="form-control"
                              value={description}
                              onChange={handleDescriptionChange}
                            />
                          </div>
                        </>
                      )}
                      {!selectedFile && (
                        <div className="form-group">
                          <label htmlFor="image">Image</label>
                          <input
                            id="image"
                            type="file"
                            className="form-control"
                            onChange={handleFileInputChange}
                          />
                        </div>
                      )}
                      <div className="d-flex justify-content-around">
                        {selectedFile && (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleUploadBook}
                          >
                            Sauvegarder
                          </button>
                        )}
                        <button
                          className="btn btn-warning"
                          onClick={() => cancelEditing()}
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  !showSearch && (
                    <div>
                      <AddCircleOutlineOutlinedIcon
                        onClick={() => {
                          setAddNewBook(!addNewBook);
                          setShowSearch(false);
                        }}
                        style={{ fontSize: "3rem", cursor: "pointer" }}
                      />
                    </div>
                  )
                )}
                {showSearch ? (
                  <div>
                    <CancelOutlinedIcon
                      onClick={() => {
                        setShowSearch(false);
                        resetFilters();
                      }}
                      style={{ fontSize: "3rem", cursor: "pointer" }}
                    />
                    <div className="table-responsive">
                      <table>
                        <thead>
                          <tr>
                            <td colSpan="2" className="text-center">
                              Recherche
                            </td>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-center">
                              <input
                                type="text"
                                placeholder="Titre"
                                className="form-control"
                                value={searchTitle}
                                onChange={handleSearchTitle}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="Auteur"
                                className="form-control"
                                value={searchAuthor}
                                onChange={handleSearchAuthor}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <input
                                type="text"
                                placeholder="Genre"
                                className="form-control"
                                value={searchGenre}
                                onChange={handleSearchGenre}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="status"
                                className="form-control"
                                value={searchStatus}
                                onChange={handleSearchStatus}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="text-center">
                              <button
                                className="btn btn-warning"
                                onClick={resetFilters}
                              >
                                Reset
                              </button>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-danger"
                                onClick={() => {
                                  setShowSearch(!showSearch);
                                  resetFilters();
                                }}
                              >
                                annuler la recherche
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  !addNewBook && (
                    <div className="d-flex justify-content-around">
                      <SearchOutlinedIcon
                        onClick={() => {
                          setShowSearch(!showSearch);
                          cancelEditing();
                        }}
                        style={{ fontSize: "3rem", cursor: "pointer" }}
                      />
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-bordered table-hover">
                <thead>
                  <tr className="text-center">
                    {/* <th scope="col">Couverture</th> */}
                    <th scope="col">
                      <p className="text-bold">Titre</p>
                      {!show && <p className="fst-italic">Auteur</p>}
                    </th>
                    {show && <th scope="col">Auteur</th>}
                    <th scope="col">
                      <p>genre</p>
                      {!show && <p className="fst-italic">emprunteur</p>}
                    </th>
                    {show && (
                      <>
                        <th scope="col">Résumé</th>
                        <th scope="col">Action</th>
                        <th scope="col">disponibilité</th>
                        <th scope="col">emprunteur</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filterdBooks.map((book) => (
                    <tr key={book._id}>
                      {/* <td>
                       
                          <img
                            src={book.imageData}
                            alt={book.title}
                            className="img-thumbnail"
                            style={{ maxWidth: "200px", maxHeight: "200px" }}
                          />
                       
                      </td> */}
                      <th>
                        {" "}
                        <span
                          className="text-wrap"
                          onClick={() => openBookPopup(book)}
                          style={{ cursor: "pointer" }}
                        >
                          <h6 className="text-decoration-underline">
                            {book.title}
                          </h6>
                        </span>
                        {!show && book.author && (
                          <p className="fst-italic">par {book.author}</p>
                        )}
                      </th>
                      {show && <td>{book.author}</td>}
                      <td>
                        <p>{book.genre}</p>
                        {!show && (
                          <p>
                            {book.firstname} {book.lastname}
                            <br />
                            <select
                              className="form-select"
                              aria-label="Default select example"
                              value={selectedUser}
                              onChange={(e) => setSelectedUser(e.target.value)}
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
                          </p>
                        )}
                      </td>
                      {show && (
                        <>
                          <td>{book.description}</td>

                          <td>
                            <button
                              className="btn btn-danger"
                              onClick={() => deleteBookById(book._id)}
                            >
                              Supprimer
                            </button>
                          </td>
                          <td>{book.statut}</td>

                          <td>
                            {book.firstname} {book.lastname}
                            <br />
                            <select
                              className="form-select"
                              aria-label="Default select example"
                              value={selectedUser}
                              onChange={(e) => setSelectedUser(e.target.value)}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <button className="scroll-to-top" onClick={scrollToTop}>
        <ArrowUpwardIcon />
      </button>
      {isPopupOpen && selectedBook && (
        <PopupBook
          book={selectedBook}
          onClose={closeBookPopup}
          user={user}
          onUpdate={handleBookUpdate}
        />
      )}
    </div>
  );
};

export default Bibliotheque;
