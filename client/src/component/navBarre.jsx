import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import logo from "../assets/logo.png";

// API functions
import { logout, getUser } from "../api/user";

const NavBarre = () => {
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

  // const handleAdmin = async (e) => {
  //   e.preventDefault();
  //   navigate("/admin");
  // };

  // const handlebibliotheque = async (e) => {
  //   e.preventDefault();
  //   navigate("/bibliotheque");
  // };

  // const handleProfessor = async (e) => {
  //   e.preventDefault();
  //   navigate("/professor");
  // };

  // const handleStudent = async (e) => {
  //   e.preventDefault();
  //   navigate("/student");
  // };

  return (
    <nav className="navbar navbar-expand-lg ">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img src={logo} alt="logo" width="100px" height="100px" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {!user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/AboutPublic">
                    A propos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/bibliotheque">
                    Bibliothéque
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/contact">
                    Contact
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup">
                    Sign Up
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
              </>
            ) : (
              <>
                {(user.role === "admin" || user.role === "superadmin") && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/">
                        Admin
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/bibliotheque">
                        Gestion de la Bibliothéque
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/contact">
                        Gestion des Contact
                      </Link>
                    </li>
                  </>
                )}
                {user.role === "professor" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/">
                        Professor
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/bibliotheque">
                        Bibliothéque
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/contact">
                        Contact
                      </Link>
                    </li>
                  </>
                )}
                {user.role === "student" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/">
                        Mes infos
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/bibliotheque">
                        Bibliothéque
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/contact">
                        Contact mon professeur
                      </Link>
                    </li>
                  </>
                )}
                {user.role === "user" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/">
                        Mes infos
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/bibliotheque">
                        Bibliothéque
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/contact">
                        Contact le professeur
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/bibliotheque">
                        Bibliothéque
                      </Link>
                    </li>
                  </>
                )}
                <li className="nav-item">
                  <span
                    className="nav-link"
                    style={{ cursor: "pointer" }}
                    onClick={handleLogout}
                  >
                    Logout
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBarre;
