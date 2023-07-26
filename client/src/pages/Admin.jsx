import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { getUser } from "../api/user";
import { toast } from "react-toastify";
const Admin = () => {
  const { user, setUser } = useContext(UserContext);
  // axios call to get all the users
  const [listOfUser, setLisOfUser] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/users`)
      .then((res) => {
        setLisOfUser(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

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
  }, [setUser, user]);

  // delete function for user
  const deleteUser = (id) => {
    axios.delete(`${process.env.REACT_APP_API_URL}/api/user/${id}`).then(() => {
      toast.success("User deleted");
      setLisOfUser((prevList) => prevList.filter((val) => val._id !== id));
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
