import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { toast } from "react-toastify";

//design
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";

const CommentUploader = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [className, setClassName] = useState("");
  const [listOfClassNames, setListOfClassNames] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [searchClass, setSearchClass] = useState("");
  const [searchFirstname, setSearchFirstname] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchComment, setSearchComment] = useState("");

  const [userId, setUserId] = useState("");
  const [comment, setComment] = useState("");
  const { user } = useContext(UserContext);

  const [listOfComment, setListOfComment] = useState([]);

  //get the size of the window
  // eslint-disable-next-line
  const [width, setWidth] = useState(window.innerWidth);
  const [show, setShow] = useState(true);

  const getComment = async () => {
    try {
      if (user.role === "admin" || user.role === "superadmin") {
        setClassName(selectedClass);
        await axios
          .get(`${process.env.REACT_APP_API_URL}/api/comment`)
          .then((res) => {
            setListOfComment(res.data);
          });
      } else {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/comment/${user.classes}`
        );
        setListOfComment(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getListOfClassNames = async () => {
    try {
      await axios
        .get(`${process.env.REACT_APP_API_URL}/api/classes`)
        .then((res) => {
          setListOfClassNames(res.data);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchClass = (e) => {
    const value = e.target.value;
    setSearchClass(value);
    localStorage.setItem("searchClass", value);
  };

  const handleSearchFirstname = (e) => {
    const value = e.target.value;
    setSearchFirstname(value);
    localStorage.setItem("searchFirstname", value);
  };

  const handleSearchEmail = (e) => {
    const value = e.target.value;
    setSearchEmail(value);
    localStorage.setItem("searchEmail", value);
  };

  const handleSearchComment = (e) => {
    const value = e.target.value;
    setSearchComment(value);
    localStorage.setItem("searchComment", value);
  };

  useEffect(() => {
    getComment();
    getListOfClassNames();
    // deactivate eslint warning
    // eslint-disable-next-line
  }, [comment, setComment]);

  useEffect(() => {
    setFirstname(user.firstname);
    setLastname(user.lastname);
    setEmail(user.email);
    setClassName(user.classes);
    setUserId(user._id);
  }, [user]);

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleUpload = () => {
    setFirstname(user.firstname);
    setLastname(user.lastname);
    setEmail(user.email);
    setUserId(user._id);
    if (user.role === "admin" || user.role === "superadmin") {
      setClassName("admin");
    }
    setClassName(user.classes);
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/comment`, {
        firstname: firstname,
        lastname: lastname,
        email: email,
        comment: comment,
        user: userId,
        classes: className,
      })
      .then((response) => {
        toast.success("Commentaire posté avec succès");
        setListOfComment([
          ...listOfComment,
          {
            _id: response.data._id,
            firstname: firstname,
            lastname: lastname,
            email: email,
            comment: comment,
            user: userId,
            classes: className,
          },
        ]);
        // reset the form

        setComment("");
        setSelectedClass("");

        // clear the input field
        // document.getElementById("firstname").value = "";
        // document.getElementById("lastname").value = "";
        // document.getElementById("email").value = "";
        document.getElementById("comment").value = "";
      });
  };

  const deleteComment = (id) => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/api/comment/${id}`)
      .then(() => {
        toast.success("Commentaire supprimé avec succès");
        setListOfComment(
          listOfComment.filter((val) => {
            return val._id !== id;
          })
        );
      });
  };

  // check if the size of the window is a mobile size
  const handleResize = () => {
    const newWidth = window.innerWidth;
    setWidth(newWidth);
    if (newWidth < 1200) {
      setShow(false);
    } else {
      setShow(true);
    }
  };
  useEffect(() => {
    handleResize(); // Call it on initial render
    window.addEventListener("resize", handleResize); // Attach it to the resize event

    // Don't forget to remove the event listener on cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="container" style={{ paddingBottom: "12rem" }}>
      {user.role === "admin" || user.role === "superadmin" ? (
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th>Classe</th>
                <th>Prénom</th>
                {show === true && <th>email</th>}
                <th>Commentaire</th>
                <th>date</th>
                {show === true && <th>action</th>}
              </tr>
            </thead>
            <tbody>
              {show === true && (
                <tr className="search-fields">
                  <td>
                    <input
                      type="text"
                      placeholder="recherche par classe"
                      value={searchClass}
                      onChange={handleSearchClass}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="recherche par prénom"
                      value={searchFirstname}
                      onChange={handleSearchFirstname}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="recherche par email"
                      value={searchEmail}
                      onChange={handleSearchEmail}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="recherche par commentaire"
                      value={searchComment}
                      onChange={handleSearchComment}
                    />
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              )}
              {listOfComment
                .filter(
                  (val) =>
                    val.classes
                      .toLowerCase()
                      .includes(searchClass.toLowerCase()) &&
                    val.firstname
                      .toLowerCase()
                      .includes(searchFirstname.toLowerCase()) &&
                    val.email
                      .toLowerCase()
                      .includes(searchEmail.toLowerCase()) &&
                    val.comment
                      .toLowerCase()
                      .includes(searchComment.toLowerCase())
                )
                .map((comment) => {
                  // const isCurrentUserComment = comment.user === user._id;

                  const isAdminComment =
                    comment.userRole === "admin" ||
                    comment.userRole === "superadmin";
                  const commentClassAdmin = isAdminComment
                    ? "bg-primary text-white text-end"
                    : "";
                  const commentClassAdmin2 = isAdminComment
                    ? "bg-primary text-white text-start"
                    : "";
                  return (
                    <tr key={comment._id}>
                      <td className={`${commentClassAdmin}`}>
                        {comment.classes}
                      </td>
                      <td className={`${commentClassAdmin}`}>
                        {comment.firstname}
                      </td>
                      {show === true && (
                        <td className={`${commentClassAdmin}`}>
                          {comment.email}
                        </td>
                      )}
                      <td className={`${commentClassAdmin}`}>
                        {comment.comment}
                      </td>
                      <td className={`${commentClassAdmin2}`}>
                        {new Date(comment.Date).toLocaleDateString("fr-FR")} à{" "}
                        {new Date(comment.Date).toLocaleTimeString("fr-FR")}
                      </td>
                      {show === true && (
                        <td className="text-end">
                          <DeleteForeverRoundedIcon
                            onClick={() => deleteComment(comment._id)}
                          />
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : user.role !== "admin" && user.role !== "superadmin" ? (
        showComments === false ? (
          <button
            className="btn btn-primary"
            onClick={() => setShowComments(true)}
          >
            Afficher les messages de la classe
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => setShowComments(false)}
          >
            Masquer les messages de la classe
          </button>
        )
      ) : null}
      <div>
        {showComments === true && listOfComment.length === 0 && (
          <h3>Aucun Commentaire pour le moment</h3>
        )}
        {showComments === true &&
          listOfComment.map((comment) => {
            const isCurrentUserComment = comment.user === user._id;
            const commentClass = isCurrentUserComment
              ? "justify-content-end text-success"
              : "justify-content-start text-primary";

            const isAdminComment =
              comment.userRole === "admin" || comment.userRole === "superadmin";
            const commentClassAdmin = isAdminComment
              ? "bg-danger text-white"
              : "";
            return (
              <div key={comment._id}>
                <div className="container">
                  {user.role === "admin" ||
                    (user.role === "superadmin" && (
                      <span className="text-danger fs-4">
                        {comment.classes}
                      </span>
                    ))}
                  <br />
                  {comment.Date && (
                    <span className="text-success fs-6 ">
                      envoyé le :{/* add the date and the time in fr*/}
                      {new Date(comment.Date).toLocaleDateString(
                        "fr-FR"
                      )} à {new Date(comment.Date).toLocaleTimeString("fr-FR")}
                    </span>
                  )}
                  <br />
                  <p className={`d-flex ${commentClass} ${commentClassAdmin}`}>
                    <span className="fs-4">{comment.firstname} :</span>

                    <span className="fs-4 ">{comment.comment}</span>
                    {(user.role !== "admin" || user.role !== "superadmin") &&
                      comment.user === user._id && (
                        <HighlightOffOutlinedIcon
                          onClick={() => deleteComment(comment._id)}
                        />
                      )}
                  </p>
                </div>
              </div>
            );
          })}
      </div>

      {showComments === true && user.role === "student" && (
        <>
          <ul className="list-group list-group-flush ">
            <li className="text-center list-group-item bg-transparent">
              {user.role === "admin" || user.role === "superadmin" ? (
                <h2>Chat avec les utilisateurs</h2>
              ) : (
                <h2>Chat avec ta classe</h2>
              )}
            </li>
            <li className="form-group list-group-item bg-transparent">
              <label htmlFor="comment">Commentaire*</label>
              <textarea
                value={comment}
                id="comment"
                size="small"
                className="form-control mb-3"
                placeholder="Commentaire*"
                label="Commentaire*"
                onChange={handleCommentChange}
              >
                {" "}
              </textarea>
              <p className="fs-6 text-muted">*: champs obligatoire</p>
            </li>
            <li className="form-group list-group-item bg-transparent d-flex justify-content-center">
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={!comment}
              >
                Envoyer
              </button>
            </li>
          </ul>
        </>
      )}
      {(user.role === "admin" || user.role === "superadmin") && (
        <>
          <ul className="list-group list-group-flush ">
            <li className="form-group list-group-item bg-transparent d-flex justify-content-center">
              <div className="d-flex justify-content-between">
                <select
                  className="form-select"
                  aria-label="Default select example"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Choose a class</option>
                  {listOfClassNames.map(
                    (classe) =>
                      classe.name !== "public" && (
                        <option value={classe.name} key={classe._id}>
                          {classe.name}
                        </option>
                      )
                  )}
                </select>
              </div>
            </li>
            <li className="form-group list-group-item bg-transparent">
              <label htmlFor="comment">Commentaire*</label>
              <textarea
                value={comment}
                id="comment"
                size="small"
                className="form-control mb-3"
                placeholder="Commentaire*"
                label="Commentaire*"
                onChange={handleCommentChange}
              >
                {" "}
              </textarea>
              <p className="fs-6 text-muted">*: champs obligatoire</p>
            </li>
            <li className="form-group list-group-item bg-transparent d-flex justify-content-center">
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={!comment}
              >
                Envoyer
              </button>
            </li>
            <div>
              <br />
            </div>
          </ul>
        </>
      )}
    </div>
  );
};

export default CommentUploader;
