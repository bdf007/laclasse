import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { getUser } from "../api/user";
import { toast } from "react-toastify";
import Class from "../component/class";
const Admin = () => {
  const { user, setUser } = useContext(UserContext);
  const [listOfUser, setListOfUser] = useState([]);
  // get the list of the classes
  const [listOfClass, setListOfClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

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

                user.classeName = classResponse.data.name;
                return user;
              } catch (err) {
                toast(err);
                return user;
              }
            }
            return user;
          })
        );
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
  }, [setListOfUser]);

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

  return !user ? (
    <div className="container text-center home" style={{ marginTop: "12rem" }}>
      <div className="alert alert-primary p-5">
        <h1>Not autorized</h1>
      </div>
    </div>
  ) : (
    <>
      {user.role === "admin" && (
        <div
          className="container text-center home"
          style={{ marginTop: "12rem" }}
        >
          <div className="alert alert-primary p-5">
            <h1>
              {" "}
              <span className="text-success">{user.role}'s</span> Admin
            </h1>
            <Class />
            <div className="text-center">
              {/* list all user */}
              <h1 className="text-center">Liste des utilisateurs</h1>
              <div className="row">
                {listOfUser.map((user) => (
                  <div className="col-md-4" key={user._id}>
                    <div className="card m-2">
                      <div className="card-body">
                        <h5 className="card-title">{user.firstname}</h5>
                        <h5 className="card-title">{user.lastname}</h5>

                        <p className="card-text">{user.email}</p>
                        <p className="card-text">{user.role}</p>
                        {!user.classes ? (
                          <p className="card-text">No class assigned</p>
                        ) : (
                          <p className="card-text">{user.classeName}</p>
                        )}
                        {/* add a drop down menu of classes and update the user with the class selected */}
                        <select
                          className="form-select"
                          aria-label="Default select example"
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                        >
                          <option value="">Choose a class</option>
                          {listOfClass.map((classe) => (
                            <option value={classe._id} key={classe._id}>
                              {classe.name}
                            </option>
                          ))}
                          <option value="none">None</option>
                        </select>
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
                        {/* add a button for delete user */}
                        <button
                          className="btn btn-danger"
                          onClick={() => deleteUser(user._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Admin;
