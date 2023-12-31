import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { getUser } from "../api/user";
import { toast } from "react-toastify";
import Class from "../component/class";

//design
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

const Admin = () => {
  const { user, setUser } = useContext(UserContext);
  const [listOfUser, setListOfUser] = useState([]);
  // get the list of the bookers
  const [listOfBookers, setListOfBookers] = useState([]);
  // get the list of the classes
  const [listOfClass, setListOfClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState({});
  const [selectedRole, setSelectedRole] = useState({ user });
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
    // Fetch users and classes
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/users`)
      .then((res) => {
        // setListOfUser(res.data);
        fetchAndSetClassNames(res.data);
      })
      .catch((error) => {
        toast(error);
      });

    // Fetch class names and update the user list
    const fetchAndSetClassNames = async (users) => {
      try {
        const updatedUsers = await Promise.all(
          users.map(async (user) => {
            if (user.classes) {
              try {
                const classResponse = await axios.get(
                  `${process.env.REACT_APP_API_URL}/api/class/${user.classes}`
                );

                user.className = classResponse.data.name;
                return user;
              } catch (err) {
                toast(err);
                return user;
              }
            }
            return user;
          })
        );
        // sort updatedUsers by class name
        updatedUsers.sort((a, b) => {
          if (a.className && b.className) {
            return a.className.localeCompare(b.className);
          } else if (a.className) {
            return -1; // Place users without b.className at the end
          } else if (b.className) {
            return 1; // Place users without a.className at the end
          }
          return 0;
        });

        setListOfUser(updatedUsers);
      } catch (error) {
        toast(error);
      }
    };

    axios.get(`${process.env.REACT_APP_API_URL}/api/classes`).then((res) => {
      // remove the class "public" from the list of classes
      const filteredClasses = res.data.filter(
        (classe) => classe.name !== "public"
      );

      setListOfClass(filteredClasses);
    });

    // Fetch user info
    const fetchData = async () => {
      try {
        const res = await getUser();
        if (res.error) toast(res.error);
        else setUser(res);
      } catch (err) {
        toast(err);
      }
    };
    getAllBookers();

    fetchData();
  }, [setListOfUser, setListOfClass, setUser]);

  // get the info of the user logged in
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getUser();

        if (res.error) toast(res.error);
        else setUser(res); // Set the entire 'res' object, which includes 'firstname' and 'role'
      } catch (err) {
        toast(err);
      }
    };

    fetchData();
  }, [setUser]);

  const getAllBookers = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/get-list-of-all-booker`,
        { withCredentials: true }
      );
      setListOfBookers(res.data);
    } catch (err) {
      toast.error(err);
    }
  };

  // delete function for user
  const deleteUser = (id) => {
    try {
      // check if the user is admin or superadmin
      const user = listOfUser.find((user) => user._id === id);
      if (user.role === "admin" || user.role === "superadmin") {
        toast.error("Vous ne pouvez pas supprimer un admin ou un superadmin");
        return;
      }

      // check if the user has a class
      if (user.classes) {
        toast.error(
          "l'utilisateur a une classe assignée, merci de le retirer de la classe avant de le supprimer"
        );
        return;
      }

      // check if the user has a booking

      const booker = listOfBookers.find((booker) => booker.emprunteur === id);
      if (booker) {
        toast.error(
          "l'utilisateur a emprunté un livre merci de récupérer le livre avant de supprimer l'utilisateur"
        );
        return;
      }
      axios
        .delete(`${process.env.REACT_APP_API_URL}/api/user/${id}`)
        .then(() => {
          toast.success("Utilisateur supprimé");
          setListOfUser((prevList) => prevList.filter((val) => val._id !== id));
        });
    } catch (error) {
      toast.error(
        "Une erreur est survenue lors de la suppression de l'utilisateur"
      );
    }
  };

  const updateUserRole = (id) => {
    // check if the selected role is user
    if (selectedRole === "user" || selectedRole === "oldstudent") {
      // if the selected role is user, check if the user has a class
      const user = listOfUser.find((user) => user._id === id);
      if (user.classes) {
        toast.error(
          "l'utilisateur a une classe assignée, merci de retirer la classe avant de changer son role"
        );
        return;
      }
    }
    axios
      .put(`${process.env.REACT_APP_API_URL}/api/user/${id}/change-role`, {
        role: selectedRole, // Send the selected role to the server
      })
      .then(() => {
        toast.success("Le role de l'utilisateur a été modifié");
        setSelectedRole(""); // Clear the selected role after updating
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Une erreur est survenue lors de la modification du role");
      });
  };
  const assignClassToUser = (userId, selectedClass) => {
    // Assign selected class to user
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/user/assign-class`, {
        userId: userId,
        classId: selectedClass,
      })
      .then(() => {
        toast.success("classe assignée à l'utilisateur");
        setSelectedClass(""); // Clear selected class
        window.location.reload();
      })
      .catch((err) => console.log(err));
  };

  const removeClassFromUser = (userId) => {
    // Remove class from user
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/user/remove-class`, {
        userId: userId,
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("classe retirée de l'utilisateur");
          setSelectedClass(""); // Clear selected class
          window.location.reload();
        } else {
          const errorMessage =
            response.data && response.data.error
              ? response.data.error
              : "une erreur inconue est survenue lors de la suppression de la classe de l'utilisateur";
          toast.error(errorMessage);
          console.error(response); // Log the response for debugging
        }
      })
      .catch((err) => {
        const errorMessage =
          err.response && err.response.data && err.response.data.error
            ? err.response.data.error
            : "une erreur inconue est survenue lors de la suppression de la classe de l'utilisateur";
        toast.error(errorMessage);
        console.error(err); // Log the error for debugging
      });
  };

  // Toggle between cards and table view
  const toggleViewMode = () => {
    setViewMode(viewMode === "cards" ? "table" : "cards");
  };

  return !user ? (
    <div className="container text-center home" style={{ marginTop: "4rem" }}>
      <div className="alert alert-primary p-5">
        <h1>Not autorized</h1>
      </div>
    </div>
  ) : (
    <>
      {(user.role === "admin" || user.role === "superadmin") && (
        <div
          className="container text-center home"
          style={{ marginTop: "1rem", paddingBottom: "12rem" }}
        >
          <div className="bg-transparent p-5">
            <h1>
              {" "}
              <span className="text-success">{user.firstname}'s</span> Admin
            </h1>
            <Class />
            <div className="text-center">
              {/* list all user */}
              <div className="mb-3">
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
                <h1 className="text-center">Liste des utilisateurs</h1>
              </div>
              {viewMode === "table" ? (
                <div className="row">
                  {listOfUser.map((stud) => (
                    <div className="col-md-4" key={stud._id}>
                      <div className="card m-2">
                        <div className="card-body">
                          <h5 className="card-title">{stud.firstname}</h5>
                          <h5 className="card-title">{stud.lastname}</h5>

                          <p className="card-text">{stud.email}</p>
                          {stud.role === "user" ? (
                            <p className="card-text text-danger">{stud.role}</p>
                          ) : stud.role === "oldstudent" ? (
                            <p className="card-text">Ancien élève</p>
                          ) : stud.role === "student" ? (
                            <p className="card-text">Elève</p>
                          ) : (
                            (stud.role === "admin" ||
                              stud.role === "superadmin") && (
                              <p className="card-text">{stud.role}</p>
                            )
                          )}

                          {!stud.classes ? (
                            <>
                              {stud.role === "oldstudent" ||
                              stud.role === "admin" ||
                              stud.role === "superadmin" ||
                              stud.role === "AdminVin" ? (
                                <p> - </p>
                              ) : (
                                <p className="card-text text-danger">
                                  Classe non attribué
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="card-text">{stud.className}</p>
                          )}
                          {/* add a drop down menu of classes and update the stud with the class selected */}
                          {stud.role === "oldstudent" ||
                          stud.role === "user" ||
                          stud.role === "admin" ||
                          stud.role === "superadmin" ||
                          stud.role === "AdminVin" ? (
                            stud.role === "oldstudent" ? (
                              <ul>
                                <li>Ancien élève</li>
                              </ul>
                            ) : stud.role === "user" ? (
                              <ul>
                                <li className="list-inline">
                                  changer le role de cet utilisateur afin de lui
                                  attribuer une classe
                                </li>
                              </ul>
                            ) : (
                              <ul className="list-inline">
                                <li className="list-inline-item">
                                  les admins, adminVin et les superadmin n'ont
                                  pas de classe assignée
                                </li>
                              </ul>
                            )
                          ) : (
                            <ul className="list-inline">
                              <li className="list-inline-item">
                                <select
                                  className="form-select"
                                  aria-label="Default select example"
                                  value={selectedClass[stud._id] || ""}
                                  onChange={(e) => {
                                    setSelectedClass({
                                      ...selectedClass,
                                      [stud._id]: e.target.value,
                                    });
                                  }}
                                >
                                  <option value="">Choisir la classe</option>
                                  {listOfClass.map((classe) => (
                                    <option value={classe._id} key={classe._id}>
                                      {classe.name}
                                    </option>
                                  ))}
                                  <option value="none">Aucune</option>
                                </select>
                              </li>
                              <li className="list-inline-item">
                                <button
                                  className="btn btn-primary"
                                  onClick={() => {
                                    if (selectedClass[stud._id] === "none") {
                                      // Handle the case where "null" is selected
                                      removeClassFromUser(stud._id); // Set selectedClass to null
                                    } else {
                                      assignClassToUser(
                                        stud._id,
                                        selectedClass[stud._id]
                                      ); // Assign the selected class to the user
                                    }
                                  }}
                                >
                                  {selectedClass[stud._id] === "none"
                                    ? "Retirer la classe"
                                    : "Assigner une classe"}{" "}
                                  {/* Change button text based on selection */}
                                </button>
                              </li>
                            </ul>
                          )}
                          {/* add a drop down menu of roles and update the user with the role selected */}
                          <ul className="list-inline">
                            <li className="list-inline-item">
                              <select
                                key={stud._id}
                                className="form-select"
                                aria-label="Default select example"
                                value={selectedRole}
                                onChange={(e) =>
                                  setSelectedRole(e.target.value)
                                }
                              >
                                <option value="">Choisir le role</option>
                                <option value="user">Utilisateur</option>
                                <option value="student">Eleve</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Super Admin</option>
                                <option value="oldstudent">Ancien éléve</option>
                                <option value="AdminVin">
                                  Admin Vinotheque
                                </option>

                                {/* Add more role options as needed */}
                              </select>
                            </li>
                            <li className="list-inline-item">
                              <button
                                className="btn btn-primary"
                                onClick={() =>
                                  updateUserRole(stud._id, selectedRole)
                                }
                              >
                                Modifier le role
                              </button>
                            </li>
                          </ul>
                          <br />
                          <br />
                          {/* add a button for delete user */}
                          {(stud.role !== "admin" ||
                            stud.role !== "superadmin") && (
                            <button
                              className="btn btn-danger"
                              onClick={() => deleteUser(stud._id)}
                            >
                              Supprimer l'utilisateur
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="table-responsive text-break">
                  <table className="table table-striped table-bordered table-hover">
                    <thead>
                      <tr>
                        <th scope="col">prénom</th>
                        <th scope="col">nom</th>
                        <th scope="col">email</th>
                        <th scope="col">role</th>
                        <th scope="col">classe</th>
                        <th scope="col">change de classe</th>
                        <th sope="col">modifie le role</th>
                        <th scope="col">supprime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listOfUser.map((stud) => (
                        <tr key={stud._id}>
                          <td>{stud.firstname}</td>
                          <td>{stud.lastname}</td>
                          <td>{stud.email}</td>
                          {stud.role === "user" ? (
                            <td>
                              <span className="bg-danger text-white">
                                {stud.role}
                              </span>
                            </td>
                          ) : (
                            stud.role === "oldstudent" && <td>Ancien élève</td>
                          )}
                          {stud.role === "student" ? (
                            <td>Eleve</td>
                          ) : (
                            (stud.role === "admin" ||
                              stud.role === "superadmin" ||
                              stud.role === "AdminVin") && <td>{stud.role}</td>
                          )}
                          {!stud.classes ? (
                            <td>
                              {stud.role === "oldstudent" ||
                              stud.role === "admin" ||
                              stud.role === "superadmin" ||
                              stud.role === "AdminVin" ? (
                                <span>-</span>
                              ) : (
                                <span className="bg-danger text-white">
                                  Classe non attribué
                                </span>
                              )}
                            </td>
                          ) : (
                            <td>{stud.className}</td>
                          )}
                          {stud.role === "oldstudent" ||
                          stud.role === "user" ||
                          stud.role === "admin" ||
                          stud.role === "superadmin" ||
                          stud.role === "AdminVin" ? (
                            stud.role === "oldstudent" ? (
                              <td>Ancien élève</td>
                            ) : stud.role === "user" ? (
                              <td>
                                changer le role de cet utilisateur afin de lui
                                attribuer une classe
                              </td>
                            ) : (
                              <td>
                                les admins, adminVin et les superadmin n'ont pas
                                de classe assignée
                              </td>
                            )
                          ) : (
                            <td>
                              <ul className="list-inline">
                                <li className="list-inline-item">
                                  <select
                                    className="form-select"
                                    aria-label="Default select example"
                                    value={selectedClass[stud._id] || ""}
                                    onChange={(e) => {
                                      setSelectedClass({
                                        ...selectedClass,
                                        [stud._id]: e.target.value,
                                      });
                                    }}
                                  >
                                    <option value="">Choisir la classe</option>
                                    {listOfClass.map((classe) => (
                                      <option
                                        value={classe._id}
                                        key={classe._id}
                                      >
                                        {classe.name}
                                      </option>
                                    ))}
                                    <option value="none">Aucune</option>
                                  </select>
                                </li>
                                <li className="list-inline-item">
                                  <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                      if (selectedClass[stud._id] === "none") {
                                        // Handle the case where "null" is selected
                                        removeClassFromUser(stud._id); // Set selectedClass to null
                                      } else {
                                        assignClassToUser(
                                          stud._id,
                                          selectedClass[stud._id]
                                        ); // Assign the selected class to the user
                                      }
                                    }}
                                  >
                                    {selectedClass[stud._id] === "none"
                                      ? "Retirer la classe"
                                      : "Assigner une classe"}{" "}
                                    {/* Change button text based on selection */}
                                  </button>
                                </li>
                              </ul>
                            </td>
                          )}
                          <td>
                            <ul className="list-inline">
                              {stud.role === "superadmin" ? (
                                <li>ne peut etre modifié</li>
                              ) : (
                                <>
                                  <li className="list-inline-item">
                                    <select
                                      className="form-select"
                                      aria-label="Default select example"
                                      value={selectedRole}
                                      onChange={(e) =>
                                        setSelectedRole(e.target.value)
                                      }
                                    >
                                      <option value="">
                                        {" "}
                                        Choisissez le role
                                      </option>
                                      <option value="user">Utilisateur</option>
                                      <option value="student">Elève</option>
                                      <option value="admin">Admin</option>
                                      <option value="superadmin">
                                        Super Admin
                                      </option>
                                      <option value="oldstudent">
                                        Ancien élève
                                      </option>
                                      <option value="AdminVin">
                                        Admin Vinotheque
                                      </option>
                                      {/* Add more role options as needed */}
                                    </select>
                                  </li>
                                  <li className="list-inline-item">
                                    <button
                                      className="btn btn-primary"
                                      onClick={() =>
                                        updateUserRole(stud._id, selectedRole)
                                      }
                                    >
                                      Modifier le role
                                    </button>
                                  </li>
                                </>
                              )}
                            </ul>
                          </td>
                          <td>
                            {stud.role !== "admin" &&
                              stud.role !== "superadmin" && (
                                <button
                                  className="btn btn-danger"
                                  onClick={() => deleteUser(stud._id)}
                                  disabled={
                                    stud.role === "admin" ||
                                    stud.role === "superadmin"
                                  }
                                >
                                  Supprimer l'utilisateur
                                </button>
                              )}
                          </td>
                          {/* ... (other table data) */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Admin;
