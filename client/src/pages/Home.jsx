import React from "react";
import { Helmet } from "react-helmet";

// design

const Home = () => {
  return (
    <>
      <div className="home">
        <Helmet>
          <meta
            name="description"
            content="Bienvenue sur mon portfolio - Christophe Midelet"
          />
          <meta
            name="keyword"
            content="portfolio, développeur web, fullstack, react, nodejs, express, mongodb, christophe midelet"
          />
        </Helmet>
        <div>welcome home</div>
      </div>
    </>
  );
};

export default Home;
