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
  const [showComments, setShowComments] = useState(true);
  const [searchClass, setSearchClass] = useState("");
  const [searchFirstname, setSearchFirstname] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const [userId, setUserId] = useState("");
  const [comment, setComment] = useState("");
  const { user } = useContext(UserContext);

  const [listOfComment, setListOfComment] = useState([]);
  const getComment = async () => {
    try {
      if (user.role === "admin" || user.role === "superadmin") {
        setClassName(selectedClass);
        await axios
          .get(`${process.env.REACT_APP_API_URL}/api/comment`)
          .then((res) => {
            console.log(res.data);
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

  // const handleFirstnameChange = (e) => {
  //   setFirstname(e.target.value);
  // };

  // const handleLastnameChange = (e) => {
  //   setLastname(e.target.value);
  // };

  // const handleEmailChange = (e) => {
  //   setEmail(e.target.value);
  // };

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
        toast.success("Comment added");
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
        toast.success("Comment deleted");
        setListOfComment(
          listOfComment.filter((val) => {
            return val._id !== id;
          })
        );
      });
  };

  return (
    <div
      className="container"
      style={{ paddingBottom: "10rem", marginBottom: "10rem" }}
    >
      {user.role === "admin" || user.role === "superadmin" ? (
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th>Classe</th>
                <th>firstname</th>
                <th>email</th>
                <th>comment</th>
                <th>date</th>
                <th>action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="search-fields">
                <td>
                  <input
                    type="text"
                    placeholder="Search by class"
                    value={searchClass}
                    onChange={handleSearchClass}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Search by firstname"
                    value={searchFirstname}
                    onChange={handleSearchFirstname}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Search by email"
                    value={searchEmail}
                    onChange={handleSearchEmail}
                  />
                </td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              {listOfComment
                .filter(
                  (val) =>
                    val.classes
                      .toLowerCase()
                      .includes(searchClass.toLowerCase()) &&
                    val.firstname
                      .toLowerCase()
                      .includes(searchFirstname.toLowerCase()) &&
                    val.email.toLowerCase().includes(searchEmail.toLowerCase())
                )
                .map((comment) => {
                  // const isCurrentUserComment = comment.user === user._id;

                  const isAdminComment =
                    comment.userRole === "admin" ||
                    comment.userRole === "superadmin";
                  const commentClassAdmin = isAdminComment
                    ? "bg-primary text-white text-end"
                    : "";
                  return (
                    <tr key={comment._id}>
                      <td className={`${commentClassAdmin}`}>
                        {comment.classes}
                      </td>
                      <td className={`${commentClassAdmin}`}>
                        {comment.firstname}
                      </td>
                      <td className={`${commentClassAdmin}`}>
                        {comment.email}
                      </td>
                      <td className={`${commentClassAdmin}`}>
                        {comment.comment}
                      </td>
                      <td className={`${commentClassAdmin}`}>
                        {new Date(comment.Date).toLocaleDateString("fr-FR")} à{" "}
                        {new Date(comment.Date).toLocaleTimeString("fr-FR")}
                      </td>
                      <td className="text-end">
                        <DeleteForeverRoundedIcon
                          onClick={() => deleteComment(comment._id)}
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
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
                comment.userRole === "admin" ||
                comment.userRole === "superadmin";
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
                        )} à{" "}
                        {new Date(comment.Date).toLocaleTimeString("fr-FR")}
                      </span>
                    )}
                    <br />
                    <p
                      className={`d-flex ${commentClass} ${commentClassAdmin}`}
                    >
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
                  {/* {(user.role === "admin" || user.role === "superadmin") && (
                  <div className="container d-flex">
                    {comment.email ? (
                      <span className={`d-flex ${commentClass}`}>
                        {comment.email}
                      </span>
                    ) : (
                      <span> No email</span>
                    )}

                    <DeleteForeverRoundedIcon
                      onClick={() => deleteComment(comment._id)}
                    />
                  </div>
                )} */}
                </div>
              );
            })}
        </div>
      )}
      {showComments === true && user && (
        <>
          {/* {user.role === "admin" || user.role === "superadmin" ? ( */}
          <h2 className="text-center">
            Choisi la classe à laquelle tu veux répondre
          </h2>
          {/* ) : (
            <h2 className="text-center">Discute avec ta classe</h2>
          )} */}

          {user.role === "admin" ||
            (user.role === "superadmin" && (
              <div className="form-group">
                <select
                  className="form-select"
                  aria-label="Default select example"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Choose a class</option>
                  {listOfClassNames.map((classe) => (
                    <option value={classe.name} key={classe._id}>
                      {classe.name}
                    </option>
                  ))}
                  <option value="none">None</option>
                </select>
              </div>
            ))}
          <div className="form-group">
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
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!comment}
            >
              Envoyer
            </button>
            <div>
              <br />
            </div>
          </div>
        </>
      )}
      {(user.role !== "admin" || user.role !== "superadmin") &&
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
      )}
    </div>
  );
};

export default CommentUploader;
