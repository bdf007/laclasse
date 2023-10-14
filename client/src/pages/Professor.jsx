import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { getUser } from "../api/user";
import { toast } from "react-toastify";
const Professor = () => {
  const { user, setUser } = useContext(UserContext);
  // axios call to get all the users
  const [users, setUsers] = useState([]);

  const getUsers = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/users`)
      .then((res) => {
        // setUsers(res.data);
        fetchAndSetClassNames(res.data);
      })
      .catch((err) => console.log(err));
  };

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
      setUsers(updatedUsers);
    } catch (error) {
      console.error(error);
      toast(error);
    }
  };

  useEffect(() => {
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUsers, setUser]);

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
  return !user ? (
    <div className="container text-center home" style={{ marginTop: "12rem" }}>
      <div className="alert alert-primary p-5">
        <h1>Not autorized</h1>
      </div>
    </div>
  ) : (
    <>
      {user.role === "professor" && (
        <div
          className="container text-center home"
          style={{ marginTop: "12rem" }}
        >
          <div className="alert alert-primary p-5">
            <h1>
              {" "}
              <span className="text-success">
                {user.firstname}'s
              </span> Professor {user.role}
            </h1>
            <div className="text-center">
              {/* list all user */}
              <h1 className="text-center">Liste des utilisateurs</h1>
              <div className="row">
                {users.map((user) => (
                  <div className="col-md-4" key={user._id}>
                    <div className="card m-2">
                      <div className="card-body">
                        <h5 className="card-title">{user.firstname}</h5>
                        <h5 className="card-title">{user.lastname}</h5>

                        <p className="card-text">{user.email}</p>
                        <p className="card-text">{user.role}</p>
                        <p className="card-text">{user.classeName}</p>
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

export default Professor;
