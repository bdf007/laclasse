import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import spin from "../assets/Spin.gif";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import ConfirmModal from "../component/confirmModal";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";

const MOBILE_BREAKPOINT = 768; // en dessous : cartes forcées, pas de choix

const Review = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [classes, setClasses] = useState("");
  const [message, setMessage] = useState("");
  const { user } = useContext(UserContext);
  const [star, setStar] = useState(); // [1, 2, 3, 4, 5]
  const [averageStars, setAverageStars] = useState(null);
  const [reviewsValidated, setReviewsValidated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  // Section repliable pour le formulaire personnel, uniquement utile
  // côté admin (rien à désencombrer pour un simple utilisateur).
  const [showOwnReviewForm, setShowOwnReviewForm] = useState(false);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT,
  );
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/review`,
        );

        // Set reviews in state
        setReviews(response.data.reviews);

        // Set averageStars in state
        setAverageStars(response.data.averageStars);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  // --- Responsive : cartes forcées sous le breakpoint, choix libre au-dessus ---
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile) setViewMode("cards");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleViewMode = () => {
    if (isMobile) return; // pas de tableau forcé sur mobile
    setViewMode((v) => (v === "cards" ? "table" : "cards"));
  };

  useEffect(() => {
    // Calculate reviewsValidated whenever reviews state changes
    const validatedReviews = reviews.filter(
      (review) => review.validation === true,
    );
    setReviewsValidated(validatedReviews);
  }, [reviews]);

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

  const handleStarClick = (starValue) => {
    // If the clicked star is already selected, deselect it (set starValue to 0)
    // Otherwise, select the clicked star
    setStar(starValue === star ? 0 : starValue);
  };

  const handleValidatedChange = (id, value) => {
    axios
      .put(`${process.env.REACT_APP_API_URL}/api/review/validation/${id}`, {
        validation: value,
      })
      .then(() => {
        setReviews((prevReviews) => {
          const updatedReviews = prevReviews.map((review) =>
            review._id === id ? { ...review, validation: value } : review,
          );

          const validatedReviews = updatedReviews.filter(
            (review) => review.validation === true,
          );
          const average =
            validatedReviews.reduce((acc, review) => acc + review.star, 0) /
            validatedReviews.length;

          setAverageStars(average);
          return updatedReviews;
        });
      })
      .catch((error) => {
        console.error("Error updating review:", error);
        toast.error("Failed to update review");
      });
  };

  const handleVisibleChange = (id, value) => {
    axios
      .put(`${process.env.REACT_APP_API_URL}/api/review/visibility/${id}`, {
        visible: value,
      })
      .then(() => {
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review._id === id ? { ...review, visible: value } : review,
          ),
        );
      })
      .catch((error) => {
        console.error("Error updating review:", error);
        toast.error("Failed to update review");
      });
  };

  const handleUpload = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Check if the email is already used
    const reviewByEmail = reviews.find(
      (review) => review.email === email && !review.deletedByAdmin,
    );
    if (reviewByEmail) {
      toast.error("Email already used to post a review");
      setFirstname("");
      setLastname("");
      setEmail("");
      setClasses("");
      setMessage("");
      setStar(0);
      return; // Exit the function if the email exists
    }

    axios
      .post(`${process.env.REACT_APP_API_URL}/api/review`, {
        firstname,
        lastname,
        email,
        classes,
        message,
        star,
        validated: false,
        visible: false,
      })
      .then((response) => {
        toast.success("Review submitted");
        setReviews((prevReviews) => [response.data, ...prevReviews]);
        if (user) {
          // Connecté (élève, user, admin...) : on passe en mode
          // "modifier votre review" avec ce qui vient d'être envoyé,
          // plutôt que de tout vider -- ses infos viennent de son
          // compte, elles n'ont pas de raison de disparaître du
          // formulaire.
          setUserReview(response.data);
        } else {
          setFirstname("");
          setLastname("");
          setEmail("");
          setClasses("");
          setMessage("");
          setStar(0);
        }
      })
      .catch((error) => {
        console.error(error.response.data.error || "Error submitting review:");
        toast.error(error.response.data.error || "Failed to submit review");
      });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/api/review/update/${userReview._id}`,
        {
          firstname,
          lastname,
          email,
          classes,
          message,
          star,
          validation: false,
          visible: false,
        },
      )
      .then((response) => {
        toast.success("Review updated");
        setReviews((prevReviews) => {
          const updatedReviews = prevReviews.map((review) =>
            review._id === userReview._id
              ? { ...review, ...response.data }
              : review,
          );
          return updatedReviews;
        });
      })
      .catch((error) => {
        console.error("Error updating review:", error);
        toast.error("Failed to update review");
      });
  };

  // Auto-suppression de son propre avis : suppression réelle, inchangée.
  const handleDelete = (id) => {
    setConfirmAction({
      message: "Supprimer votre avis ?",
      onConfirm: () => {
        axios
          .delete(`${process.env.REACT_APP_API_URL}/api/review/${id}`)
          .then(() => {
            toast.success("Review deleted");
            setReviews((prevReviews) =>
              prevReviews.filter((review) => review._id !== id),
            );
            setFirstname("");
            setLastname("");
            setEmail("");
            setClasses("");
            setMessage("");
            setStar(0);
            setUserReview([]);
          })
          .catch(() => {
            toast.error("Erreur lors de la suppression");
          });
      },
    });
  };

  // Modération par un admin depuis la liste : l'avis n'est pas
  // réellement supprimé, juste masqué -- un motif est demandé, visible
  // ensuite par son auteur dans son propre formulaire.
  const handleModerate = (review) => {
    setConfirmAction({
      message: `Supprimer l'avis de ${review.firstname} ${review.lastname} ? L'auteur en sera informé avec le motif ci-dessous.`,
      promptLabel: "Motif de la suppression (visible par l'auteur)",
      promptPlaceholder: "Ex : propos déplacés, avis non pertinent...",
      onConfirm: (reason) => {
        axios
          .put(
            `${process.env.REACT_APP_API_URL}/api/review/${review._id}/moderate`,
            { reason },
            { withCredentials: true },
          )
          .then((response) => {
            toast.success("Avis masqué");
            setReviews((prevReviews) =>
              prevReviews.map((r) =>
                r._id === review._id ? { ...r, ...response.data } : r,
              ),
            );
          })
          .catch(() => {
            toast.error("Erreur lors de la modération");
          });
      },
    });
  };

  // Suppression définitive d'un avis déjà modéré -- plus rien à garder,
  // contrairement à handleModerate qui masque sans effacer.
  const handlePermanentDelete = (review) => {
    setConfirmAction({
      message: `Supprimer définitivement l'avis de ${review.firstname} ${review.lastname} ? Cette action est irréversible.`,
      onConfirm: () => {
        axios
          .delete(`${process.env.REACT_APP_API_URL}/api/review/${review._id}`)
          .then(() => {
            toast.success("Avis supprimé définitivement");
            setReviews((prevReviews) =>
              prevReviews.filter((r) => r._id !== review._id),
            );
          })
          .catch(() => {
            toast.error("Erreur lors de la suppression");
          });
      },
    });
  };

  useEffect(() => {
    // Populate form fields with user data if the user is logged in and has the role "user" or "student"
    if (
      user &&
      (user.role === "user" ||
        user.role === "student" ||
        user.role === "admin" ||
        user.role === "superadmin")
    ) {
      setFirstname(user.firstname);
      setLastname(user.lastname);
      setEmail(user.email);
      setClasses(user.classes);
      // get the review of the user
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/review/email/${user.email}`)
        .then((response) => {
          if (response.data.length > 0) {
            const foundReview = response.data[0];
            setUserReview(foundReview);
            // Un avis modéré ne préremplit pas le formulaire -- on
            // laisse la place à un nouvel avis, pas une réédition de
            // l'ancien.
            if (!foundReview.deletedByAdmin) {
              setMessage(foundReview.message);
              setStar(foundReview.star);
            }
          }
        });
    }
  }, [user]);

  const isModerated = Boolean(userReview && userReview.deletedByAdmin);
  const isEditingOwnReview = Boolean(
    userReview && userReview._id && !isModerated,
  );
  const isAdminUser = Boolean(
    user && (user.role === "admin" || user.role === "superadmin"),
  );

  return (
    <div className="home">
      <div
        className="row d-flex justify-content-center align-items-center"
        style={{ paddingBottom: "1rem" }}
      >
        <div className="container mt-5 mb-5 col-10 col-sm-8 col-md-6 col-lg-5">
          {isAdminUser && (
            <button
              className="btn btn-outline-primary w-100 d-flex justify-content-between align-items-center mb-3"
              onClick={() => setShowOwnReviewForm((v) => !v)}
            >
              <span className="fw-bold">
                {isEditingOwnReview
                  ? "Modifier votre review"
                  : "Laisser une review"}
              </span>
              {showOwnReviewForm ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </button>
          )}

          {(!isAdminUser || showOwnReviewForm) && (
            <>
              {!isAdminUser && (
                <h1 className="text-danger">
                  {isEditingOwnReview
                    ? "Modifier votre review"
                    : "Laisser une review"}
                </h1>
              )}

              {isModerated && (
                <div className="alert alert-secondary">
                  Votre précédent avis a été supprimé par l'administrateur.
                  <br />
                  Motif : {userReview.deletionReason || "non précisé"}
                </div>
              )}

              {isEditingOwnReview && (
                <div className="alert alert-info">
                  Statut de votre avis :{" "}
                  {userReview.validation
                    ? "validé"
                    : "en attente de validation"}
                  {" · "}
                  {userReview.visible
                    ? "affiché publiquement"
                    : "pas encore affiché publiquement"}
                </div>
              )}

              <form onSubmit={isEditingOwnReview ? handleUpdate : handleUpload}>
                <div className="form-group">
                  <label htmlFor="firstname">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="firstname"
                    value={firstname}
                    onChange={handleFirstnameChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastname">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="lastname"
                    value={lastname}
                    onChange={handleLastnameChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
                {user && user.role === "student" && (
                  <div className="form-group">
                    <label htmlFor="classes">Classes</label>
                    <input
                      type="text"
                      className="form-control"
                      id="classes"
                      value={classes}
                      onChange={(e) => setClasses(e.target.value)}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    className="form-control"
                    type="text"
                    id="message"
                    rows="3"
                    value={message}
                    onChange={handleMessageChange}
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="star">Star Rating</label>
                  <div className="star-rating">
                    {[...Array(5)].map((_, index) => (
                      <span
                        key={index}
                        onClick={() => handleStarClick(index + 1)}
                        style={{ cursor: "pointer" }}
                      >
                        {index < star ? (
                          <StarIcon sx={{ fontSize: 24, color: "yellow" }} />
                        ) : (
                          <StarOutlineIcon sx={{ fontSize: 24 }} />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                <br />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    !firstname ||
                    !lastname ||
                    !email ||
                    email === !message ||
                    !emailRegex.test(email) ||
                    !star
                  }
                >
                  {isEditingOwnReview ? "Update" : "Submit"}
                </button>
                {isEditingOwnReview && (
                  <button
                    type="button"
                    className="btn btn-danger ml-2"
                    onClick={() => handleDelete(userReview._id)}
                  >
                    <DeleteForeverRoundedIcon />
                  </button>
                )}
              </form>
            </>
          )}

          {isLoading && (
            <p>
              Please wait...
              <img src={spin} alt="loading" className="spin" />
            </p>
          )}
        </div>
      </div>

      {user && (user.role === "admin" || user.role === "superadmin") && (
        <div className="container-fluid" style={{ paddingBottom: "12rem" }}>
          <>
            <h3>Note Moyenne</h3>
            <p>
              {averageStars !== null
                ? reviewsValidated.length > 0
                  ? `${averageStars}/5`
                  : "pas de review validé"
                : "pas de review validé"}
            </p>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="mb-0">Avis existant</h3>
              {!isMobile && (
                <button className="btn btn-primary" onClick={toggleViewMode}>
                  {viewMode === "cards" ? (
                    <FormatListBulletedOutlinedIcon />
                  ) : (
                    <DashboardOutlinedIcon />
                  )}
                </button>
              )}
            </div>

            {viewMode === "cards" ? (
              <div className="row">
                {reviews.map((review) => (
                  <div
                    className="col-12 col-md-6 col-lg-4 mb-3"
                    key={review._id}
                  >
                    <div
                      className={`card h-100 ${review.deletedByAdmin ? "border-secondary" : ""}`}
                    >
                      <div className="card-body">
                        {review.deletedByAdmin && (
                          <div className="mb-2">
                            <span className="badge bg-secondary d-inline-block mb-1">
                              Modéré
                            </span>
                            <div className="small text-muted">
                              Motif : {review.deletionReason || "non précisé"}
                            </div>
                          </div>
                        )}
                        <h5 className="card-title">
                          Prénom : {review.firstname}
                        </h5>
                        <h5 className="card-title">Nom : {review.lastname}</h5>
                        <p className="card-text">Email : {review.email}</p>
                        <pre
                          className="card-text"
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          Avis : {review.message}
                        </pre>
                        <p className="card-text">
                          <StarIcon sx={{ fontSize: 24, color: "yellow" }} /> :{" "}
                          {review.star}
                        </p>
                        <p className="card-text">Classes: {review.classes}</p>
                        <p className="card-text">
                          Date: {new Date(review.date).toLocaleString()}
                        </p>

                        <div className="form-check">
                          <label
                            className="form-check-label"
                            htmlFor="validated"
                          >
                            Validé: {review.validation ? "Yes" : "No"}
                          </label>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="validated"
                            checked={review.validation}
                            disabled={review.deletedByAdmin}
                            onChange={() =>
                              handleValidatedChange(
                                review._id,
                                !review.validation,
                              )
                            }
                          />

                          <label className="form-check-label" htmlFor="visible">
                            Visible: {review.visible ? "Yes" : "No"}
                          </label>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="visible"
                            checked={review.visible}
                            disabled={review.deletedByAdmin}
                            onChange={() =>
                              handleVisibleChange(review._id, !review.visible)
                            }
                          />
                        </div>

                        {review.deletedByAdmin ? (
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handlePermanentDelete(review)}
                          >
                            Supprimer définitivement
                          </button>
                        ) : (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleModerate(review)}
                          >
                            <DeleteForeverRoundedIcon />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>Prénom</th>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Avis</th>
                      <th>Étoiles</th>
                      <th>Classes</th>
                      <th>Date</th>
                      <th>Validé</th>
                      <th>Visible</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review) => (
                      <tr
                        key={review._id}
                        className={
                          review.deletedByAdmin ? "table-secondary" : ""
                        }
                      >
                        <td>{review.firstname}</td>
                        <td>{review.lastname}</td>
                        <td>{review.email}</td>
                        <td style={{ maxWidth: "220px", whiteSpace: "normal" }}>
                          {review.deletedByAdmin ? (
                            <>
                              <span className="badge bg-secondary d-inline-block mb-1">
                                Modéré
                              </span>
                              <div className="small text-muted">
                                Motif : {review.deletionReason || "non précisé"}
                              </div>
                            </>
                          ) : (
                            review.message
                          )}
                        </td>
                        <td>{review.star}</td>
                        <td>{review.classes}</td>
                        <td>{new Date(review.date).toLocaleDateString()}</td>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={review.validation}
                            disabled={review.deletedByAdmin}
                            onChange={() =>
                              handleValidatedChange(
                                review._id,
                                !review.validation,
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={review.visible}
                            disabled={review.deletedByAdmin}
                            onChange={() =>
                              handleVisibleChange(review._id, !review.visible)
                            }
                          />
                        </td>
                        <td>
                          {review.deletedByAdmin ? (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handlePermanentDelete(review)}
                            >
                              Supprimer définitivement
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleModerate(review)}
                            >
                              <DeleteForeverRoundedIcon />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        </div>
      )}

      {confirmAction && (
        <ConfirmModal
          message={confirmAction.message}
          promptLabel={confirmAction.promptLabel}
          promptPlaceholder={confirmAction.promptPlaceholder}
          onConfirm={(value) => {
            confirmAction.onConfirm(value);
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default Review;
