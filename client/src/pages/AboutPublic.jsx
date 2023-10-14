import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import photoprofile from "../assets/photoprofilpublic.jpg";

const AboutPublic = () => {
  const [classInfo, setClassInfo] = useState(null);

  // get all the classes
  const getAllClasses = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/classes`
      );
      const listOfClasses = response.data;
      // get only the class whome name is "public"
      const publicClass = listOfClasses.filter(
        (classe) => classe.name === "public"
      );
      setClassInfo(publicClass);
    } catch (error) {
      console.log(error);
      toast.error("Error occured while getting all classes");
    }
  };

  useEffect(() => {
    getAllClasses();
  }, []);

  // get the class whome name is "public"

  return (
    <div
      className="container text-center"
      style={{ paddingBottom: "10rem", marginBottom: "10rem" }}
    >
      <div
        className="clearfix"
        style={{ paddingBottom: "10rem", marginBottom: "10rem" }}
      >
        <br />
        <br />
        <br />
        <img
          src={photoprofile}
          className="rounded-circle img-thumbnail col-md-6 float-md-end mb-3 ms-md-3"
          style={{ width: "200px" }}
          alt="..."
        />
        <h1>A propos de mes cours</h1>
        {classInfo &&
          classInfo.map((classe) => {
            return (
              <div key={classe._id}>
                {/* <h1>{classe.name}</h1> */}
                <pre>{classe.about}</pre>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default AboutPublic;
