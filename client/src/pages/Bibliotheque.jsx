import React from "react";
import { UserContext } from "../context/UserContext";
import { useContext } from "react";
import hp1 from "../assets/hp1.jpg";

const Bibliotheque = () => {
  const { user } = useContext(UserContext);

  const handleUploadBook = () => {
    console.log("upload book");
  };

  const handleDeleteBook = () => {
    console.log("delete book");
  };

  const handleModidyBook = () => {
    console.log("modify book");
  };

  return (
    <div
      className="container "
      style={{ marginBottom: "12rem", paddingBottom: "10rem" }}
    >
      <div className="row text-center">
        <h1 className="mx-auto">La bibliothéque de Stéphanie</h1>
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr className="">
                <th scope="col">titre</th>
                <th scope="col">auteur</th>
                <th scope="col">genre</th>
                <th scope="col">résumé</th>
                <th scope="col">couverture</th>
                {(user.role === "admin" || user.role === "superadmin") && (
                  <th scope="col">ajouter / suppirmer / modifier</th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className="text-justify">
                  Harry potter à l'école des sorciers
                </th>
                <td className="text-justify ">J. K. Rolling</td>
                <td>Fantasy</td>
                <td>
                  <div className="overflow-auto" style={{ maxHeight: "200px" }}>
                    Harry Potter est un garçon ordinaire. Mais, le jour de ses
                    onze ans, son existence bascule : un géant vient le chercher
                    pour l'emmener dans une école de sorciers. Voler à cheval
                    sur des balais, jeter des sorts, combattre les Trolls :
                    Harry Potter se révèle être un sorcier vraiment doué. Mais
                    quel mystère entoure donc sa naissance et qui est
                    l'effroyable V..., le mage noir dont personne n'ose
                    prononcer le nom ?
                  </div>
                </td>
                <td>
                  <img src={hp1} alt="couverture" className="img-thumbnail" />
                </td>
                {(user.role === "admin" || user.role === "superadmin") && (
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDeleteBook}
                    >
                      supprimer
                    </button>
                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={handleModidyBook}
                    >
                      modifier
                    </button>
                  </td>
                )}
              </tr>

              {(user.role === "admin" || user.role === "superadmin") && (
                <tr>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="titre"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="auteur"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="genre"
                    />
                  </td>
                  <td>
                    <textarea
                      type="text"
                      className="form-control"
                      placeholder="résumé"
                    />
                  </td>
                  <td>
                    <input
                      type="file"
                      id="file"
                      accept="image/*"
                      className="form-control"
                      placeholder="couverture"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleUploadBook}
                    >
                      ajouter
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bibliotheque;
