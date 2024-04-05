import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import spin from "../assets/Spin.gif";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";

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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/review`
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

  useEffect(() => {
    // Calculate reviewsValidated whenever reviews state changes
    const validatedReviews = reviews.filter(
      (review) => review.validation === true
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
            review._id === id ? { ...review, validation: value } : review
          );

          const validatedReviews = updatedReviews.filter(
            (review) => review.validation === true
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
            review._id === id ? { ...review, visible: value } : review
          )
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
    const reviewByEmail = reviews.find((review) => review.email === email);
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
        setFirstname("");
        setLastname("");
        setEmail("");
        setClasses("");
        setMessage("");
        setStar(0);
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
        }
      )
      .then((response) => {
        toast.success("Review updated");
        setReviews((prevReviews) => {
          const updatedReviews = prevReviews.map((review) =>
            review._id === userReview._id
              ? { ...review, ...response.data }
              : review
          );
          return updatedReviews;
        });
      })
      .catch((error) => {
        console.error("Error updating review:", error);
        toast.error("Failed to update review");
      });
  };

  const handleDelete = (id) => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/api/review/${id}`)
      .then(() => {
        toast.success("Review deleted");
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review._id !== id)
        );
        setFirstname("");
        setLastname("");
        setEmail("");
        setClasses("");
        setMessage("");
        setStar(0);
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
            const userReview = response.data[0];
            setMessage(userReview.message);
            setStar(userReview.star);
            setUserReview(userReview);
          }
        });
    }
  }, [user]);

  return (
    <div className="home">
      <div
        className="row d-flex justify-content-center align-items-center"
        style={{ paddingBottom: "12rem" }}
      >
        <div className="container mt-5 mb-5 col-10 col-sm-8 col-md-6 col-lg-5">
          <>
            <h1 className="text-danger">
              {userReview._id ? "Modifier votre review" : "Laisser une review"}
            </h1>
            <form onSubmit={userReview._id ? handleUpdate : handleUpload}>
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
                {userReview._id ? "Update" : "Submit"}
              </button>
              {userReview._id && (
                <button
                  type="button"
                  className="btn btn-danger ml-2"
                  onClick={() => {
                    handleDelete(userReview._id);
                    // relaod the page
                    window.location.reload();
                  }}
                >
                  Delete
                </button>
              )}
            </form>
          </>

          {isLoading && (
            <p>
              Please wait...
              <img src={spin} alt="loading" className="spin" />
            </p>
          )}
          {user && (user.role === "admin" || user.role === "superadmin") && (
            <>
              <h3>average stars</h3>
              <p>
                {averageStars !== null
                  ? reviewsValidated.length > 0
                    ? `${averageStars}/5`
                    : "pas de review validé"
                  : "pas de review validé"}
              </p>

              <h3>Avis existant</h3>
              {reviews.map((review) => (
                <div key={review._id} className="card mb-3">
                  <div className="card-body">
                    <h5 className="card-title">Prénom : {review.firstname}</h5>
                    <h5 className="card-title">Nom : {review.lastname}</h5>
                    <p className="card-text">Email : {review.email}</p>
                    <pre className="card-text">Avis : {review.message}</pre>
                    <p className="card-text">
                      <StarIcon sx={{ fontSize: 24, color: "yellow" }} /> :{" "}
                      {review.star}
                    </p>
                    <p className="card-text">Classes: {review.classes}</p>
                    <p className="card-text">
                      Date: {new Date(review.date).toLocaleString()}
                    </p>

                    <div className="form-check">
                      <label className="form-check-label" htmlFor="validated">
                        Validé: {review.validation ? "Yes" : "No"}
                      </label>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="validated"
                        checked={review.validation}
                        onChange={() =>
                          handleValidatedChange(review._id, !review.validation)
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
                        onChange={() =>
                          handleVisibleChange(review._id, !review.visible)
                        }
                      />
                    </div>

                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(review._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Review;
