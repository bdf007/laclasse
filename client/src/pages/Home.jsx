import React from "react";
import { Helmet } from "react-helmet";

// design
// import "../cssFiles/homeCss.css";
import acceuil from "../assets/acceuilwobg.png";
import photoacceuil1 from "../assets/photoacceuil1.jpg";
import photoacceuil2 from "../assets/photoacceuil2.jpg";
import photoacceuil3 from "../assets/photoacceuil3.jpg";
import photoacceuil4 from "../assets/photoacceuil4.jpg";
import photoacceuil5 from "../assets/photoacceuil5.jpg";
import photoacceuil6 from "../assets/photoacceuil6.jpg";
import photoacceuil7 from "../assets/photoacceuil7.jpg";

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
            content="portfolio, développeur web, fullstack, react, nodejs, express, mongodb, christophe midelet"
          />
        </Helmet>
        <div
          className="container-fluid"
          style={{ marginBottom: "10rem", paddingBottom: "10rem" }}
        >
          <div className="row">
            <div className="col-md-6" style={{ borderLeft: "1px solid black" }}>
              <div style={{ marginTop: "5rem", paddingTop: "5rem" }}>
                <img className="img-fluid" src={acceuil} alt="acceuil" />
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
                          alt=""
                        />
                      </td>
                      <td></td>
                      <td>
                        <img
                          className="img-thumbnail"
                          src={photoacceuil5}
                          alt=""
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <img
                          className="img-thumbnail"
                          src={photoacceuil2}
                          alt=""
                        />
                      </td>
                      <td>
                        <img
                          className="img-thumbnail"
                          src={photoacceuil4}
                          alt=""
                        />
                      </td>
                      <td>
                        <img
                          className="img-thumbnail"
                          src={photoacceuil6}
                          alt=""
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <img
                          className="img-thumbnail"
                          src={photoacceuil3}
                          alt=""
                        />
                      </td>
                      <td></td>
                      <td>
                        <img
                          className="img-thumbnail"
                          src={photoacceuil7}
                          alt=""
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
