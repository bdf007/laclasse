import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

//design
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

function Class() {
  const [listOfClass, setListOfClass] = useState([]);
  const [newClassName, setNewClassName] = useState(""); // New class name input state
  const [editingClassId, setEditingClassId] = useState(""); // State to track the class being edited
  const [updatedClassName, setUpdatedClassName] = useState(""); // New class name for update
  const [updatedClassAbout, setUpdatedClassAbout] = useState(""); // New class about for update
  const [updatedClassNextCourse, setUpdatedClassNextCourse] = useState(""); // New class nextCourse for update
  const [listOfCourseFile, setListOfCourseFile] = useState([]); // New class nextCourse for update
  const [courseFileTitle, setCourseFileTitle] = useState(""); // New class nextCourse for update
  const [courseFileData, setCourseFileData] = useState(null);
  const [stopEditingName, setStopEditingName] = useState(false);
  const [stopEditingCourse, setStopEditingCourse] = useState(false);
  // const [classId, setClassId] = useState(""); // New class nextCourse for update
  const [viewMode, setViewMode] = useState("cards");
  const [width, setWidth] = useState(window.innerWidth);

  const handleResize = () => {
    const newWidth = window.innerWidth;
    setWidth(newWidth);
    if (newWidth < 1200) {
      setViewMode("table");
    } else {
      setViewMode("cards");
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
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/classes`
      );
      const allClasses = response.data;

      for (let i = 0; i < allClasses.length; i++) {
        const courseFilesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/courseFilesByClass/${allClasses[i]._id}`
        );

        allClasses[i].courseFiles = courseFilesResponse.data;
      }

      setListOfClass(allClasses);
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
    handleTextareaEnter(updatedClassAbout);
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

  //add course files

  const deleteClass = async (classId) => {
    // check if the class as no students
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/users`
    );
    const users = response.data;

    const studentsInClass = users.some((user) => user.classes === classId);

    if (studentsInClass) {
      toast.error("La classe a des étudiants, vous ne pouvez pas la supprimer");
      return;
    }

    // check if the class as no course files
    const courseFilesResponse = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/courseFilesByClass/${classId}`
    );
    const courseFiles = courseFilesResponse.data;

    if (courseFiles.length > 0) {
      toast.error(
        "La classe a des fichiers de cours, Supprimer d'abord les fichiers de cours avant de supprimer la classe"
      );
      return;
    }

    // delete the class

    axios
      .delete(`${process.env.REACT_APP_API_URL}/api/class/${classId}`)
      .then(() => {
        fetchClasses(); // Refresh the class list
        getCourseFiles(classId);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // get course files list by class id
  const getCourseFiles = async (classId) => {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/courseFiles/`
    );
    const courseFiles = response.data;
    const courseFilesInClass = courseFiles.filter(
      (courseFile) => courseFile.classId === classId
    );
    setListOfCourseFile(courseFilesInClass);
  };

  const handleCourseTitle = (e) => {
    setCourseFileTitle(e.target.value);
  };

  const handleCourseFile = (e) => {
    const file = e.target.files[0];
    setCourseFileData(file);
  };

  const handleUploadCourseFile = async (classId) => {
    try {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(courseFileData);

      fileReader.onload = async () => {
        const base64Data = fileReader.result;

        const courseFileData = {
          courseFileTitle,
          courseFileData: base64Data,
          classId,
        };

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/courseFile`,
          courseFileData
        );
        toast.success("fichier ajouté avec succès");
        setListOfCourseFile((prev) => [...prev, response.data]);
        console.warn(listOfCourseFile);

        resetFormFile();

        window.location.reload();
      };
    } catch (error) {
      toast.error(
        "erreur lors de l'ajout du fichier, veuillez réessayer ou contacter le super administrateur"
      );
    }
  };
  const resetFormFile = () => {
    setCourseFileTitle("");
    setCourseFileData(null);
    // clear the input field
    document.getElementById("courseFileTitle").value = "";
    document.getElementById("courseFileData").value = null;
  };

  const deleteCourseFile = async (courseFileId) => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/api/courseFile/${courseFileId}`)
      .then(() => {
        fetchClasses(); // Refresh the class list
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const loadFromBase64 = (base64) => {
    const base64toBlob = (data) => {
      // Cut the prefix `data:application/pdf;base64` from the raw base64
      const base64WithoutPrefix = data.substr(
        "data:application/pdf;base64,".length
      );

      const bytes = atob(base64WithoutPrefix);
      let length = bytes.length;
      let out = new Uint8Array(length);

      while (length--) {
        out[length] = bytes.charCodeAt(length);
      }

      return new Blob([out], { type: "application/pdf" });
    };

    const blob = base64toBlob(base64);
    const blobUrl = URL.createObjectURL(blob);

    return blobUrl;
  };

  const handleTextareaEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent the default Enter behavior
      setUpdatedClassAbout((prevValue) => prevValue + "\n");
    }
  };

  // Toggle between cards and table view
  const toggleViewMode = () => {
    setViewMode(viewMode === "cards" ? "table" : "cards");
  };

  return (
    <div className="text-center">
      <button
        className="btn btn-primary"
        onClick={toggleViewMode}
        style={{ float: "right" }}
      >
        {viewMode === "cards" ? (
          <DashboardOutlinedIcon />
        ) : (
          <FormatListBulletedOutlinedIcon />
        )}
      </button>
      {viewMode === "table" ? (
        <div className="row">
          {/* Add class form */}

          {/* List all classes */}
          <h1 className="text-center">Liste des classes</h1>
          <div className="row">
            {listOfClass.length > 0 ? (
              listOfClass.map((classe) => (
                <div className="col-md-4" key={classe._id}>
                  <div className="card m-2">
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
                        <>
                          <h5 className="card-title">
                            nom de la classe : {classe.name}
                          </h5>
                          <p className="card-text">
                            A propos : <br />
                            {!classe.about ? (
                              <span className="bg-danger text-white">
                                Pas d'à propos
                              </span>
                            ) : (
                              <pre>{classe.about}</pre>
                            )}
                          </p>
                          <p className="card-text">
                            prochain cours :{" "}
                            {!classe.nextCourse ? (
                              <span className="bg-danger text-white">
                                Pas d'informations
                              </span>
                            ) : (
                              <pre>{classe.nextCourse}</pre>
                            )}
                          </p>

                          <br />
                          <button
                            className="btn btn-warning"
                            onClick={() =>
                              startEditing(
                                classe._id,
                                classe.name,
                                classe.about,
                                classe.nextCourse
                              )
                            }
                          >
                            Modifier la classe
                          </button>
                          {classe.name === "public" ? null : (
                            <button
                              onClick={() => deleteClass(classe._id)}
                              className="btn btn-danger"
                            >
                              Supprimer la classe
                            </button>
                          )}
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
                                <div className="d-flex justify-content-between">
                                  <a
                                    href={loadFromBase64(course.courseFileData)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-start"
                                    // style={{ width: "10rem" }}
                                  >
                                    {course.courseFileTitle}
                                  </a>
                                  <button
                                    onClick={() => deleteCourseFile(course._id)}
                                    className="btn btn-danger"
                                  >
                                    Supprimer le fichier
                                  </button>
                                </div>
                              </li>
                            ))
                          )}
                          {classe.name === "public" ? null : (
                            <>
                              <li className="list-group-item d-flex justify-content-between bg-transparent">
                                <input
                                  type="text"
                                  id="courseFileTitle"
                                  placeholder="Nom du fichier"
                                  value={courseFileTitle}
                                  onChange={handleCourseTitle}
                                />
                                <input
                                  type="file"
                                  id="courseFileData"
                                  accept="application/pdf"
                                  className="btn btn-primary"
                                  onChange={handleCourseFile}
                                />
                              </li>
                              <li className="list-group-item d-flex justify-content-center bg-transparent">
                                <button
                                  onClick={() =>
                                    handleUploadCourseFile(classe._id)
                                  }
                                  className="btn btn-primary"
                                >
                                  Ajouter un fichier
                                </button>
                              </li>
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
              <div className="card m-2">
                <div className="card-body">
                  <h5 className="card-title">Ajouter une nouvelle classe</h5>
                  <input
                    type="text"
                    placeholder="Nouvelle Classe"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                  />
                  <button onClick={createClass}>
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
                      <pre>{classe.about}</pre>
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
                      <pre>{classe.nextCourse}</pre>
                    )}
                  </td>
                  <td>
                    {editingClassId === classe._id ? (
                      <div>
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
                      <div>
                        <button
                          onClick={() =>
                            startEditing(
                              classe._id,
                              classe.name,
                              classe.about,
                              classe.nextCourse
                            )
                          }
                          className="btn btn-warning"
                        >
                          Modifier la classe
                        </button>
                        {classe.name === "public" ? null : (
                          <button
                            onClick={() => deleteClass(classe._id)}
                            className="btn btn-danger"
                          >
                            Supprimer la classe
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
                            <div className="d-flex justify-content-between">
                              <a
                                href={loadFromBase64(course.courseFileData)}
                                target="_blank"
                                rel="noreferrer"
                                // style={{ width: "10rem" }}
                              >
                                {course.courseFileTitle}
                              </a>
                              <button
                                onClick={() => deleteCourseFile(course._id)}
                                className="btn btn-danger"
                              >
                                Supprimer le fichier
                              </button>
                            </div>
                          </li>
                        ))
                      )}
                      {classe.name === "public" ? null : (
                        <>
                          <li className="list-group-item d-flex justify-content-between bg-transparent">
                            <input
                              type="text"
                              id="courseFileTitle"
                              placeholder="nom du fichier"
                              value={courseFileTitle}
                              onChange={handleCourseTitle}
                            />
                            <input
                              type="file"
                              id="courseFileData"
                              accept="application/pdf"
                              onChange={handleCourseFile}
                              className="btn btn-primary"
                            />
                          </li>
                          <li className="list-group-item d-flex justify-content-center bg-transparent">
                            <button
                              onClick={() => handleUploadCourseFile(classe._id)}
                              className="btn btn-primary"
                            >
                              Ajouter un fichier
                            </button>
                          </li>
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
    </div>
    // </Worker>
  );
}

export default Class;
