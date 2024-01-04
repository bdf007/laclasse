import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";

import "../App.css";
import "../cssFiles/Footercss.css";

// API functions
import { logout, getUser } from "../api/user";

const Footer = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [loggedIn, setLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    if (user) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, [user]);

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

    // Fetch user data only when logged in
    if (loggedIn) {
      fetchData();
    }
  }, [setUser, loggedIn]);

  const handleLogout = async (e) => {
    e.preventDefault();
    logout()
      .then((res) => {
        toast.success(res.message);
        // set user to null
        setUser(null);
        // redirect to login page
        navigate("/login");
      })
      .catch((err) => console.log(err));
  };

  return (
    <footer className="footer-bs">
      <div className="row pe-0 ps-0 me-0 ms-0">
        <div className="footer-brand ">
          <ul className="ms-auto list-inline d-flex justify-content-around text-break">
            <li className="list-inline-item">
              <Link className="nav-link" to="/">
                Acceuil
              </Link>
            </li>
            {!user ? (
              <>
                <li className="list-inline-item">
                  <Link className="nav-link" to="/aboutpublic">
                    A propos
                  </Link>
                </li>
                <li className="list-inline-item">
                  <Link className="nav-link" to="/contact">
                    Contact
                  </Link>
                </li>
                <li className="list-inline-item">
                  <Link className="nav-link" to="/bibliotheque">
                    Bibliothéque
                  </Link>
                </li>
                <li className="list-inline-item">
                  <Link className="nav-link" to="/signup">
                    S'inscrire
                  </Link>
                </li>
                <li className="list-inline-item">
                  <Link className="nav-link" to="/login">
                    Connexion
                  </Link>
                </li>
              </>
            ) : (
              <>
                {(user.role === "admin" || user.role === "superadmin") && (
                  <>
                    <li className="list-inline-item">
                      <Link className="nav-link" to="/Admin">
                        Admin
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/AdminInfo">
                        Gestion de mes informations
                      </Link>
                    </li>
                    <li className="list-inline-item">
                      <Link className="nav-link" to="/contact">
                        Gestion des Contact
                      </Link>
                    </li>
                    <li className="list-inline-item">
                      <Link className="nav-link" to="/bibliotheque">
                        Gestion de la Bibliothéque
                      </Link>
                    </li>
                  </>
                )}

                {user.role === "student" && (
                  <>
                    <li className="list-inline-item">
                      <Link className="nav-link" to="/Student">
                        Mes infos
                      </Link>
                    </li>
                    <li className="list-inline-item">
                      <Link className="nav-link" to="/contact">
                        Contacter mon professeur
                      </Link>
                    </li>
                    <li className="list-inline-item">
                      <Link className="nav-link" to="/bibliotheque">
                        Bibliothéque
                      </Link>
                    </li>
                  </>
                )}
                {user.role === "user" && (
                  <>
                    <li className="list-inline-item">
                      <Link className="nav-link" to="/User">
                        Mes infos
                      </Link>
                    </li>
                    <li className="list-inline-item">
                      <Link className="nav-link" to="/contact">
                        Contact le professeur
                      </Link>
                    </li>
                    <li className="list-inline-item">
                      <Link className="nav-link" to="/bibliotheque">
                        Bibliothéque
                      </Link>
                    </li>
                  </>
                )}
                <li className="list-inline-item">
                  <span
                    className="nav-link"
                    style={{ cursor: "pointer" }}
                    onClick={handleLogout}
                  >
                    Déconnexion
                  </span>
                </li>
              </>
            )}
          </ul>
          <div className="text-center">
            site réalisé par{" "}
            <a href="https://christophe-midelet.fr" target="blank">
              {" "}
              christophe Midelet
            </a>{" "}
            avec MongoDB, Express, React, NodeJS
          </div>
          <p className="text-center">
            Mis en ligne avec Docker, Caprover et OVH
          </p>

          <p className="text-center">© 2024, All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
