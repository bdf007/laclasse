import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { UserContext } from "../context/UserContext";
import { getUser } from "../api/user";
import { toast } from "react-toastify";
import { Worker } from "@react-pdf-viewer/core";

import CommentUploader from "../component/comment";
import DocumentDisplay from "../component/documentDisplay";
import { logout } from "../api/user";
// design
import {
  TextField,
  InputAdornment,
  IconButton,
  OutlinedInput,
  FormControl,
  InputLabel,
  Button,
  FormHelperText,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";

const Student = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [updatedFirstname, setUpdatedFirstname] = useState("");
  const [updatedLastname, setUpdateLastname] = useState("");
  const [updatedEmail, setUpdatedEmail] = useState("");
  const [updatedPassword, setUpdatedPassword] = useState("");
  const [confirmUpdatedPassword, setConfirmUpdatedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModified, setIsPasswordModified] = useState(false);

  // password validation
  let hasSixChar = updatedPassword && updatedPassword.length >= 6;
  let hasLowerChar = /(.*[a-z].*)/.test(updatedPassword);
  let hasUpperChar = /(.*[A-Z].*)/.test(updatedPassword);
  let hasNumber = /(.*[0-9].*)/.test(updatedPassword);
  let hasSpecialChar = /(.*[^a-zA-Z0-9].*)/.test(updatedPassword);

  const handleUpdatedFirstname = (e) => {
    setUpdatedFirstname(e.target.value);
  };

  const handleUpdatedLastname = (e) => {
    setUpdateLastname(e.target.value);
  };

  const handleUpdatedEmail = (e) => {
    setUpdatedEmail(e.target.value);
  };

  const handleUpdatedPassword = (e) => {
    e.preventDefault();
    setUpdatedPassword(e.target.value);
    if (updatedPassword !== user.password) {
      setIsPasswordModified(true);
    } else {
      setIsPasswordModified(false);
    }
    setShowPassword(false);
  };

  const handleConfirmUpdatedPassword = (e) => {
    setConfirmUpdatedPassword(e.target.value);
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    logout()
      .then((res) => {
        toast.success(res.message);
        // set user to null
        setUser(null);
        // redirect to login page
        navigate("/login");
      })
      .catch((err) => console.log(err));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/update-profile/${user._id}`,
        {
          firstname: updatedFirstname,
          lastname: updatedLastname,
          email: updatedEmail,
          newPassword: updatedPassword,
        },
        { withCredentials: true }
      );
      toast.success("Profile updated successfully");
      setIsEditing(false);
      handleLogout(e);
    } catch (err) {
      toast.error(err);
    }
  };

  // useEffect(() => {
  //   // Check if the password has been modified
  //   if (updatedPassword && user.password && updatedPassword !== user.password) {
  //     setIsPasswordModified(true);
  //   } else {
  //     setIsPasswordModified(false);
  //   }
  // }, [updatedPassword, user.password]);

  // Populate the form data when the component mounts
  useEffect(() => {
    setUpdatedFirstname(user.firstname);
    setUpdateLastname(user.lastname);
    setUpdatedEmail(user.email);
    setUpdatedPassword(user.password);
  }, [user]);

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
            {isEditing === false && (
              <Button
                className="mb-4"
                variant="contained"
                color="success"
                onClick={() => setIsEditing(true)}
              >
                modifier
              </Button>
            )}
            {isEditing && (
              <>
                <div className="container mt-5 col-10 col-sm-8 col-md-6 col-lg-5">
                  <div className="form-group">
                    <TextField
                      size="small"
                      variant="outlined"
                      className="form-control mb-3"
                      label="Firstname"
                      value={updatedFirstname}
                      onChange={handleUpdatedFirstname}
                    />
                  </div>
                  <div className="form-group">
                    <TextField
                      size="small"
                      variant="outlined"
                      className="form-control mb-3"
                      label="Lastname"
                      value={updatedLastname}
                      onChange={handleUpdatedLastname}
                    />
                  </div>
                  <div className="form-group">
                    <TextField
                      size="small"
                      variant="outlined"
                      className="form-control mb-3"
                      label="Email"
                      value={updatedEmail}
                      onChange={handleUpdatedEmail}
                    />
                  </div>
                  <div className="form-group">
                    <FormControl
                      variant="outlined"
                      size="small"
                      className="form-control mb-3"
                    >
                      <InputLabel htmlFor="outlined-adornment-password">
                        Password
                      </InputLabel>
                      <OutlinedInput
                        label="Password"
                        type={
                          isPasswordModified
                            ? showPassword
                              ? "text"
                              : "password"
                            : "password"
                        }
                        value={updatedPassword}
                        onChange={handleUpdatedPassword}
                        endAdornment={
                          isPasswordModified ? ( // Check if the password is being modified
                            <InputAdornment>
                              <IconButton
                                edge="end"
                                onClick={handleShowPassword}
                              >
                                {showPassword ? (
                                  <VisibilityIcon />
                                ) : (
                                  <VisibilityOffIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ) : null // Hide the toggle button when the password is not being modified
                        }
                      />
                    </FormControl>
                    {updatedPassword && (
                      <div className="ml-1 mb-3" style={{ columns: 2 }}>
                        <div>
                          {hasSixChar ? (
                            <span className="text-success">
                              <CheckCircleIcon
                                className="mr-1"
                                fontSize="small"
                              />
                              <small>at least 6 characters</small>
                            </span>
                          ) : (
                            <span className="text-danger">
                              <CancelIcon className="mr-1" fontSize="small" />
                              <small>at least 6 characters</small>
                            </span>
                          )}
                        </div>
                        <div>
                          <small
                            className={
                              hasLowerChar ? "text-success" : "text-danger"
                            }
                          >
                            at least one lowercase character
                          </small>
                        </div>
                        <div>
                          {hasUpperChar ? (
                            <span className="text-success">
                              <CheckCircleIcon
                                className="mr-1"
                                fontSize="small"
                              />
                              <small>at least one uppercase character</small>
                            </span>
                          ) : (
                            <span className="text-danger">
                              <CancelIcon className="mr-1" fontSize="small" />
                              <small>at least one uppercase character</small>
                            </span>
                          )}
                        </div>
                        <div>
                          {hasNumber ? (
                            <span className="text-success">
                              <CheckCircleIcon
                                className="mr-1"
                                fontSize="small"
                              />
                              <small>at least one number</small>
                            </span>
                          ) : (
                            <span className="text-danger">
                              <CancelIcon className="mr-1" fontSize="small" />
                              <small>at least one number</small>
                            </span>
                          )}
                        </div>
                        <div>
                          {hasSpecialChar ? (
                            <span className="text-success">
                              <CheckCircleIcon
                                className="mr-1"
                                fontSize="small"
                              />
                              <small>at least one special character</small>
                            </span>
                          ) : (
                            <span className="text-danger">
                              <CancelIcon className="mr-1" fontSize="small" />
                              <small>at least one special character</small>
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <p>
                      merci de confirmer votre mot de passe pour valider ou
                      annuler vos modifications
                    </p>
                    <TextField
                      size="small"
                      variant="outlined"
                      className="form-control"
                      label="Confirm Password"
                      type="password"
                      value={confirmUpdatedPassword}
                      onChange={handleConfirmUpdatedPassword}
                    />
                    {updatedPassword && confirmUpdatedPassword && (
                      <FormHelperText className="ml-1 mt-1">
                        {updatedPassword === confirmUpdatedPassword ? (
                          <span className="text-success">
                            Password does match
                          </span>
                        ) : (
                          <span className="text-danger">
                            Password does not match
                          </span>
                        )}
                      </FormHelperText>
                    )}
                  </div>
                </div>
                <div className="text-center mt-4">
                  <Button
                    className="mb-4"
                    variant="contained"
                    color="warning"
                    onClick={() => setIsEditing(false)}
                  >
                    annuler
                  </Button>
                  <Button
                    className="mb-4"
                    variant="contained"
                    color="primary"
                    disabled={
                      !updatedEmail ||
                      !updatedPassword ||
                      !confirmUpdatedPassword ||
                      !updatedFirstname ||
                      !updatedLastname ||
                      updatedPassword !== confirmUpdatedPassword ||
                      !hasSixChar ||
                      !hasLowerChar ||
                      !hasUpperChar ||
                      !hasNumber ||
                      !hasSpecialChar
                    }
                    onClick={handleUpdateUser}
                  >
                    Submit
                  </Button>
                </div>
              </>
            )}
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
