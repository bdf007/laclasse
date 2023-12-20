import React from "react";
import { Helmet } from "react-helmet";
import HomeComponent from "../component/homeComponent";

const Home = () => {
  return (
    <>
      <div className="home">
        <Helmet>
          <meta
            name="description"
            content="La Classe de français de stéphanie Labbé"
          />
          <meta
            name="keyword"
            content="french teacher, course, native speaker, stéphanie labbé, la classe de français, la classe, professeur de francais, stéphanie midelet, classe, francais, san diego, calfornie"
          />
        </Helmet>

        <HomeComponent />
      </div>
    </>
  );
};

export default Home;
