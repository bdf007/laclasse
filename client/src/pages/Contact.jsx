import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import spin from "../assets/Spin.gif";

const Contact = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [classes, setClasses] = useState("");
  const [message, setMessage] = useState("");
  const [listOfContact, setListOfContact] = useState([]);
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState("Nouveau message de contact");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const getContact = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/contact`
      );
      setListOfContact(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getContact();
  }, []);

  const handleFirstnameChange = (e) => {
    setFirstname(e.target.value);
  };

  const handleLastnameChange = (e) => {
    setLastname(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleUpload = () => {
    if (user) {
      setFirstname(user.firstname);
      setLastname(user.lastname);
      setEmail(user.email);
      setClasses(user.classes);
      setSubject(
        `Nouveau message de contact de ${user.firstname} ${user.lastname}`
      );
    }
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/contact`, {
        firstname: firstname,
        lastname: lastname,
        email: email,
        message: message,
        classes: classes,
      })
      .then((response) => {
        toast.success("Message envoyé");
        setIsLoading(true);
        setListOfContact([
          ...listOfContact,
          {
            _id: response.data._id,
            firstname: firstname,
            lastname: lastname,
            email: email,
            message: message,
            classes: classes,
          },
        ]);

        // reset the form
        setFirstname("");
        setLastname("");
        setEmail("");
        setMessage("");
        setSubject("Nouveau message de contact");

        // clear the input field
        // document.getElementById("firstname").value = "";
        // document.getElementById("lastname").value = "";
        // document.getElementById("email").value = "";
        // document.getElementById("message").value = "";
      });
  };

  const handleDelete = (id) => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/api/contact/${id}`)
      .then(() => {
        toast.success("Message supprimé");
        setListOfContact(
          listOfContact.filter((value) => {
            return value._id !== id;
          })
        );
      });
  };
  useEffect(() => {
    // Populate form fields with user data if the user is logged in and has the role "user" or "student"
    if (user && (user.role === "user" || user.role === "student")) {
      setFirstname(user.firstname);
      setLastname(user.lastname);
      setEmail(user.email);
      setClasses(user.classes);
    }
  }, [user]);

  return (
    <div className="home">
      <div
        className="row d-flex justify-content-center align-items-center"
        style={{ paddingBottom: "12rem" }}
      >
        <div className="container mt-5 mb-5 col-10 col-sm-8 col-md-6 col-lg-5">
          <h1 className="text-danger">Contactez moi</h1>
          {!user ? (
            !isLoading ? (
              <form
                action="https://formsubmit.co/stephanie.midelet@gmail.com"
                method="POST"
              >
                <input type="hidden" name="_subject" value={subject} />
                <input type="hidden" name="_captcha" value="false" />
                <input
                  type="hidden"
                  name="_next"
                  value="https://la-classe-de-francais.us/Contact"
                />
                <div className="form-group ">
                  <label htmlFor="firstname">Prénom*</label>
                  <input
                    value={firstname}
                    id="firstname"
                    name="firstname"
                    size="small"
                    className="form-control mb-3"
                    placeholder="Prénom"
                    label="Prénom*"
                    onChange={handleFirstnameChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastname">Nom*</label>
                  <input
                    value={lastname}
                    id="lastname"
                    name="lastname"
                    size="small"
                    className="form-control mb-3"
                    placeholder="Nom"
                    label="Nom*"
                    onChange={handleLastnameChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email*</label>
                  <input
                    value={email}
                    id="email"
                    name="email"
                    size="small"
                    className="form-control mb-3"
                    placeholder="Email"
                    label="Email*"
                    onChange={handleEmailChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message*</label>
                  <textarea
                    value={message}
                    id="message"
                    name="message"
                    size="small"
                    className="form-control mb-3"
                    placeholder="Message"
                    label="Message*"
                    onChange={handleMessageChange}
                  >
                    {""}
                  </textarea>
                  <p className="fs-6 text-muted">*: champs obligatoire</p>
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={
                      !firstname ||
                      !lastname ||
                      !email ||
                      !message ||
                      !emailRegex.test(email)
                    }
                    onClick={handleUpload}
                  >
                    Envoyer
                  </button>
                </div>
                <input type="hidden" name="_subject" value={subject} />
                <input type="hidden" name="_captcha" value="false" />
                <input
                  type="hidden"
                  name="_next"
                  value="https://la-classe-de-francais.us/Contact"
                />
              </form>
            ) : (
              <p>
                merci de patienter{" "}
                <span>
                  <img
                    src={spin}
                    alt="loading"
                    className="spin"
                    style={{ width: "2rem", height: "2rem" }}
                  />
                </span>
              </p>
            )
          ) : user.role === "admin" || user.role === "superadmin" ? (
            <div>
              {listOfContact.length === 0 && <h1>No message</h1>}
              {listOfContact.map((value) => {
                return (
                  <div key={value._id} className="card mb-3 bg-transparent">
                    <div className="card-body">
                      <h5 className="card-title">
                        {value.firstname} {value.lastname}
                      </h5>
                      <p className="card-text">
                        {new Date(value.date).toLocaleDateString("fr-FR")} à{" "}
                        {new Date(value.date).toLocaleTimeString("fr-FR")}
                      </p>
                      {value.classes && (
                        <h6 className="card-subtitle mb-2  bg-success text-white">
                          {value.classes}
                        </h6>
                      )}
                      <h6 className="card-subtitle mb-2 text-muted">
                        {value.email}
                      </h6>
                      <p className="card-text">{value.message}</p>
                      <p className="card-text">
                        <small className="text-muted">{value.Date}</small>
                      </p>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        handleDelete(value._id);
                      }}
                    >
                      Supprimer le message
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            (user.role === "user" || "student") &&
            (!isLoading ? (
              <form
                action="https://formsubmit.co/stephanie.midelet@gmail.com"
                method="POST"
              >
                <input type="hidden" name="_subject" value={subject} />
                <input type="hidden" name="_captcha" value="false" />
                <input
                  type="hidden"
                  name="_next"
                  value="https://la-classe-de-francais.us/Contact"
                />
                <div className="form-group">
                  <label htmlFor="firstname">Prénom*</label>
                  <input
                    value={user ? user.firstname : ""}
                    id="firstname"
                    name="firstname"
                    size="small"
                    className="form-control mb-3"
                    placeholder="Prénom"
                    label="Prénom*"
                    onChange={handleFirstnameChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastname">Nom*</label>
                  <input
                    value={user ? user.lastname : ""}
                    id="lastname"
                    name="lastname"
                    size="small"
                    className="form-control mb-3"
                    placeholder="Nom"
                    label="Nom*"
                    onChange={handleLastnameChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email*</label>
                  <input
                    value={user ? user.email : ""}
                    id="email"
                    name="email"
                    size="small"
                    className="form-control mb-3"
                    placeholder="Email"
                    label="Email*"
                    onChange={handleEmailChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message*</label>
                  <textarea
                    value={message}
                    id="message"
                    name="message"
                    size="small"
                    className="form-control mb-3"
                    placeholder="Message"
                    label="Message*"
                    onChange={handleMessageChange}
                  >
                    {""}
                  </textarea>
                  <p className="fs-6 text-muted">*: champs obligatoire</p>
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={
                      !firstname ||
                      !lastname ||
                      !email ||
                      !message ||
                      !emailRegex.test(email)
                    }
                    onClick={handleUpload}
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            ) : (
              <p>
                merci de patienter{" "}
                <span>
                  <img
                    src={spin}
                    alt="loading"
                    className="spin"
                    style={{ width: "2rem", height: "2rem" }}
                  />
                </span>
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
