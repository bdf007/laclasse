import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Worker } from "@react-pdf-viewer/core";

import { Viewer } from "@react-pdf-viewer/core";

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
  // const [classId, setClassId] = useState(""); // New class nextCourse for update
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    fetchClasses();
  }, []);

  // const fetchClasses = async () => {
  //   await axios
  //     .get(`${process.env.REACT_APP_API_URL}/api/classes`)
  //     .then((response) => {
  //       const allClasses = response.data;
  //       console.log("allClasses", allClasses);
  //       for (let i = 0; i < allClasses.length; i++) {
  //         const response = axios.get(
  //           `${process.env.REACT_APP_API_URL}/api/courseFilesByCLass/${allClasses[i]._id}`
  //         );
  //         console.log("response.data", response.data);

  //         allClasses[i].courseFiles = response.data;
  //       }
  //       setListOfClass(allClasses);
  //     });
  // };

  const fetchClasses = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/classes`
      );
      const allClasses = response.data;
      console.log("allClasses", allClasses);

      for (let i = 0; i < allClasses.length; i++) {
        const courseFilesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/courseFilesByClass/${allClasses[i]._id}`
        );
        console.log("response.data", courseFilesResponse.data);

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
    setUpdatedClassAbout(classAbout);
    setUpdatedClassNextCourse(nextCourse);
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
      toast.error("There are students in this class. Deletion aborted.");
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
        toast.success("Course file uploaded successfully");
        setListOfCourseFile((prev) => [...prev, response.data]);

        resetFormFile();

        window.location.reload();
      };
    } catch (error) {
      toast.error("Something went wrong");
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
  // const createURL = (data) => {
  //   const file = new Blob([data], { type: "application/pdf" });
  //   return URL.createObjectURL(file);
  // };

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

  // Toggle between cards and table view
  const toggleViewMode = () => {
    setViewMode(viewMode === "cards" ? "table" : "cards");
  };

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <div className="text-center">
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
                            <label For="about">changer le about :</label>
                            <input
                              type="text"
                              name="about"
                              value={updatedClassAbout}
                              onChange={(e) =>
                                setUpdatedClassAbout(e.target.value)
                              }
                            />
                            <br />
                            <label For="nextCourse">
                              changer le prochain cours :
                            </label>
                            <input
                              type="text"
                              name="nextCourse"
                              value={updatedClassNextCourse}
                              onChange={(e) =>
                                setUpdatedClassNextCourse(e.target.value)
                              }
                            />
                            <br />
                            <button onClick={() => updateClass(classe._id)}>
                              Save
                            </button>
                            <button onClick={cancelEditing}>Cancel</button>
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
                                  No about
                                </span>
                              ) : (
                                classe.about
                              )}
                            </p>
                            <p className="card-text">
                              prochain cours :{" "}
                              {!classe.nextCourse ? (
                                <span className="bg-danger text-white">
                                  No nextCourse
                                </span>
                              ) : (
                                classe.nextCourse
                              )}
                            </p>
                            <button
                              onClick={() =>
                                startEditing(
                                  classe._id,
                                  classe.name,
                                  classe.about,
                                  classe.nextCourse
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
              <div className="col-md-4">
                <div className="card m-2">
                  <div className="card-body">
                    <h5 className="card-title">Add New Class</h5>
                    <input
                      type="text"
                      placeholder="New Class Name"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                    />
                    <button onClick={createClass}>Create Class</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">Class Name</th>
                <th scope="col">Class About</th>
                <th scope="col">Class Next Course</th>
                <th scope="col">Course Files</th>
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
                      ) : !classe.about ? (
                        <span className="bg-danger text-white">No about</span>
                      ) : (
                        classe.about
                      )}
                    </td>
                    <td>
                      {editingClassId === classe._id ? (
                        <input
                          type="text"
                          value={updatedClassNextCourse}
                          onChange={(e) =>
                            setUpdatedClassNextCourse(e.target.value)
                          }
                        />
                      ) : !classe.nextCourse ? (
                        <span className="bg-danger text-white">
                          No nextCourse
                        </span>
                      ) : (
                        classe.nextCourse
                      )}
                    </td>
                    <td>
                      <ul>
                        {!classe.courseFiles ? (
                          <li>No course files</li>
                        ) : (
                          classe.courseFiles.map((course) => (
                            <li key={course._id}>
                              <a
                                href={loadFromBase64(course.courseFileData)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {/* <Viewer
                                  fileUrl={loadFromBase64(
                                    course.courseFileData
                                  )}
                                /> */}

                                {course.courseFileTitle}
                              </a>
                              <br />

                              <button
                                onClick={() => deleteCourseFile(course._id)}
                              >
                                Delete
                              </button>
                            </li>
                          ))
                        )}
                        <li>
                          <input
                            type="text"
                            id="courseFileTitle"
                            placeholder="Course File Title"
                            value={courseFileTitle}
                            onChange={handleCourseTitle}
                          />
                          <input
                            type="file"
                            id="courseFileData"
                            accept="application/pdf"
                            onChange={handleCourseFile}
                          />
                          <button
                            onClick={() => handleUploadCourseFile(classe._id)}
                          >
                            Upload
                          </button>
                        </li>
                      </ul>
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
                              startEditing(
                                classe._id,
                                classe.name,
                                classe.about,
                                classe.nextCourse
                              )
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
                <td></td>
                <td>
                  <button onClick={createClass}>Create Class</button>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </Worker>
  );
}

export default Class;
