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
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Admin from "./pages/Admin";

import Footer from "./component/footer";

// API functions
import { getUser } from "./api/user";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = getUser()
      .then((res) => {
        if (res.error) toast(res.error);
        else setUser(res.username);
      })
      .catch((err) => toast(err));

    return () => unsubscribe;
  }, []);
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
                <Route exact path="/signup" element={<Signup />} />
                <Route exact path="/login" element={<Login />} />{" "}
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : (
              <>
                <Route exact path="/" element={<Admin />} />

                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
        </UserContext.Provider>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
