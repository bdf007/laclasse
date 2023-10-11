// import "./App.css";
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserContext } from "./context/UserContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// css
import "./App.css";

// components
import NavBarre from "./component/navBarre";
import Home from "./pages/Home";
import AboutPublic from "./pages/AboutPublic";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Bibliotheque from "./pages/Bibliotheque";
import Professor from "./pages/Professor";
import Student from "./pages/Student";
import User from "./pages/User";

import Footer from "./component/footer";

// API functions
import { getUser } from "./api/user";

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = getUser()
      .then((res) => {
        if (res.error) toast(res.error);
        else setUser(res.firstname, res.role);
      })
      .catch((err) => toast(err));

    return () => unsubscribe;
  }, [setUser]);
  return (
    <div>
      <Router>
        <UserContext.Provider value={{ user, setUser }}>
          <ToastContainer />
          <NavBarre />
          <Routes>
            {!user ? (
              <>
                <Route exact path="/" element={<Home />} />
                <Route exact path="/aboutpublic" element={<AboutPublic />} />
                <Route exact path="/bibliotheque" element={<Bibliotheque />} />
                <Route exact path="/signup" element={<Signup />} />
                <Route exact path="/login" element={<Login />} />
                <Route exact path="/contact" element={<Contact />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : // check if user is admin
            user.role === "admin" || user.role === "superadmin" ? (
              <>
                <Route exact path="/" element={<Admin />} />
                <Route exact path="/contact" element={<Contact />} />
                <Route exact path="/bibliotheque" element={<Bibliotheque />} />
                <Route path="*" element={<Navigate to="/admin" />} />
              </>
            ) : // if user is user
            user.role === "user" ? (
              <>
                <Route exact path="/" element={<User />} />
                <Route exact path="/contact" element={<Contact />} />
                <Route exact path="/bibliotheque" element={<Bibliotheque />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : // if user is professor
            user.role === "professor" ? (
              <>
                <Route exact path="/" element={<Professor />} />
                <Route exact path="/contact" element={<Contact />} />
                <Route exact path="/bibliotheque" element={<Bibliotheque />} />
                <Route path="*" element={<Navigate to="/professor" />} />
              </>
            ) : (
              // if user is student
              user.role === "student" && (
                <>
                  <Route exact path="/" element={<Student />} />
                  <Route exact path="/contact" element={<Contact />} />
                  <Route path="*" element={<Navigate to="/student" />} />
                  <Route
                    exact
                    path="/bibliotheque"
                    element={<Bibliotheque />}
                  />
                </>
              )
            )}
          </Routes>
          <Footer />
        </UserContext.Provider>
      </Router>
    </div>
  );
}

export default App;
