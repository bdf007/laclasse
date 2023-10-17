import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { toast } from "react-toastify";

//design
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

const Vinotheque = () => {
  const { user } = useContext(UserContext);
  const [nomDuChateau, setNomDuChateau] = useState("");
  const [year, setYear] = useState("");
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
  const [addNewWine, setAddNewWine] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchCastle, setSearchCastle] = useState(
    localStorage.getItem("searchCastle") || ""
  );
  const [searchYear, setSearchYear] = useState(
    localStorage.getItem("searchYear") || ""
  );
  const [searchRegion, setSearchRegion] = useState(
    localStorage.getItem("searchRegion") || ""
  );
  const [searchCountry, setSearchCountry] = useState(
    localStorage.getItem("searchCountry") || ""
  );
  const [searchType, setSearchType] = useState(
    localStorage.getItem("searchType") || ""
  );
  const [searchWhereIFindIt, setSearchWhereIFindIt] = useState(
    localStorage.getItem("searchWhereIFindIt") || ""
  );
  const [searchPriceMin, setSearchPriceMin] = useState(
    localStorage.getItem("searchPriceMin") || ""
  );
  const [searchPriceMax, setSearchPriceMax] = useState(
    localStorage.getItem("searchPriceMax") || ""
  );
  const [searchQuantityMin, setSearchQuantityMin] = useState(
    localStorage.getItem("searchQuantityMin") || ""
  );
  const [searchQuantityMax, setSearchQuantityMax] = useState(
    localStorage.getItem("searchQuantityMax") || ""
  );
  const [searchLiterage, setSearchLiterage] = useState(
    localStorage.getItem("searchLiterage") || ""
  );
  const [searchComments, setSearchComments] = useState(
    localStorage.getItem("searchComments") || ""
  );
  const [searchAddedAt, setSearchAddedAt] = useState(
    localStorage.getItem("searchAddedAt") || ""
  );
  //get the size of the window
  const [width, setWidth] = useState(window.innerWidth);
  // eslint-disable-next-line
  const [show, setShow] = useState(true);

  const getListOfWines = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/wines`
      );
      setListOfWines(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Erreur lors de la récupération des vins");
    }
  };

  const handleSearchCastle = (e) => {
    setSearchCastle(e.target.value);
    localStorage.setItem("searchCastle", e.target.value);
  };

  const handleSearchYear = (e) => {
    setSearchYear(e.target.value);
    localStorage.setItem("searchYear", e.target.value);
  };

  const handleSearchRegion = (e) => {
    setSearchRegion(e.target.value);
    localStorage.setItem("searchRegion", e.target.value);
  };

  const handleSearchCountry = (e) => {
    setSearchCountry(e.target.value);
    localStorage.setItem("searchCountry", e.target.value);
  };

  const handleSearchType = (e) => {
    setSearchType(e.target.value);
    localStorage.setItem("searchType", e.target.value);
  };

  const handleSearchWhereIFindIt = (e) => {
    setSearchWhereIFindIt(e.target.value);
    localStorage.setItem("searchWhereIFindIt", e.target.value);
  };

  const handleSearchPriceMin = (e) => {
    setSearchPriceMin(e.target.value);
    localStorage.setItem("searchPriceMin", e.target.value);
  };
  const handleSearchPriceMax = (e) => {
    setSearchPriceMax(e.target.value);
    localStorage.setItem("searchPriceMax", e.target.value);
  };

  const handleSearchQuantityMin = (e) => {
    setSearchQuantityMin(e.target.value);
    localStorage.setItem("searchQuantityMin", e.target.value);
  };

  const handleSearchQuantityMax = (e) => {
    setSearchQuantityMax(e.target.value);
    localStorage.setItem("searchQuantityMax", e.target.value);
  };

  const handleSearchLiterage = (e) => {
    setSearchLiterage(e.target.value);
    localStorage.setItem("searchLiterage", e.target.value);
  };

  const handleSearchComments = (e) => {
    setSearchComments(e.target.value);
    localStorage.setItem("searchComments", e.target.value);
  };

  const handleSearchAddedAt = (e) => {
    setSearchAddedAt(e.target.value);
    localStorage.setItem("searchAddedAt", e.target.value);
  };

  const handleNomDuChateau = (e) => {
    setNomDuChateau(e.target.value);
  };

  const handleYear = (e) => {
    setYear(e.target.value);
  };

  const handleRegion = (e) => {
    setRegion(e.target.value);
  };

  const handleCountry = (e) => {
    setCountry(e.target.value);
  };

  const handleTypeDeVin = (e) => {
    setTypeDeVin(e.target.value);
  };

  const handleWhereIFindIt = (e) => {
    setWhereIFindIt(e.target.value);
  };

  const handlePrice = (e) => {
    setPrice(e.target.value);
  };

  const handleQuantity = (e) => {
    setQuantity(e.target.value);
  };

  const handleLiterage = (e) => {
    setLiterage(e.target.value);
  };

  const handleComments = (e) => {
    setComments(e.target.value);
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
          nomDuChateau,
          year,
          region,
          country,
          typeDeVin,
          whereIFindIt,
          price,
          quantity,
          literage,
          comments,
          pictureData: base64Data,
        };

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/wine`,
          wineData
        );
        getListOfWines();
        toast.success("Vin ajouté avec succès");
        setListOfWines((prevWines) => [...prevWines, response.data]);
      };
      resetForm();
    } catch (error) {
      toast.error("Erreur lors de l'ajout du vin");
    }
  };

  const deleteWineById = async (id) => {
    try {
      // check if quantity is 0
      const wine = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/wine/${id}`
      );
      if (wine.data.quantity > 0) {
        toast.error("Vous possédez encore des bouteilles de ce vin");
        return;
      }
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/wine/${id}`);
      toast.success("Vin supprimé avec succès");
      setListOfWines(listOfWines.filter((wine) => wine._id !== id));
    } catch (error) {
      toast.error("Erreur lors de la suppression du vin");
    }
  };

  const cancelEditing = () => {
    setAddNewWine(false);
    resetForm();
  };

  const resetForm = () => {
    setAddNewWine(false);
    setNomDuChateau("");
    setYear("");
    setRegion("");
    setCountry("");
    setTypeDeVin("");
    setWhereIFindIt("");
    setPrice("");
    setQuantity("");
    setLiterage("Bouteille - 0.75 l");
    setComments("");
    setSelectedFile(null);
    resetFilter();
  };

  const resetFilter = () => {
    setSearchCastle("");
    setSearchYear("");
    setSearchRegion("");
    setSearchCountry("");
    setSearchType("");
    setSearchWhereIFindIt("");
    setSearchPriceMin("");
    setSearchPriceMax("");
    setSearchQuantityMin("");
    setSearchQuantityMax("");
    setSearchLiterage("");
    setSearchComments("");
    setSearchAddedAt("");
  };

  // Filter condition that checks if the properties exist before calling toLowerCase()
  const filteredWines = listOfWines.filter((wine) => {
    const matchesSearchCastle =
      !searchCastle ||
      (wine.nomDuChateau &&
        wine.nomDuChateau.toLowerCase().includes(searchCastle.toLowerCase()));
    const matchesSearchYear =
      !searchYear || (wine.year && wine.year.toString().includes(searchYear));
    const matchesSearchRegion =
      !searchRegion ||
      (wine.region &&
        wine.region.toLowerCase().includes(searchRegion.toLowerCase()));
    const matchesSearchCountry =
      !searchCountry ||
      (wine.country &&
        wine.country.toLowerCase().includes(searchCountry.toLowerCase()));
    const matchesSearchType =
      !searchType ||
      (wine.typeDeVin &&
        wine.typeDeVin.toLowerCase().includes(searchType.toLowerCase()));
    const matchesSearchWhereIFindIt =
      !searchWhereIFindIt ||
      (wine.whereIFindIt &&
        wine.whereIFindIt
          .toLowerCase()
          .includes(searchWhereIFindIt.toLowerCase()));
    const matchesSearchPriceMin =
      !searchPriceMin || (wine.price && wine.price >= searchPriceMin);
    const matchesSearchPriceMax =
      !searchPriceMax || (wine.price && wine.price <= searchPriceMax);
    const matchesSearchQuantityMin =
      !searchQuantityMin ||
      (wine.quantity && wine.quantity >= searchQuantityMin);
    const matchesSearchQuantityMax =
      !searchQuantityMax ||
      (wine.quantity && wine.quantity <= searchQuantityMax);
    const matchesSearchLiterage =
      !searchLiterage ||
      (wine.literage &&
        wine.literage.toLowerCase().includes(searchLiterage.toLowerCase()));
    const matchesSearchComments =
      !searchComments ||
      (wine.comments &&
        wine.comments.toLowerCase().includes(searchComments.toLowerCase()));
    const matchesSearchAddedAt =
      !searchAddedAt ||
      (new Date(wine.date) &&
        new Date(wine.date)
          .toLocaleDateString("fr-FR")
          .includes(searchAddedAt));

    // Return true if the wine matches all the filter criteria, or false otherwise
    return (
      matchesSearchCastle &&
      matchesSearchYear &&
      matchesSearchRegion &&
      matchesSearchCountry &&
      matchesSearchType &&
      matchesSearchWhereIFindIt &&
      matchesSearchPriceMin &&
      matchesSearchPriceMax &&
      matchesSearchQuantityMin &&
      matchesSearchQuantityMax &&
      matchesSearchLiterage &&
      matchesSearchComments &&
      matchesSearchAddedAt
    );
  });

  // Now you can map the filteredWines to display them in the table

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
    resetFilter();
    getListOfWines();

    //eslint-disable-next-line
  }, [setListOfWines]);

  return !user || user.role === "user" || user.role === "student" ? (
    <div
      className="d-flex justify-content-center"
      style={{ paddingTop: "5rem" }}
    >
      <h2>Vous n'avez pas accès à cette page</h2>
    </div>
  ) : (
    (user.role === "AdminVin" ||
      user.role === "superadmin" ||
      user.role === "admin") && (
      <div className="container " style={{ paddingBottom: "12rem" }}>
        <div className="row">
          <h1 className="mx-auto text-center">La cave d'alexis</h1>
          <div>
            <div className="col-12 col-md-6 mx-auto ">
              <div className="d-flex justify-content-around">
                {addNewWine ? (
                  <>
                    <CancelOutlinedIcon
                      onClick={() => cancelEditing()}
                      style={{ fontSize: "3rem", cursor: "pointer" }}
                    />

                    <form>
                      {selectedFile && (
                        <>
                          <div className="form-group">
                            <label htmlFor="chateau">Nom du Vin*</label>
                            <input
                              type="text"
                              className="form-control"
                              id="chateau"
                              placeholder="Nom du chateau"
                              value={nomDuChateau}
                              onChange={handleNomDuChateau}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="year">Année</label>
                            <input
                              type="number"
                              className="form-control"
                              id="year"
                              placeholder="Année"
                              value={year}
                              onChange={handleYear}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="region">Région</label>
                            <input
                              type="text"
                              className="form-control"
                              id="region"
                              placeholder="Région"
                              value={region}
                              onChange={handleRegion}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="country">Pays</label>
                            <input
                              type="text"
                              className="form-control"
                              id="country"
                              placeholder="Pays"
                              value={country}
                              onChange={handleCountry}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="type">Type de vin</label>
                            <input
                              type="text"
                              className="form-control"
                              id="type"
                              placeholder="Type de vin"
                              value={typeDeVin}
                              onChange={handleTypeDeVin}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="whereIFindIt">Ou je l'ai eu</label>
                            <input
                              type="text"
                              className="form-control"
                              id="whereIFindIt"
                              placeholder="Ou je l'ai eu"
                              value={whereIFindIt}
                              onChange={handleWhereIFindIt}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="price">Prix</label>
                            <input
                              type="number"
                              className="form-control"
                              id="price"
                              placeholder="Prix"
                              value={price}
                              onChange={handlePrice}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="quantity">Quantité</label>
                            <input
                              type="number"
                              className="form-control"
                              id="quantity"
                              placeholder="Quantité"
                              value={quantity}
                              onChange={handleQuantity}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="literage">Litres</label>
                            <select
                              className="form-control"
                              id="literage"
                              value={literage}
                              onChange={handleLiterage}
                            >
                              <option>Picola - 0.20 l</option>
                              <option>Chopine ou quart - 0.25 l</option>
                              <option>Fillette - 0.375 l</option>
                              <option>Medium - 0.5 l</option>
                              <option>Bouteille - 0.75 l</option>
                              <option>Magnum - 1.5 l</option>
                              <option>Jeroboam - 3 l</option>
                              <option>Mathusalem - 6 l</option>
                              <option>Salamanzar - 9 l</option>
                              <option>Balthazar - 12 l</option>
                              <option>Nabuchodonosor - 15 l</option>
                              <option>Melchior ou Salomon - 18 l</option>
                              <option>Souverain - 26,25 l</option>
                              <option>Primat - 27 l</option>
                              <option>Midas ou Melchizedek - 30 l</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label htmlFor="comments">Commentaires</label>
                            <textarea
                              className="form-control"
                              id="comments"
                              rows="3"
                              value={comments}
                              onChange={handleComments}
                            ></textarea>
                          </div>
                          <div className="text-center">
                            * : champ obligatoire
                          </div>
                        </>
                      )}
                      <div className="form-group">
                        <label htmlFor="file">Etiquette</label>
                        <input
                          type="file"
                          className="form-control-file"
                          id="file"
                          onChange={handleFileInputChange}
                        />
                      </div>
                      <div className="d-flex justify-content-around">
                        {selectedFile && (
                          <button
                            type="submit"
                            className="btn btn-primary"
                            onClick={handleUploadWine}
                            disabled={!nomDuChateau}
                          >
                            Ajouter
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
                  </>
                ) : (
                  showSearch === false && (
                    <AddCircleOutlineOutlinedIcon
                      onClick={() => {
                        setAddNewWine(!addNewWine);
                        setShowSearch(false);
                      }}
                      style={{ fontSize: "3rem", cursor: "pointer" }}
                    />
                  )
                )}
                {showSearch ? (
                  <div className="d-flex justify-content-around ">
                    <CancelOutlinedIcon
                      onClick={() => setShowSearch(!showSearch)}
                      style={{ fontSize: "3rem", cursor: "pointer" }}
                    />
                    <div className="table-responsive">
                      {/* Search input fields */}
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
                            <td colSpan="2" className="text-center">
                              <input
                                type="text"
                                value={searchCastle}
                                placeholder="recherche par chateau"
                                onChange={handleSearchCastle}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <input
                                type="number"
                                value={searchYear}
                                placeholder="recherche par année"
                                onChange={handleSearchYear}
                              />
                            </td>

                            <td>
                              <input
                                type="text"
                                value={searchRegion}
                                placeholder="recherche par région"
                                onChange={handleSearchRegion}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <input
                                type="text"
                                value={searchCountry}
                                placeholder="recherche par pays"
                                onChange={handleSearchCountry}
                              />
                            </td>

                            <td>
                              <input
                                type="text"
                                value={searchType}
                                placeholder="recherche par type"
                                onChange={handleSearchType}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <input
                                type="text"
                                value={searchWhereIFindIt}
                                placeholder="recherche par lieu"
                                onChange={handleSearchWhereIFindIt}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={searchLiterage}
                                placeholder="recherche par litres"
                                onChange={handleSearchLiterage}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <input
                                type="number"
                                value={searchPriceMin}
                                placeholder="Prix supérieur ou égal à"
                                onChange={handleSearchPriceMin}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={searchPriceMax}
                                placeholder="Prix inférieur ou égal à"
                                onChange={handleSearchPriceMax}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <input
                                type="number"
                                value={searchQuantityMin}
                                placeholder="nb de bouteilles supérieur ou égal à"
                                onChange={handleSearchQuantityMin}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={searchQuantityMax}
                                placeholder="nb de bouteilles inférieur ou égal à"
                                onChange={handleSearchQuantityMax}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <input
                                type="text"
                                value={searchComments}
                                placeholder="recherche par commentaires"
                                onChange={handleSearchComments}
                              />
                            </td>

                            <td>
                              <input
                                type="text"
                                value={searchAddedAt}
                                placeholder="recherche par date"
                                onChange={handleSearchAddedAt}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="text-center">
                              <button
                                className="btn btn-danger"
                                onClick={() => setShowSearch(!showSearch)}
                              >
                                annuler la recherche
                              </button>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-warning"
                                onClick={resetFilter}
                              >
                                reset Filter
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  addNewWine === false && (
                    <SearchOutlinedIcon
                      onClick={() => {
                        setShowSearch(!showSearch);
                        cancelEditing();
                      }}
                      style={{ fontSize: "3rem", cursor: "pointer" }}
                    />
                  )
                )}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 mx-auto "></div>
        </div>
        <div className="table-responsive">
          {/* Search input fields */}
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr className="text-center">
                <th scope="col">Etiquette</th>
                <th scope="col">Nom</th>
                <th scope="col">année</th>
                <th scope="col">Région</th>

                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredWines.map((wine) => (
                <tr key={wine._id}>
                  <td>
                    <Link to={`/BouteilleDeVin/${wine._id}`}>
                      <img
                        src={wine.pictureData}
                        alt={wine.nomDuChateau}
                        className="img-thumbnail img-fluid"
                        style={{ maxHeight: "10rem" }}
                      />
                    </Link>
                  </td>
                  <td>{wine.nomDuChateau}</td>
                  <td>{wine.year}</td>
                  <td>{wine.region}</td>

                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteWineById(wine._id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  );
};

export default Vinotheque;
