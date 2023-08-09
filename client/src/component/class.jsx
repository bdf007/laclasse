import React, { useState, useEffect } from "react";
import axios from "axios";

function Class() {
  const [listOfClass, setListOfClass] = useState([]);
  const [newClassName, setNewClassName] = useState(""); // New class name input state
  const [editingClassId, setEditingClassId] = useState(""); // State to track the class being edited
  const [updatedClassName, setUpdatedClassName] = useState(""); // New class name for update

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

  const startEditing = (classId, className) => {
    setEditingClassId(classId);
    setUpdatedClassName(className);
  };

  const cancelEditing = () => {
    setEditingClassId("");
    setUpdatedClassName("");
  };

  const updateClass = (classId) => {
    axios
      .put(`${process.env.REACT_APP_API_URL}/api/class/${classId}`, {
        name: updatedClassName,
      })
      .then(() => {
        fetchClasses(); // Refresh the class list
        setEditingClassId("");
        setUpdatedClassName("");
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

  return (
    <div className="text-center">
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
                        onChange={(e) => setUpdatedClassName(e.target.value)}
                      />
                      <button onClick={() => updateClass(classe._id)}>
                        Save
                      </button>
                      <button onClick={cancelEditing}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <h5 className="card-title">{classe.name}</h5>
                      <button
                        onClick={() => startEditing(classe._id, classe.name)}
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
  );
}

export default Class;
