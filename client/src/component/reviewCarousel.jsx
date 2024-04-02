import React, { useState, useEffect } from "react";
import axios from "axios";
import { Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const ReviewCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/review/visible`
        );
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  const handleIndicatorClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <div
      id="carouselIndicators"
      className="carousel slide"
      data-bs-ride="carousel"
      data-bs-interval="2000"
    >
      {/* <div className="carousel-indicators">
        {reviews.map((_, index) => (
          <button
            key={index}
            type="button"
            data-bs-target="#carouselIndicators"
            data-bs-slide-to={index}
            className={`indicator ${index === activeIndex ? "active" : ""}`}
            aria-current={index === activeIndex ? "true" : "false"}
            onClick={() => handleIndicatorClick(index)}
          ></button>
        ))}
      </div> */}
      <div className="carousel-inner">
        {reviews.map((review, index) => (
          <div
            key={review._id}
            className={`carousel-item${index === activeIndex ? " active" : ""}`}
          >
            <Typography variant="h6">
              {review.firstname} {review.lastname}
            </Typography>
            <Typography variant="body1">
              <pre>{review.message}</pre>
            </Typography>
            {review.classes && (
              <Typography variant="body2">Classes: {review.classes}</Typography>
            )}
            <div className="star-rating">
              {[...Array(5)].map((_, index) => (
                <React.Fragment key={index}>
                  {index < review.star ? (
                    <StarIcon sx={{ color: "yellow", fontSize: 24 }} />
                  ) : (
                    <StarBorderIcon sx={{ color: "inherit", fontSize: 24 }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselIndicators"
        data-bs-slide="prev"
        onClick={() =>
          setActiveIndex((prevIndex) =>
            prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
          )
        }
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselIndicators"
        data-bs-slide="next"
        onClick={() =>
          setActiveIndex((prevIndex) =>
            prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
          )
        }
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button> */}
    </div>
  );
};

export default ReviewCarousel;
