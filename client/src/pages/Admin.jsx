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
  // get the list of the classes
  const [listOfClass, setListOfClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [viewMode, setViewMode] = useState("cards");

  useEffect(() => {
    // Fetch users and classes
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/users`)
      .then((res) => {
        // setListOfUser(res.data);
        fetchAndSetClassNames(res.data);
      })
      .catch((error) => {
        console.error(error);
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
        console.error(error);
        toast(error);
      }
    };

    axios.get(`${process.env.REACT_APP_API_URL}/api/classes`).then((res) => {
      setListOfClass(res.data);
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

  // delete function for user
  const deleteUser = (id) => {
    axios.delete(`${process.env.REACT_APP_API_URL}/api/user/${id}`).then(() => {
      toast.success("User deleted");
      setListOfUser((prevList) => prevList.filter((val) => val._id !== id));
    });
  };

  // const updateUser = (id) => {
  //   axios
  //     .put(`${process.env.REACT_APP_API_URL}/api/user/${id}`, {
  //       class: selectedClass,
  //     })
  //     .then(() => {
  //       toast.success("User updated");
  //       setSelectedClass("");
  //     })
  //     .catch((err) => console.log(err));
  // };

  const updateUserRole = (id) => {
    axios
      .put(`${process.env.REACT_APP_API_URL}/api/user/${id}/change-role`, {
        role: selectedRole, // Send the selected role to the server
      })
      .then(() => {
        toast.success("User role updated successfully");
        setSelectedRole(""); // Clear the selected role after updating
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error updating user role");
      });
  };
  const assignClassToUser = (userId) => {
    // Assign selected class to user
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/user/assign-class`, {
        userId: userId,
        classId: selectedClass,
      })
      .then(() => {
        toast.success("Class assigned to user");
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
          toast.success("Class removed from user");
          setSelectedClass(""); // Clear selected class
          window.location.reload();
        } else {
          const errorMessage =
            response.data && response.data.error
              ? response.data.error
              : "An unknown error occurred while removing class from user";
          toast.error(errorMessage);
          console.error(response); // Log the response for debugging
        }
      })
      .catch((err) => {
        const errorMessage =
          err.response && err.response.data && err.response.data.error
            ? err.response.data.error
            : "An unknown error occurred while removing class from user";
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
          style={{ marginTop: "1rem", paddingBottom: "20rem" }}
        >
          <div className="alert alert-primary p-5">
            <h1>
              {" "}
              <span className="text-success">{user.firstname}'s</span> Admin
            </h1>
            <Class />
            <div className="text-center">
              {/* list all user */}
              <h1 className="text-center">Liste des utilisateurs</h1>
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
              </div>
              {viewMode === "table" ? (
                <div className="row">
                  {listOfUser.map((user) => (
                    <div className="col-md-4" key={user._id}>
                      <div className="card m-2">
                        <div className="card-body">
                          <h5 className="card-title">{user.firstname}</h5>
                          <h5 className="card-title">{user.lastname}</h5>

                          <p className="card-text">{user.email}</p>
                          {user.role === "user" ? (
                            <p className="card-text text-danger">{user.role}</p>
                          ) : (
                            <p className="card-text">{user.role}</p>
                          )}
                          {!user.classes ? (
                            <>
                              {user.role === "oldstudent" ? (
                                <p> no need</p>
                              ) : (
                                <p className="card-text text-danger">
                                  No class assigned
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="card-text">{user.className}</p>
                          )}
                          {/* add a drop down menu of classes and update the user with the class selected */}
                          {user.role === "oldstudent" ? (
                            <ul>
                              <li>Old Student</li>
                            </ul>
                          ) : (
                            <ul className="list-inline">
                              <li className="list-inline-item">
                                <select
                                  className="form-select"
                                  aria-label="Default select example"
                                  value={selectedClass}
                                  onChange={(e) =>
                                    setSelectedClass(e.target.value)
                                  }
                                >
                                  <option value="">Choose a class</option>
                                  {listOfClass.map((classe) => (
                                    <option value={classe._id} key={classe._id}>
                                      {classe.name}
                                    </option>
                                  ))}
                                  <option value="none">None</option>
                                </select>
                              </li>
                              <li className="list-inline-item">
                                <button
                                  className="btn btn-primary"
                                  onClick={() => {
                                    if (selectedClass === "none") {
                                      // Handle the case where "null" is selected
                                      removeClassFromUser(user._id); // Set selectedClass to null
                                    } else {
                                      assignClassToUser(user._id); // Assign the selected class to the user
                                    }
                                  }}
                                >
                                  {selectedClass === "none"
                                    ? "Clear Class"
                                    : "Assign Class"}{" "}
                                  {/* Change button text based on selection */}
                                </button>
                              </li>
                            </ul>
                          )}
                          {/* add a drop down menu of roles and update the user with the role selected */}
                          <ul className="list-inline">
                            <li className="list-inline-item">
                              <select
                                className="form-select"
                                value={selectedRole}
                                onChange={(e) =>
                                  setSelectedRole(e.target.value)
                                }
                              >
                                <option value="user">User</option>
                                <option value="student">Student</option>
                                <option value="professor">Professor</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Super Admin</option>
                                <option value="oldstudent">Old Student</option>
                                {/* Add more role options as needed */}
                              </select>
                            </li>
                            <li className="list-inline-item">
                              <button
                                className="btn btn-primary"
                                onClick={() =>
                                  updateUserRole(user._id, selectedRole)
                                }
                              >
                                Update Role
                              </button>
                            </li>
                          </ul>
                          <br />
                          <br />
                          {/* add a button for delete user */}
                          <button
                            className="btn btn-danger"
                            onClick={() => deleteUser(user._id)}
                          >
                            Delete User
                          </button>
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
                      {listOfUser.map((user) => (
                        <tr key={user._id}>
                          <td>{user.firstname}</td>
                          <td>{user.lastname}</td>
                          <td>{user.email}</td>
                          {user.role === "user" ? (
                            <td>
                              <span className="bg-danger text-white">
                                {user.role}
                              </span>
                            </td>
                          ) : (
                            <td>{user.role}</td>
                          )}
                          {!user.classes ? (
                            <td>
                              {user.role === "oldstudent" ? (
                                <span>No need</span>
                              ) : (
                                <span className="bg-danger text-white">
                                  No class assigned
                                </span>
                              )}
                            </td>
                          ) : (
                            <td>{user.className}</td>
                          )}
                          {user.role === "oldstudent" ? (
                            <td>old Student</td>
                          ) : (
                            <td>
                              <ul className="list-inline">
                                <li className="list-inline-item">
                                  <select
                                    className="form-select"
                                    aria-label="Default select example"
                                    value={selectedClass}
                                    onChange={(e) =>
                                      setSelectedClass(e.target.value)
                                    }
                                  >
                                    <option value="">Choose a class</option>
                                    {listOfClass.map((classe) => (
                                      <option
                                        value={classe._id}
                                        key={classe._id}
                                      >
                                        {classe.name}
                                      </option>
                                    ))}
                                    <option value="none">None</option>
                                  </select>
                                </li>
                                <li className="list-inline-item">
                                  <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                      if (selectedClass === "none") {
                                        // Handle the case where "null" is selected
                                        removeClassFromUser(user._id); // Set selectedClass to null
                                      } else {
                                        assignClassToUser(user._id); // Assign the selected class to the user
                                      }
                                    }}
                                  >
                                    {selectedClass === "none"
                                      ? "Clear Class"
                                      : "Assign Class"}{" "}
                                    {/* Change button text based on selection */}
                                  </button>
                                </li>
                              </ul>
                            </td>
                          )}
                          <td>
                            <ul className="list-inline">
                              <li className="list-inline-item">
                                <select
                                  className="form-select"
                                  value={selectedRole}
                                  onChange={(e) =>
                                    setSelectedRole(e.target.value)
                                  }
                                >
                                  <option value="user">User</option>
                                  <option value="student">Student</option>
                                  <option value="professor">Professor</option>
                                  <option value="admin">Admin</option>
                                  <option value="superadmin">
                                    Super Admin
                                  </option>
                                  <option value="oldstudent">
                                    Old Student
                                  </option>
                                  {/* Add more role options as needed */}
                                </select>
                              </li>
                              <li className="list-inline-item">
                                <button
                                  className="btn btn-primary"
                                  onClick={() =>
                                    updateUserRole(user._id, selectedRole)
                                  }
                                >
                                  Update Role
                                </button>
                              </li>
                            </ul>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger"
                              onClick={() => deleteUser(user._id)}
                            >
                              Delete User
                            </button>
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
