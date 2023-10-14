import React from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { getUser } from "../api/user";
import { toast } from "react-toastify";

const User = () => {
  const { user, setUser } = useContext(UserContext);
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
  return (
    <div className="container text-center" style={{ paddingBottom: "12rem" }}>
      <h1>welcome {user.firstname}</h1>
      <div className="row">
        <div className="col-md-6">
          <h2>Mes infos</h2>
          <p>
            prénom : {user.firstname} <br /> nom : {user.lastname}
            <br />
            email : {user.email}
          </p>
        </div>
        <div className="col-md-6">
          {!user.classes ? (
            <p>Vous n'avez pas encore de classe</p>
          ) : (
            <>
              <p>Vous êtes dans la classe {user.classes}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default User;
