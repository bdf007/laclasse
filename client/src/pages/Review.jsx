import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import spin from "../assets/Spin.gif";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";

const Review = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [classes, setClasses] = useState("");
  const [message, setMessage] = useState("");
  const [star, setStar] = useState(0); // [1, 2, 3, 4, 5]
  const [validated, setValidated] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/review`
        );
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
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

  const handleStarClick = (starValue) => {
    // If the clicked star is already selected, deselect it (set starValue to 0)
    // Otherwise, select the clicked star
    setStar(starValue === star ? 0 : starValue);
  };

  const handleValidatedChange = (id, value) => {
    console.log(value); // Debugging
    axios
      .put(`${process.env.REACT_APP_API_URL}/api/review/validate/${id}`, {
        validate: value,
      })
      .then(() => {
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review._id === id ? { ...review, validate: value } : review
          )
        );
      })
      .catch((error) => {
        console.error("Error updating review:", error);
        toast.error("Failed to update review");
      });
  };

  const handleVisibleChange = (id, value) => {
    console.log(id, value); // Debugging
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

  const handleUpload = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/review`, {
        firstname,
        lastname,
        email,
        classes,
        message,
        star,
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
        console.error("Error submitting review:", error);
        toast.error("Failed to submit review");
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
      });
  };

  return (
    <div className="home">
      <div
        className="row d-flex justify-content-center align-items-center"
        style={{ paddingBottom: "12rem" }}
      >
        <div className="container mt-5 mb-5 col-10 col-sm-8 col-md-6 col-lg-5">
          <h1 className="text-danger">Reviews</h1>
          <form onSubmit={handleUpload}>
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
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
          {isLoading && (
            <p>
              Please wait...
              <img src={spin} alt="loading" className="spin" />
            </p>
          )}
          <h3>Existing Reviews</h3>
          {reviews.map((review) => (
            <div key={review._id} className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">
                  {review.firstname} {review.lastname}
                </h5>
                <pre className="card-text">{review.message}</pre>
                <p className="card-text">Star: {review.star}</p>
                <p className="card-text">Classes: {review.classes}</p>
                <p className="card-text">
                  Date: {new Date(review.date).toLocaleString()}
                </p>
                <p className="card-text">
                  Validated: {review.validate ? "Yes" : "No"}
                </p>
                <p className="card-text">
                  Visible: {review.visible ? "Yes" : "No"}
                </p>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="validated"
                    checked={review.validate}
                    onChange={() =>
                      handleValidatedChange(review._id, !review.validate)
                    }
                  />
                  <label className="form-check-label" htmlFor="validated">
                    Validate
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="visible"
                    checked={review.visible}
                    onChange={() =>
                      handleVisibleChange(review._id, !review.visible)
                    }
                  />
                  <label className="form-check-label" htmlFor="visible">
                    Visible
                  </label>
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
        </div>
      </div>
    </div>
  );
};

export default Review;
