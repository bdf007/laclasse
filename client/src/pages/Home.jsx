import React, { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";

// design

const Home = () => {
  // axios call to get all the users
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/users`)
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <>
      <div className="home">
        <Helmet>
          <meta
            name="description"
            content="Bienvenue sur mon portfolio - Christophe Midelet"
          />
          <meta
            name="keyword"
            content="portfolio, développeur web, fullstack, react, nodejs, express, mongodb, christophe midelet"
          />
        </Helmet>

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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
