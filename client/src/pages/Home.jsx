import React from "react";
import { Helmet } from "react-helmet";

import ReviewCarousel from "../component/reviewCarousel";

// design
// import "../cssFiles/homeCss.css";
import acceuil from "../assets/acceuilwobg.webp";
import photoacceuil1 from "../assets/photoacceuil1.webp";
import photoacceuil2 from "../assets/photoacceuil2.webp";
import photoacceuil3 from "../assets/photoacceuil3.webp";
import photoacceuil4 from "../assets/photoacceuil4.webp";
import photoacceuil5 from "../assets/photoacceuil5.webp";
import photoacceuil6 from "../assets/photoacceuil6.webp";
import photoacceuil7 from "../assets/photoacceuil7.webp";

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
        <div className="container-fluid" style={{ paddingBottom: "12rem" }}>
          <div className="row">
            <div className="col-md-6" style={{ borderLeft: "1px solid black" }}>
              <div style={{ marginTop: "5rem", paddingTop: "5rem" }}>
                <img
                  className="img-fluid"
                  src={acceuil}
                  alt="acceuil classe français stéphanie labbé midelet californie san-diego"
                />
              </div>
            </div>
            <div className="col-md-6 pe-none">
              <div className="table-responsive">
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <img
                          className="img-thumbnail "
                          src={photoacceuil1}
                          alt="acceuil classe français stéphanie labbé midelet californie san-diego"
                        />
                      </td>
                      <td></td>
                      <td>
                        <img
                          className="img-thumbnail"
                          src={photoacceuil5}
                          alt="acceuil classe français stéphanie labbé midelet californie san-diego"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <img
                          className="img-thumbnail"
                          src={photoacceuil2}
                          alt="acceuil classe français stéphanie labbé midelet californie san-diego"
                        />
                      </td>
                      <td>
                        <img
                          className="img-thumbnail"
                          src={photoacceuil4}
                          alt="acceuil classe français stéphanie labbé midelet californie san-diego"
                        />
                      </td>
                      <td>
                        <img
                          className="img-thumbnail"
                          src={photoacceuil6}
                          alt="acceuil classe français stéphanie labbé midelet californie san-diego"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <img
                          className="img-thumbnail"
                          src={photoacceuil3}
                          alt="acceuil classe français stéphanie labbé midelet californie san-diego"
                        />
                      </td>
                      <td></td>
                      <td>
                        <img
                          className="img-thumbnail"
                          src={photoacceuil7}
                          alt="acceuil classe français stéphanie labbé midelet californie san-diego"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <ReviewCarousel />
        </div>
      </div>
    </>
  );
};

export default Home;
