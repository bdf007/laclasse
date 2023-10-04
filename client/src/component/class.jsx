import React, { useState, useEffect } from "react";
import axios from "axios";

//design
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

function Class() {
  const [listOfClass, setListOfClass] = useState([]);
  const [newClassName, setNewClassName] = useState(""); // New class name input state
  const [editingClassId, setEditingClassId] = useState(""); // State to track the class being edited
  const [updatedClassName, setUpdatedClassName] = useState(""); // New class name for update
  const [updatedClassAbout, setUpdatedClassAbout] = useState(""); // New class about for update
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/classes`)
      .then((response) => {
        setListOfClass(response.data);
      });
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

  const startEditing = (classId, className, classAbout) => {
    setEditingClassId(classId);
    setUpdatedClassName(className);
    setUpdatedClassAbout(classAbout);
  };

  const cancelEditing = () => {
    setEditingClassId("");
    setUpdatedClassName("");
    setUpdatedClassAbout("");
  };

  const updateClass = (classId) => {
    axios
      .put(`${process.env.REACT_APP_API_URL}/api/class/${classId}`, {
        name: updatedClassName,
        about: updatedClassAbout,
      })
      .then(() => {
        fetchClasses(); // Refresh the class list
        setEditingClassId("");
        setUpdatedClassName("");
        setUpdatedClassAbout("");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const deleteClass = (classId) => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/api/class/${classId}`)
      .then(() => {
        fetchClasses(); // Refresh the class list
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Toggle between cards and table view
  const toggleViewMode = () => {
    setViewMode(viewMode === "cards" ? "table" : "cards");
  };

  return (
    <div className="text-center">
      <h1>Class</h1>
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
      {viewMode === "cards" ? (
        <div className="row">
          {/* Add class form */}
          <div>
            <input
              type="text"
              placeholder="New Class Name"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
            />
            <button onClick={createClass}>Create Class</button>
          </div>
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
                          <input
                            type="text"
                            value={updatedClassName}
                            onChange={(e) =>
                              setUpdatedClassName(e.target.value)
                            }
                          />
                          <input
                            type="text"
                            value={updatedClassAbout}
                            onChange={(e) =>
                              setUpdatedClassAbout(e.target.value)
                            }
                          />
                          <button onClick={() => updateClass(classe._id)}>
                            Save
                          </button>
                          <button onClick={cancelEditing}>Cancel</button>
                        </div>
                      ) : (
                        <>
                          <h5 className="card-title">{classe.name}</h5>
                          <p className="card-text">{classe.about}</p>
                          <button
                            onClick={() =>
                              startEditing(
                                classe._id,
                                classe.name,
                                classe.about
                              )
                            }
                          >
                            Edit
                          </button>
                          <button onClick={() => deleteClass(classe._id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Loading classes...</p>
            )}
          </div>
        </div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Class Name</th>
              <th scope="col">Class About</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listOfClass.length > 0 ? (
              listOfClass.map((classe) => (
                <tr key={classe._id}>
                  <td>
                    {editingClassId === classe._id ? (
                      <input
                        type="text"
                        value={updatedClassName}
                        onChange={(e) => setUpdatedClassName(e.target.value)}
                      />
                    ) : (
                      classe.name
                    )}
                  </td>
                  <td>
                    {editingClassId === classe._id ? (
                      <input
                        type="text"
                        value={updatedClassAbout}
                        onChange={(e) => setUpdatedClassAbout(e.target.value)}
                      />
                    ) : (
                      classe.about
                    )}
                  </td>
                  <td>
                    {editingClassId === classe._id ? (
                      <div>
                        <button onClick={() => updateClass(classe._id)}>
                          Save
                        </button>
                        <button onClick={cancelEditing}>Cancel</button>
                      </div>
                    ) : (
                      <div>
                        <button
                          onClick={() =>
                            startEditing(classe._id, classe.name, classe.about)
                          }
                        >
                          Edit
                        </button>
                        <button onClick={() => deleteClass(classe._id)}>
                          Delete
                        </button>
                      </div>
                    )}
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
                  placeholder="New Class Name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
              </td>
              <td></td>
              <td>
                <button onClick={createClass}>Create Class</button>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Class;
