import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { getUser } from "../api/user";
import { toast } from "react-toastify";
import { Worker } from "@react-pdf-viewer/core";

import CommentUploader from "../component/comment";
import DocumentDisplay from "../component/documentDisplay";

const Student = () => {
  const { user, setUser } = useContext(UserContext);

  const [updatedFirstname, setUpdatedFirstname] = useState("");
  const [updatedLastname, setUpdateLastname] = useState("");
  const [updatedEmail, setUpdatedEmail] = useState("");
  const [updatedPassword, setUpdatedPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // password validation
  let hasSixChar = updatedPassword.length >= 6;
  let hasLowerChar = /(.*[a-z].*)/.test(updatedPassword);
  let hasUpperChar = /(.*[A-Z].*)/.test(updatedPassword);
  let hasNumber = /(.*[0-9].*)/.test(updatedPassword);
  let hasSpecialChar = /(.*[^a-zA-Z0-9].*)/.test(updatedPassword);

  // get the info of the user logged in
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getUser();
        if (res.error) toast(res.error);
        else setUser(res); // Set the entire 'res' object, which includes 'firstname' and 'role'
      } catch (err) {
        toast(err);
      }
    };

    fetchData();
  }, [setUser]);

  // // Function to toggle visibility of a file
  // const toggleFile = (fileId) => {
  //   setShowFiles((prevShowFiles) => {
  //     const updatedShowFiles = { ...prevShowFiles };
  //     updatedShowFiles[fileId] = !updatedShowFiles[fileId];

  //     if (activeFile !== null && activeFile !== fileId) {
  //       updatedShowFiles[activeFile] = false; // Hide the previously active file
  //     }

  //     setActiveFile(updatedShowFiles[fileId] ? fileId : null);

  //     return updatedShowFiles;
  //   });
  // };

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
      <div
        className="container text-center"
        style={{ paddingBottom: "10rem", marginBottom: "10rem" }}
      >
        <h1>welcome {user.firstname}</h1>
        <div className="row">
          <div className="col-md-6">
            <h2>Mes infos</h2>
            <p>
              prénom : {user.firstname} <br /> nom : {user.lastname}
              <br />
              email : {user.email}
            </p>
            {/* {isEditing && (

            )} */}
            <CommentUploader />
          </div>
          <div className="col-md-6">
            {!user.classes ? (
              <p>Vous n'avez pas encore de classe</p>
            ) : (
              <>
                <p>Vous êtes dans la classe {user.classes}</p>
                <p>
                  A propos de ma classe : <br />
                  {user.aboutClass}
                </p>
                <p>Mon prochain cours : {user.nextClass}</p>
                {!user.courseFiles ? (
                  <p>Vous n'avez pas encore de fichiers de cours</p>
                ) : (
                  <>
                    <DocumentDisplay />
                    {/* <p>Vous avez {user.courseFiles.length} fichiers de cours</p>

                    <ul className="list-group list-group-flush">
                      {user.courseFiles.map((file) => (
                        <li
                          key={file._id}
                          className="list-group-item bg-transparent"
                        >
                          <h3>
                            {file.courseFileTitle}
                            <a
                              href={loadFromBase64(file.courseFileData)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <DownloadOutlinedIcon />
                            </a>
                            <button
                              onClick={() => toggleFile(file._id)}
                              key={file._id}
                              className="btn btn-primary"
                            >
                              {showFiles[file._id]
                                ? "masquer le fichier"
                                : "Afficher le fichier"}
                            </button>
                          </h3>
                          {showFiles[file._id] && file._id === activeFile && (
                            <Viewer
                              fileUrl={loadFromBase64(file.courseFileData)}
                            />
                          )}
                        </li>
                      ))}
                    </ul> */}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Worker>
  );
};

export default Student;

// import React, { useContext, useEffect, useState } from "react";
// import { UserContext } from "../context/UserContext";
// import { getUser, updateUser } from "../api/user";
// import { toast } from "react-toastify";

// const Student = () => {
//   const { user, setUser } = useContext(UserContext);

//   // State to manage the edit profile form
//   const [editProfile, setEditProfile] = useState(false);
//   const [formData, setFormData] = useState({
//     firstname: user.firstname,
//     lastname: user.lastname,
//     email: user.email,
//     password: "",
//     verifyPassword: "",
//   });

//   // Function to handle input changes in the edit profile form
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   // Function to handle form submission
//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     // Add validation logic here

//     // Create an object with the updated user data
//     const updatedUserData = {
//       _id: user._id,
//       firstname: formData.firstname,
//       lastname: formData.lastname,
//       email: formData.email, // You can keep the email as it is or add an input field to edit it
//       password: formData.password,
//     };

//     // Send a request to update user information with updatedUserData
//     try {
//       const response = await updateUser(updatedUserData);

//       if (response.error) {
//         // Handle errors from the server
//         toast.error(response.error);
//       } else {
//         // Handle successful update
//         toast.success("Profile updated successfully");
//         // Refresh user information
//         const updatedUser = await getUser();
//         setUser(updatedUser);
//         setEditProfile(false); // Close the edit profile form
//       }
//     } catch (error) {
//       // Handle network or other errors
//       toast.error("An error occurred");
//     }
//   };

//   // Populate the form data when the component mounts
//   useEffect(() => {
//     setFormData({
//       firstname: user.firstname,
//       lastname: user.lastname,
//       email: user.email,
//       password: "",
//       verifyPassword: "",
//     });
//   }, [user]);

//   return (
//     <div>
//       <h1>Student</h1>
//       {editProfile ? (
//         <form onSubmit={handleFormSubmit}>
//           <div>
//             <label htmlFor="firstname">First Name:</label>
//             <input
//               type="text"
//               id="firstname"
//               name="firstname"
//               value={formData.firstname}
//               onChange={handleInputChange}
//             />
//           </div>
//           <div>
//             <label htmlFor="lastname">Last Name:</label>
//             <input
//               type="text"
//               id="lastname"
//               name="lastname"
//               value={formData.lastname}
//               onChange={handleInputChange}
//             />
//           </div>
//           <div>
//             <label htmlFor="email">Email:</label>
//             <input
//               type="text"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleInputChange}
//             />
//           </div>
//           <div>
//             <label htmlFor="password">Password:</label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleInputChange}
//             />
//           </div>
//           <div>
//             <label htmlFor="verifyPassword">Verify Password:</label>
//             <input
//               type="password"
//               id="verifyPassword"
//               name="verifyPassword"
//               value={formData.verifyPassword}
//               onChange={handleInputChange}
//             />
//           </div>
//           <button type="submit">Update Profile</button>
//         </form>
//       ) : (
//         <>
//           <h1>id: {user._id}</h1>
//           <h1>{user.firstname}</h1>
//           <h2>{user.role}</h2>
//           <h2> le nom de ma classe : {user.classes}</h2>
//           <p>
//             A propos de ma classe : <br />
//             {user.aboutClass}
//           </p>
//           <button onClick={() => setEditProfile(true)}>Edit Profile</button>
//         </>
//       )}
//     </div>
//   );
// };

// export default Student;
