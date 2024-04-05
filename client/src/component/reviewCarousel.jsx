import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "react-slick";
import { Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ReviewCarousel = () => {
  const [reviews, setReviews] = useState([]);

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

  if (reviews.length === 1) {
    const review = reviews[0];
    return (
      <div className="carousel">
        <Typography variant="h6">{review.firstname}</Typography>
        <Typography variant="h5">
          <blockquote style={{ fontStyle: "italic" }}>
            "{review.message}"
          </blockquote>
        </Typography>

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
    );
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  return reviews.length === 1 ? (
    <div className="carousel">
      <Typography variant="h6">{reviews[0].firstname}</Typography>
      <Typography variant="h5">
        <blockquote style={{ fontStyle: "italic" }}>
          "{reviews[0].message}"
        </blockquote>
      </Typography>

      <div className="star-rating">
        {[...Array(5)].map((_, index) => (
          <React.Fragment key={index}>
            {index < reviews[0].star ? (
              <StarIcon sx={{ color: "yellow", fontSize: 24 }} />
            ) : (
              <StarBorderIcon sx={{ color: "inherit", fontSize: 24 }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  ) : (
    <div className="carousel">
      <Slider {...settings}>
        {reviews.map((review) => (
          <div key={review._id} className="carousel-item">
            <Typography variant="h6">{review.firstname}</Typography>
            <Typography variant="h5">
              <blockquote style={{ fontStyle: "italic" }}>
                "{review.message}"
              </blockquote>
            </Typography>

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
      </Slider>
    </div>
  );
};

export default ReviewCarousel;
