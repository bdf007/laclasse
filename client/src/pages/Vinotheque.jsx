import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { toast } from "react-toastify";

const Vinotheque = () => {
  const { user } = useContext(UserContext);
  const [nomDuChateau, setNomDuChateau] = useState("");
  const [year, setYear] = useState(1800);
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [typeDeVin, setTypeDeVin] = useState("");
  const [whereIFindIt, setWhereIFindIt] = useState("");
  const [price, setPrice] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [literage, setLiterage] = useState("Bouteille - 0.75 l");
  const [comments, setComments] = useState("");
  const [listOfWines, setListOfWines] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [searchCastle, setSearchCastle] = useState(
    localStorage.getItem("searchCastle") || ""
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

  const getListOfWines = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/wines`
      );

      // Create an array of promises to fetch user data for all wines

      // Wait for all user data fetching promises to resolve
      const updatedWines = await Promise.all(response);

      // Set the list of wines with the updated data
      setListOfWines(updatedWines);
    } catch (error) {
      console.log(error);
      toast.error("Erreur lors de la récupération des vins");
    }
  };

  const assignUserToWine = async (wineId) => {
    try {
      let emprunteurValue = selectedUser;

      // Get the wine to update
      const wine = listOfWines.find((wine) => wine._id === wineId);

      // Check if selectedUser is "aucun" and set emprunteurValue to null
      if (selectedUser === "none") {
        emprunteurValue = null;
        wine.statut = "disponible";
        await axios
          .put(`${process.env.REACT_APP_API_URL}/api/wine/${wineId}`, {
            emprunteur: emprunteurValue,
            statut: "disponible",
          })
          .then(() => {
            toast.success("emprunteur assigné avec succès");
            // get the response from the server and update the wine in the state
            getListOfWines();
            setSelectedUser("");
          });
      } else {
        await axios
          .put(`${process.env.REACT_APP_API_URL}/api/wine/${wineId}`, {
            emprunteur: emprunteurValue,
            statut: "emprunté",
          })
          .then(() => {
            toast.success("emprunteur assigné avec succès");
            // get the response from the server and update the wine in the state
            getListOfWines();
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

  const handleCastleChange = (e) => {
    setCastle(e.target.value);
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

  const handleUploadWine = () => {
    try {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(selectedFile);

      fileReader.onload = async () => {
        const base64Data = fileReader.result;

        const wineData = {
          title,
          author,
          genre,
          description,
          imageData: base64Data,
        };

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/wine`,
          wineData
        );
        toast.success("Vin ajouté avec succès");
        setListOfWines((prevWines) => [...prevWines, response.data]);
      };
      resetForm();
      window.location.reload();
    } catch (error) {
      toast.error("Erreur lors de l'ajout du vin");
    }
  };

  const deleteWineById = async (id) => {
    try {
      // check if the wine is emprunté
      const wine = listOfWines.find((wine) => wine._id === id);
      if (wine.statut === "emprunté") {
        toast.error("Ce vin est emprunté, vous ne pouvez pas le supprimer");
        return;
      }
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/wine/${id}`);
      toast.success("Vin supprimé avec succès");
      setListOfWines(listOfWines.filter((wine) => wine._id !== id));
    } catch (error) {
      toast.error("Erreur lors de la suppression du vin");
    }
  };

  const resetForm = () => {
    setTitle("");
    setCastle("");
    setGenre("");
    setDescription("");
    setSelectedFile(null);
    setSearchCastle("");
    setSearchTitle("");
    setSearchGenre("");
    // clear input file
    document.getElementById("file").value = null;
    document.getElementById("title").value = "";
    document.getElementById("author").value = "";
    document.getElementById("genre").value = "";
    document.getElementById("description").value = "";
  };

  const handleSearchCastle = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setSearchCastle(value);
    localStorage.setItem("searchCastle", value);
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
    getListOfWines();

    //eslint-disable-next-line
  }, [setListOfWines, user]);

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
                        value={searchCastle}
                        placeholder="recherche par auteur"
                        onChange={handleSearchCastle}
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
                {!listOfWines || listOfWines.length === 0 ? (
                  <tr>
                    {show === true ? (
                      <td colSpan="8">Aucun vin</td>
                    ) : (
                      <td colSpan="7">Aucun vin</td>
                    )}
                  </tr>
                ) : (
                  listOfWines
                    .filter(
                      (wine) =>
                        wine.author &&
                        wine.author
                          .toLowerCase()
                          .includes(searchCastle.toLowerCase()) &&
                        wine.title &&
                        wine.title
                          .toLowerCase()
                          .includes(searchTitle.toLowerCase()) &&
                        wine.genre &&
                        wine.genre
                          .toLowerCase()
                          .includes(searchGenre.toLowerCase())
                    )
                    .map((wine) => (
                      <tr key={wine._id}>
                        <th className="text-justify">{wine.title}</th>
                        <td className="text-justify">{wine.author}</td>
                        <td>{wine.genre}</td>
                        {show === true && (
                          <td className="text-justify">{wine.description}</td>
                        )}
                        <td>
                          <img
                            src={wine.imageData}
                            alt={wine.title}
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
                        value={searchCastle}
                        placeholder="recherche par auteur"
                        onChange={handleSearchCastle}
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
                {!listOfWines || listOfWines.length === 0 ? (
                  <tr>
                    {show === true ? (
                      <td colSpan="8">Aucun vin</td>
                    ) : (
                      <td colSpan="4">Aucun vin</td>
                    )}
                  </tr>
                ) : (
                  listOfWines
                    .filter(
                      (wine) =>
                        wine.author
                          .toLowerCase()
                          .includes(searchCastle.toLowerCase()) &&
                        wine.title
                          .toLowerCase()
                          .includes(searchTitle.toLowerCase()) &&
                        wine.genre
                          .toLowerCase()
                          .includes(searchGenre.toLowerCase())
                    )
                    .map((wine) => (
                      <tr key={wine._id}>
                        <th className="text-justify">{wine.title}</th>
                        <td className="text-justify">{wine.author}</td>
                        <td>{wine.genre}</td>
                        {show === true && (
                          <td className="text-justify">{wine.description}</td>
                        )}
                        {show === true && <td>{wine.statut}</td>}
                        <td>
                          <img
                            src={wine.imageData}
                            alt={wine.title}
                            className="img-thumbnail"
                          />
                        </td>
                        {show === true && <td>{wine.emprunteur}</td>}
                        {(user.role === "admin" ||
                          user.role === "superadmin") &&
                          show === true && (
                            <>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() => deleteWineById(wine._id)}
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
                                  <option value="">
                                    Choisir un emprunteur
                                  </option>
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
                                  onClick={() => assignUserToWine(wine._id)}
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
                              onChange={handleCastleChange}
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
                          onClick={handleUploadWine}
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

export default Vinotheque;
