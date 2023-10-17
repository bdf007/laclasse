import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const WineAbout = () => {
  const [wine, setWine] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingWineId, setEditingWineId] = useState(null);
  const [updatedNomDuChateau, setUpdatedNomDuChateau] = useState("");
  const [updatedYear, setUpdatedYear] = useState("");
  const [updatedRegion, setUpdatedRegion] = useState("");
  const [updatedCountry, setUpdatedCountry] = useState("");
  const [updatedTypeDeVin, setUpdatedTypeDeVin] = useState("");
  const [updatedWhereIFindIt, setUpdatedWhereIFindIt] = useState("");
  const [updatedPrice, setUpdatedPrice] = useState("");
  const [updatedQuantity, setUpdatedQuantity] = useState("");
  const [updatedLiterage, setUpdatedLiterage] = useState("");
  const [updatedComments, setUpdatedComments] = useState("");

  // Get wineId from URL
  const wineId = window.location.pathname.split("/")[2];

  // get wine details from API

  const getWine = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/wine/${wineId}`
      );

      setWine(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const UpdateWine = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/wine/${editingWineId}`,
        {
          nomDuChateau: updatedNomDuChateau,
          year: updatedYear,
          region: updatedRegion,
          country: updatedCountry,
          typeDeVin: updatedTypeDeVin,
          whereIFindIt: updatedWhereIFindIt,
          price: updatedPrice,
          quantity: updatedQuantity,
          literage: updatedLiterage,
          comments: updatedComments,
        }
      );
      setEditing(false);
      getWine();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteWine = async () => {
    try {
      // check if quantity is 0
      if (wine.quantity > 0) {
        toast.error("Vous possédez encore des bouteilles de ce vin");
        return;
      }

      await axios.delete(`${process.env.REACT_APP_API_URL}/api/wine/${wineId}`);
      setEditing(false);
      // go the wine list
      window.location.href = "/Vinotheque";
    } catch (error) {
      console.log(error);
    }
  };

  const startEditingWine = (
    wineId,
    nomDuChateau,
    year,
    region,
    country,
    typeDeVin,
    whereIFindIt,
    price,
    quantity,
    literage,
    comments
  ) => {
    setEditing(true);
    setEditingWineId(wineId);
    setUpdatedNomDuChateau(nomDuChateau);
    setUpdatedYear(year);
    setUpdatedRegion(region);
    setUpdatedCountry(country);
    setUpdatedTypeDeVin(typeDeVin);
    setUpdatedWhereIFindIt(whereIFindIt);
    setUpdatedPrice(price);
    setUpdatedQuantity(quantity);
    setUpdatedLiterage(literage);
    setUpdatedComments(comments);
  };

  useEffect(() => {
    getWine();
    //eslint-disable-next-line
  }, [setWine]);

  return !wine ? (
    <div
      className="d-flex justify-content-center"
      style={{ paddingTop: "5rem" }}
    >
      <h2>Chargement...</h2>
    </div>
  ) : (
    <div
      className="container"
      style={{ paddingBottom: "15rem", paddingTop: "5rem" }}
    >
      {editing ? (
        <div className="d-flex justify-content-center">
          <h2>
            Nom :
            <input
              type="text"
              value={updatedNomDuChateau}
              onChange={(e) => setUpdatedNomDuChateau(e.target.value)}
            />
          </h2>
        </div>
      ) : (
        <div className="d-flex justify-content-center">
          <h2>{wine.nomDuChateau}</h2>
        </div>
      )}
      <div className="row">
        <div className="col-6">
          <img
            src={wine.pictureData}
            alt={wine.nomDuChateau}
            className="img-fluid"
          />
        </div>
        {editing ? (
          <div className="col-6">
            <p>
              Année :
              <input
                type="number"
                value={updatedYear}
                onChange={(e) => setUpdatedYear(e.target.value)}
              />
            </p>
            <p>
              Région :
              <input
                type="text"
                value={updatedRegion}
                onChange={(e) => setUpdatedRegion(e.target.value)}
              />
            </p>
            <p>
              Pays :
              <input
                type="text"
                value={updatedCountry}
                onChange={(e) => setUpdatedCountry(e.target.value)}
              />
            </p>
            <p>
              Type de vin :
              <input
                type="text"
                value={updatedTypeDeVin}
                onChange={(e) => setUpdatedTypeDeVin(e.target.value)}
              />
            </p>
            <p>
              Je l'ai eu :
              <input
                type="text"
                value={updatedWhereIFindIt}
                onChange={(e) => setUpdatedWhereIFindIt(e.target.value)}
              />
            </p>
            <p>
              Prix :
              <input
                type="number"
                value={updatedPrice}
                onChange={(e) => setUpdatedPrice(e.target.value)}
              />
            </p>
            <p>
              Quantité :
              <input
                type="number"
                value={updatedQuantity}
                onChange={(e) => setUpdatedQuantity(e.target.value)}
              />
            </p>
            <p>
              Contenant :
              <select
                className="form-control"
                id="literage"
                value={updatedLiterage}
                onChange={(e) => setUpdatedLiterage(e.target.value)}
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
            </p>
            <p>
              Commentaire :
              <textarea
                type="text"
                value={updatedComments}
                onChange={(e) => setUpdatedComments(e.target.value)}
              />
            </p>
            <button className="btn btn-success" onClick={UpdateWine}>
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
            <p>Année: {wine.year}</p>
            <p>Région: {wine.region}</p>
            <p>Pays: {wine.country}</p>
            <p>Type de vin: {wine.typeDeVin}</p>
            <p>Je l'ai eu: {wine.whereIFindIt}</p>
            <p>Prix: {wine.price}</p>
            <p>Quantité: {wine.quantity}</p>
            <p>Contenant: {wine.literage}</p>
            <div>
              Commentaire: <pre>{wine.comments}</pre>
            </div>
            <p>Ajouté le {new Date(wine.date).toLocaleDateString("fr-FR")}</p>
            <button
              className="btn btn-warning"
              onClick={() =>
                startEditingWine(
                  wineId,
                  wine.nomDuChateau,
                  wine.year,
                  wine.region,
                  wine.country,
                  wine.typeDeVin,
                  wine.whereIFindIt,
                  wine.price,
                  wine.quantity,
                  wine.literage,
                  wine.comments
                )
              }
            >
              Modifier
            </button>

            <button className="btn btn-danger" onClick={deleteWine}>
              Supprimer
            </button>
          </div>
        )}

        <div className="d-flex justify-content-center">
          <Link to="/Vinotheque">Back to Wine List</Link>
        </div>
      </div>
    </div>
  );
};

export default WineAbout;
