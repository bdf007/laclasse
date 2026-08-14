import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import logo from "../assets/logo.webp";

// API functions
import { logout, getUser } from "../api/user";

const NavBarre = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
        // Pas de toast ici : l'absence de connexion est un état normal
        // pour un visiteur anonyme, pas une erreur à signaler.
        if (!res.error) setUser(res);
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
    setIsOpen(false);
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

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar navbar-expand-lg ">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/" onClick={closeMenu}>
          <img src={logo} alt="logo" width="100px" height="100px" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto">
            {!user ? (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/AboutPublic"
                    onClick={closeMenu}
                  >
                    A propos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/bibliotheque"
                    onClick={closeMenu}
                  >
                    Bibliothéque
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/contact" onClick={closeMenu}>
                    Contact
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup" onClick={closeMenu}>
                    S'inscrire
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={closeMenu}>
                    Connexion
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/review" onClick={closeMenu}>
                    Avis
                  </Link>
                </li>
              </>
            ) : (
              <>
                {(user.role === "admin" || user.role === "superadmin") && (
                  <>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/Admin"
                        onClick={closeMenu}
                      >
                        Admin
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/AdminInfo"
                        onClick={closeMenu}
                      >
                        Gestion de mes informations
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/AboutPublic"
                        onClick={closeMenu}
                      >
                        A propos
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/bibliotheque"
                        onClick={closeMenu}
                      >
                        Gestion de la Bibliothéque
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/Vinotheque"
                        onClick={closeMenu}
                      >
                        Vinotheque
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/contact"
                        onClick={closeMenu}
                      >
                        Gestion des Contact
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/chatAdmin"
                        onClick={closeMenu}
                      >
                        Gestion des messages de chat
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/review"
                        onClick={closeMenu}
                      >
                        Gestion des Avis
                      </Link>
                    </li>
                  </>
                )}

                {user.role === "student" && (
                  <>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/Student"
                        onClick={closeMenu}
                      >
                        Mes infos
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/bibliotheque"
                        onClick={closeMenu}
                      >
                        Bibliothéque
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/contact"
                        onClick={closeMenu}
                      >
                        Contacter mon professeur
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/review"
                        onClick={closeMenu}
                      >
                        Avis
                      </Link>
                    </li>
                  </>
                )}
                {user.role === "user" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/User" onClick={closeMenu}>
                        Mes infos
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/bibliotheque"
                        onClick={closeMenu}
                      >
                        Bibliothéque
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/contact"
                        onClick={closeMenu}
                      >
                        Contact le professeur
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/review"
                        onClick={closeMenu}
                      >
                        Avis
                      </Link>
                    </li>
                  </>
                )}
                {user.role === "AdminVin" && (
                  <>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/AdminInfo"
                        onClick={closeMenu}
                      >
                        Gestion de mes informations
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link"
                        to="/Vinotheque"
                        onClick={closeMenu}
                      >
                        Vinotheque
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
                    Déconnexion
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
