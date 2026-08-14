import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

//design
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";

import ConfirmModal from "./confirmModal";

function Class({ onClassesChange }) {
  const [listOfClass, setListOfClass] = useState([]);
  const [newClassName, setNewClassName] = useState(""); // New class name input state
  const [editingClassId, setEditingClassId] = useState(""); // State to track the class being edited
  const [updatedClassName, setUpdatedClassName] = useState(""); // New class name for update
  const [updatedClassAbout, setUpdatedClassAbout] = useState(""); // New class about for update
  const [updatedClassNextCourse, setUpdatedClassNextCourse] = useState(""); // New class nextCourse for update
  // eslint-disable-next-line
  const [courseFileTitle, setCourseFileTitle] = useState({}); // New class nextCourse for update
  const [classCourseTitles, setClassCourseTitles] = useState({});
  const [pendingUpload, setPendingUpload] = useState(null); // { classId, file }
  const [stopEditingName, setStopEditingName] = useState(false);
  const [stopEditingCourse, setStopEditingCourse] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [width, setWidth] = useState(window.innerWidth);

  // Un ref par classe (au lieu d'un id="..." dupliqué sur chaque input
  // de la liste, qui faisait que getElementById ciblait toujours le
  // premier trouvé dans le DOM, pas forcément celui utilisé).
  const fileInputRefs = useRef({});
  const titleInputRefs = useRef({});

  // Popup de confirmation générique, réutilisée pour toutes les suppressions
  const [confirmAction, setConfirmAction] = useState(null);
  const requestConfirm = (message, onConfirm) =>
    setConfirmAction({ message, onConfirm });

  const handleResize = () => {
    const newWidth = window.innerWidth;
    setWidth(newWidth);
    if (newWidth < 1200) {
      setViewMode("cards");
    } else {
      setViewMode("table");
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
    fetchClasses();
    // eslint-disable-next-line
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/classes`,
      );
      const allClasses = response.data;

      for (let i = 0; i < allClasses.length; i++) {
        // withCredentials ajouté : cette route est protégée par
        // authMiddleware, sans ça le cookie JWT n'était jamais envoyé
        // et la requête finissait en 403.
        const courseFilesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/courseFilesByClass/${allClasses[i]._id}`,
          { withCredentials: true },
        );

        allClasses[i].courseFiles = courseFilesResponse.data;
      }

      setListOfClass(allClasses);
      // Prévient le parent (Admin.jsx) que la liste a changé -- sinon sa
      // propre liste (utilisée pour la déroulante d'assignation) ne se
      // met jamais à jour tant que la page n'est pas rechargée.
      onClassesChange?.(allClasses);
    } catch (error) {
      console.error(error);
    }
  };

  const createClass = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/class`, {
        name: newClassName,
      })
      .then(() => {
        fetchClasses(); // Refresh the class list
        setNewClassName(""); // Clear the input field
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const startEditing = (classId, className, classAbout, nextCourse) => {
    setEditingClassId(classId);
    setUpdatedClassName(className);
    if (className === "public") {
      setStopEditingName(true);
      setStopEditingCourse(true);
    } else {
      setStopEditingName(false);
      setStopEditingCourse(false);
    }

    setUpdatedClassAbout(classAbout);
    setUpdatedClassNextCourse(nextCourse);
  };

  const cancelEditing = () => {
    setEditingClassId("");
    setUpdatedClassName("");
    setUpdatedClassAbout("");
  };

  const updateClass = (classId) => {
    if (updatedClassAbout) {
      handleTextareaEnter(updatedClassAbout);
    }
    axios
      .put(`${process.env.REACT_APP_API_URL}/api/class/${classId}`, {
        name: updatedClassName,
        about: updatedClassAbout,
        nextCourse: updatedClassNextCourse,
      })
      .then(() => {
        fetchClasses(); // Refresh the class list
        setEditingClassId("");
        setUpdatedClassName("");
        setUpdatedClassAbout("");
        setUpdatedClassNextCourse("");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const deleteClass = async (classe) => {
    const classId = classe._id;

    // check if the class as no students
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/users`,
    );
    const users = response.data;

    // Comparaison sur le NOM de la classe : /api/users renvoie déjà le nom
    // résolu dans user.classes, pas l'ID brut -- comparer contre classId
    // ne correspondait jamais, la vérification était donc toujours
    // silencieusement contournée.
    const studentsInClass = users.some((user) => user.classes === classe.name);

    if (studentsInClass) {
      toast.error("La classe a des étudiants, vous ne pouvez pas la supprimer");
      return;
    }

    // check if the class as no course files
    const courseFilesResponse = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/courseFilesByClass/${classId}`,
      { withCredentials: true },
    );
    const courseFiles = courseFilesResponse.data;

    if (courseFiles.length > 0) {
      toast.error(
        "La classe a des fichiers de cours, Supprimer d'abord les fichiers de cours avant de supprimer la classe",
      );
      return;
    }

    // Vérifie s'il y a des messages de chat liés à cette classe -- ça ne
    // bloque pas la suppression, juste un avertissement dans le message
    // de confirmation (le serveur les nettoiera en même temps que la
    // classe).
    let messageCount = 0;
    try {
      const commentCountResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/comment/count/${encodeURIComponent(classe.name)}`,
        { withCredentials: true },
      );
      messageCount = commentCountResponse.data.count;
    } catch (error) {
      console.error(error);
    }

    const messageWarning =
      messageCount > 0
        ? ` Attention, ${messageCount} message(s) de chat sont liés à cette classe et seront supprimés avec elle.`
        : "";

    // Toutes les vérifications sont passées : on ne demande la
    // confirmation qu'à ce stade, pas avant (sinon le modal s'ouvre même
    // pour une suppression qui va de toute façon être refusée).
    requestConfirm(
      `Supprimer la classe "${classe.name}" ?${messageWarning}`,
      () => {
        axios
          .delete(`${process.env.REACT_APP_API_URL}/api/class/${classId}`)
          .then(() => {
            fetchClasses(); // Refresh the class list
          })
          .catch((error) => {
            console.error(error);
          });
      },
    );
  };

  const handleCourseTitle = (e, classId) => {
    const { value } = e.target;
    // Update the course title for the specific class
    setClassCourseTitles({
      ...classCourseTitles,
      [classId]: value,
    });
  };

  const handleCourseFile = (e, classId) => {
    const file = e.target.files[0];
    setPendingUpload({ classId, file });
  };

  // Réécrit : upload en multipart/form-data vers la vraie route
  // (/admin/classes/:classId/courseFiles), plus de Base64 dans le JSON.
  const handleUploadCourseFile = async (classId) => {
    try {
      const formData = new FormData();
      formData.append("courseFile", pendingUpload.file);
      formData.append("courseFileTitle", classCourseTitles[classId] || "");

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/classes/${classId}/courseFiles`,
        formData,
        { withCredentials: true },
      );

      toast.success("fichier ajouté avec succès");
      resetFormFile(classId);
      fetchClasses(); // Refresh the class list (remplace l'ancien window.location.reload())
    } catch (error) {
      toast.error(
        "erreur lors de l'ajout du fichier, veuillez réessayer ou contacter le super administrateur",
      );
    }
  };

  const resetFormFile = (classId) => {
    setCourseFileTitle({});
    setPendingUpload(null);
    setClassCourseTitles((prev) => ({ ...prev, [classId]: "" }));
    if (titleInputRefs.current[classId]) {
      titleInputRefs.current[classId].value = "";
    }
    if (fileInputRefs.current[classId]) {
      fileInputRefs.current[classId].value = null;
    }
  };

  // Réécrit : route corrigée (/admin/courseFiles/:fileId au lieu de
  // /courseFile/:id), + withCredentials (route admin protégée).
  const deleteCourseFile = async (courseFileId) => {
    axios
      .delete(
        `${process.env.REACT_APP_API_URL}/api/admin/courseFiles/${courseFileId}`,
        { withCredentials: true },
      )
      .then(() => {
        fetchClasses(); // Refresh the class list
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Nouveau : remplace loadFromBase64. Le fichier n'existe plus en Base64
  // nulle part, on le télécharge (authentifié) au moment du clic, puis on
  // l'ouvre dans un nouvel onglet.
  const openCourseFile = async (courseFileId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/courseFiles/${courseFileId}/download`,
        { responseType: "blob", withCredentials: true },
      );
      const url = URL.createObjectURL(res.data);
      window.open(url, "_blank", "noopener,noreferrer");
      // Laisse le temps au nouvel onglet de charger avant de libérer l'URL
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      toast.error("Erreur lors du chargement du fichier");
    }
  };

  const handleTextareaEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent the default Enter behavior
      setUpdatedClassAbout((prevValue) => prevValue + "\n");
    }
  };

  // Toggle between cards and table view
  const isNarrow = width < 1200; // même seuil que la bascule automatique
  const toggleViewMode = () => {
    if (isNarrow) return; // pas de tableau forcé sur mobile, illisible
    setViewMode(viewMode === "cards" ? "table" : "cards");
  };

  // Extrait : le sélecteur de fichier PDF (input natif caché + bouton
  // stylé) réutilisé dans les deux vues. L'input natif déborde de son
  // conteneur sur mobile selon le navigateur -- on le cache et on affiche
  // un vrai bouton à la place, comme pour le sélecteur de photos.
  const renderFilePicker = (classe) => (
    <div className="course-file-picker">
      <input
        type="file"
        id={`courseFileData-${classe._id}`}
        accept="application/pdf"
        className="image-picker-input"
        onChange={(e) => handleCourseFile(e, classe._id)}
        ref={(el) => (fileInputRefs.current[classe._id] = el)}
      />
      <label
        htmlFor={`courseFileData-${classe._id}`}
        className="btn btn-primary"
      >
        Choisir un PDF
      </label>
    </div>
  );

  return (
    <div className="text-center">
      {!isNarrow && (
        <button
          className="btn btn-primary"
          onClick={toggleViewMode}
          style={{ float: "right" }}
        >
          {viewMode === "cards" ? (
            <FormatListBulletedOutlinedIcon />
          ) : (
            <DashboardOutlinedIcon />
          )}
        </button>
      )}
      {viewMode === "cards" ? (
        <div>
          {/* List all classes */}
          <h1 className="text-center">Liste des classes</h1>
          <div className="row">
            {listOfClass.length > 0 ? (
              listOfClass.map((classe) => (
                <div className="col-md-4" key={classe._id}>
                  <div className="card mx-1 my-2 mx-md-2">
                    <div className="card-body">
                      {editingClassId === classe._id ? (
                        <div>
                          {stopEditingName ? (
                            <h5 className="card-title">
                              nom de la classe : {classe.name}
                            </h5>
                          ) : (
                            <>
                              <label For="name">changer le nom :</label>
                              <input
                                type="text"
                                name="name"
                                value={updatedClassName}
                                onChange={(e) =>
                                  setUpdatedClassName(e.target.value)
                                }
                              />
                              <br />
                            </>
                          )}

                          <label For="about">changer le about :</label>
                          <textarea
                            type="text"
                            name="about"
                            className="form-control"
                            value={updatedClassAbout}
                            onChange={(e) =>
                              setUpdatedClassAbout(e.target.value)
                            }
                          />
                          <br />
                          {stopEditingCourse ? null : (
                            <>
                              <label For="nextCourse">
                                changer le prochain cours :
                              </label>
                              <textarea
                                type="text"
                                name="nextCourse"
                                value={updatedClassNextCourse}
                                onChange={(e) =>
                                  setUpdatedClassNextCourse(e.target.value)
                                }
                              />
                            </>
                          )}
                          <br />
                          <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                            <button
                              onClick={() => updateClass(classe._id)}
                              className="btn btn-success"
                            >
                              Sauvegarder
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="btn btn-danger"
                            >
                              Annuler les modifications
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h5 className="card-title">
                            nom de la classe : {classe.name}
                          </h5>
                          <div className="card-text">
                            A propos : <br />
                            {!classe.about ? (
                              <span className="bg-danger text-white">
                                Pas d'à propos
                              </span>
                            ) : (
                              <pre
                                style={{
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                }}
                              >
                                {classe.about}
                              </pre>
                            )}
                          </div>
                          <div className="card-text">
                            prochain cours :{" "}
                            {!classe.nextCourse ? (
                              <span className="bg-danger text-white">
                                Pas d'informations
                              </span>
                            ) : (
                              <pre
                                style={{
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                }}
                              >
                                {classe.nextCourse}
                              </pre>
                            )}
                          </div>

                          <br />
                          <div className="d-flex flex-wrap justify-content-center gap-2">
                            <button
                              className="btn btn-warning"
                              onClick={() =>
                                startEditing(
                                  classe._id,
                                  classe.name,
                                  classe.about,
                                  classe.nextCourse,
                                )
                              }
                            >
                              Modifier la classe
                            </button>
                            {classe.name === "public" ? null : (
                              <button
                                onClick={() => deleteClass(classe)}
                                className="btn btn-danger"
                              >
                                <DeleteForeverRoundedIcon />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                      <br />
                      <div className="card-text">
                        <p>Fichier(s) de la classe:</p>
                        <ul className="list-group list-group-flush ">
                          {classe.courseFiles.length === 0 ||
                          classe.name === "public" ? (
                            <li className="bg-danger text-white">
                              Pas de fichiers de cours
                            </li>
                          ) : (
                            classe.courseFiles.map((course) => (
                              <li
                                key={course._id}
                                className="list-group-item bg-transparent"
                              >
                                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-link text-start p-0"
                                    onClick={() => openCourseFile(course._id)}
                                  >
                                    {course.courseFileTitle}
                                  </button>
                                  <button
                                    onClick={() =>
                                      requestConfirm(
                                        `Supprimer le fichier "${course.courseFileTitle}" ?`,
                                        () => deleteCourseFile(course._id),
                                      )
                                    }
                                    className="btn btn-danger"
                                  >
                                    <DeleteForeverRoundedIcon />
                                  </button>
                                </div>
                              </li>
                            ))
                          )}
                          {classe.name === "public" ? null : (
                            <>
                              <li className="list-group-item d-flex flex-wrap justify-content-center gap-2 bg-transparent">
                                {pendingUpload?.classId === classe._id ? (
                                  <input
                                    type="text"
                                    placeholder="Nom du fichier"
                                    className="form-control"
                                    value={classCourseTitles[classe._id] || ""}
                                    onChange={(e) =>
                                      handleCourseTitle(e, classe._id)
                                    }
                                    ref={(el) =>
                                      (titleInputRefs.current[classe._id] = el)
                                    }
                                  />
                                ) : (
                                  renderFilePicker(classe)
                                )}
                              </li>
                              {pendingUpload?.classId === classe._id && (
                                <li className="list-group-item d-flex flex-wrap justify-content-center gap-2 bg-transparent">
                                  <button
                                    onClick={() =>
                                      handleUploadCourseFile(classe._id)
                                    }
                                    className="btn btn-primary"
                                  >
                                    Ajouter un fichier
                                  </button>
                                  <button
                                    onClick={() => resetFormFile(classe._id)}
                                    className="btn btn-warning"
                                  >
                                    Annuler
                                  </button>
                                </li>
                              )}
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Loading classes...</p>
            )}
            <div className="col-md-4">
              <div className="card mx-1 my-2 mx-md-2">
                <div className="card-body">
                  <h5 className="card-title">Ajouter une nouvelle classe</h5>
                  <input
                    type="text"
                    placeholder="Nouvelle Classe"
                    className="form-control mb-2"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                  />
                  <button onClick={createClass} className="btn btn-primary">
                    Créer une nouvelle classe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Nom de la classe</th>
              <th scope="col">A Propos</th>
              <th scope="col">Prochain(s) cours</th>
              <th scope="col">Actions</th>
              <th scope="col">fichier(s) de cours</th>
            </tr>
          </thead>
          <tbody>
            {listOfClass.length > 0 ? (
              listOfClass.map((classe) => (
                <tr key={classe._id}>
                  {editingClassId === classe._id &&
                  stopEditingName === false ? (
                    <td>
                      <input
                        type="text"
                        value={updatedClassName}
                        onChange={(e) => setUpdatedClassName(e.target.value)}
                      />
                    </td>
                  ) : (
                    <td>{classe.name}</td>
                  )}
                  <td>
                    {editingClassId === classe._id ? (
                      <textarea
                        type="text"
                        rows={20}
                        value={updatedClassAbout}
                        onChange={(e) => setUpdatedClassAbout(e.target.value)}
                        onKeyDown={(e) => handleTextareaEnter(e)}
                      />
                    ) : !classe.about ? (
                      <span className="bg-danger text-white">
                        Pas d'à propos
                      </span>
                    ) : (
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {classe.about}
                      </pre>
                    )}
                  </td>
                  <td>
                    {editingClassId === classe._id && !stopEditingCourse ? (
                      <textarea
                        type="text"
                        value={updatedClassNextCourse}
                        onChange={(e) =>
                          setUpdatedClassNextCourse(e.target.value)
                        }
                      />
                    ) : !classe.nextCourse ? (
                      <span className="bg-danger text-white">
                        Pas d'informations
                      </span>
                    ) : (
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {classe.nextCourse}
                      </pre>
                    )}
                  </td>
                  <td>
                    {editingClassId === classe._id ? (
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          onClick={() => updateClass(classe._id)}
                          className="btn btn-success"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="btn btn-danger"
                        >
                          Annuler les modifications
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            startEditing(
                              classe._id,
                              classe.name,
                              classe.about,
                              classe.nextCourse,
                            )
                          }
                          className="btn btn-warning"
                        >
                          Modifier la classe
                        </button>
                        {classe.name === "public" ? null : (
                          <button
                            onClick={() => deleteClass(classe)}
                            className="btn btn-danger"
                          >
                            <DeleteForeverRoundedIcon />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <ul className="list-group list-group-flush ">
                      {classe.courseFiles.length === 0 ||
                      classe.className === "public" ? (
                        <li className="bg-danger text-white">
                          Pas de fichiers de cours
                        </li>
                      ) : (
                        classe.courseFiles.map((course) => (
                          <li
                            key={course._id}
                            className="list-group-item bg-transparent"
                          >
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                              <button
                                type="button"
                                className="btn btn-link text-start p-0"
                                onClick={() => openCourseFile(course._id)}
                              >
                                {course.courseFileTitle}
                              </button>
                              <button
                                onClick={() =>
                                  requestConfirm(
                                    `Supprimer le fichier "${course.courseFileTitle}" ?`,
                                    () => deleteCourseFile(course._id),
                                  )
                                }
                                className="btn btn-danger"
                              >
                                <DeleteForeverRoundedIcon />
                              </button>
                            </div>
                          </li>
                        ))
                      )}
                      {classe.name === "public" ? null : (
                        <>
                          <li
                            className="list-group-item d-flex flex-wrap justify-content-center gap-2 bg-transparent"
                            key={classe._id}
                          >
                            {pendingUpload?.classId === classe._id ? (
                              <input
                                type="text"
                                placeholder="nom du fichier"
                                className="form-control"
                                value={classCourseTitles[classe._id] || ""}
                                onChange={(e) =>
                                  handleCourseTitle(e, classe._id)
                                }
                                ref={(el) =>
                                  (titleInputRefs.current[classe._id] = el)
                                }
                              />
                            ) : (
                              renderFilePicker(classe)
                            )}
                          </li>
                          {pendingUpload?.classId === classe._id && (
                            <li className="list-group-item d-flex flex-wrap justify-content-center gap-2 bg-transparent">
                              <button
                                onClick={() =>
                                  handleUploadCourseFile(classe._id)
                                }
                                className="btn btn-primary"
                              >
                                Ajouter un fichier
                              </button>
                              <button
                                onClick={() => resetFormFile(classe._id)}
                                className="btn btn-warning"
                              >
                                Annuler
                              </button>
                            </li>
                          )}
                        </>
                      )}
                    </ul>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td>Loading classes...</td>
              </tr>
            )}
            <tr>
              <td>
                <input
                  type="text"
                  placeholder="nouvelle classe"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
              </td>
              <td></td>
              <td></td>
              <td>
                <button onClick={createClass} className="btn btn-primary">
                  Créer une nouvelle classe
                </button>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      )}

      {confirmAction && (
        <ConfirmModal
          message={confirmAction.message}
          onConfirm={() => {
            confirmAction.onConfirm();
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

export default Class;
