import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { toast } from "react-toastify";
import { getUser } from "../api/user";
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
import profilpicture from "../assets/profilpicture.png";

const AdminInfo = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [updatedFirstname, setUpdatedFirstname] = useState("");
  const [updatedLastname, setUpdateLastname] = useState("");
  const [updatedEmail, setUpdatedEmail] = useState("");
  const [updatedPassword, setUpdatedPassword] = useState("");
  const [confirmUpdatedPassword, setConfirmUpdatedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [updatedProfilePicture, setUpdatedProfilePicture] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProfilPicture, setIsEditingProfilPicture] = useState(false);

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

  const handleUpdatedProfilePicture = (e) => {
    setUpdatedProfilePicture(e.target.files[0]);
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
      toast.success("profil mis à jour avec succès");
      setIsEditing(false);
      handleLogout(e);
    } catch (err) {
      toast.error(err);
    }
  };

  const handleUpdateProfilePicture = async () => {
    try {
      const userId = user._id;
      // if the user has not selected a new profile picture, set the profile picture to null
      if (!updatedProfilePicture) {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/update-profile-photo/${userId}`,
          {
            profilePictureData: null,
          },
          { withCredentials: true }
        );
      } else {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(updatedProfilePicture);

        fileReader.onload = async () => {
          const base64Data = fileReader.result;

          await axios.post(
            `${process.env.REACT_APP_API_URL}/api/update-profile-photo/${userId}`,
            {
              profilePictureData: base64Data,
            },
            { withCredentials: true }
          );
        };
      }
      toast.success("photo de profil mise à jour avec succès");
      setIsEditingProfilPicture(false);
      setUpdatedProfilePicture(null);
      // set user to null
      setUser(null);
      // redirect to login page
      navigate("/login");
    } catch (err) {
      toast.error(err);
    }
  };

  const toggleEditingProfilPicture = () => {
    setIsEditingProfilPicture(true);
  };
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
    <div className="container text-center" style={{ paddingBottom: "12rem" }}>
      <h1>Bienvenue {user.firstname}</h1>

      <h2>Mes infos</h2>
      <div className="table-responsive">
        {isEditingProfilPicture ? (
          <>
            <div>
              <p>
                Si aucun fichier n'est choisi, l'image par défaut remplacera la
                photo actuel
              </p>
              <p>en cas de modifications, vous devrez vous reconnecter</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpdatedProfilePicture}
            />
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleUpdateProfilePicture}
            >
              Modifier
            </Button>
            <Button
              size="small"
              variant="contained"
              color="warning"
              onClick={() => setIsEditingProfilPicture(false)}
            >
              annuler
            </Button>
          </>
        ) : !user.profilePictureData ? (
          <>
            <table className="table" style={{ width: "50rem" }}>
              <tbody>
                <tr>
                  <td className=" bg-transparent align-middle">
                    <div className="d-flex justify-content-center">
                      <img
                        src={profilpicture}
                        alt="profil de base"
                        className="rounded-circle img-thumbnail col-md-6 float-md-start mb-3 ms-md-3"
                        style={{ width: "200px" }}
                      />
                    </div>
                  </td>
                  <td className=" bg-transparent align-middle">
                    <div className="d-flex justify-content-center">
                      <p>
                        prénom : {user.firstname} <br /> nom : {user.lastname}
                        <br />
                        email : {user.email}
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className=" bg-transparent align-middle">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={toggleEditingProfilPicture}
                      style={{ cursor: "pointer" }}
                      title="Modifier la photo de profile"
                    >
                      Modifier ma photo de profil
                    </Button>
                  </td>
                  <td className=" bg-transparent align-middle">
                    {isEditing === false && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => setIsEditing(true)}
                      >
                        modifier mes infos
                      </Button>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : (
          <>
            <table className="table " style={{ width: "50rem" }}>
              <tbody>
                <tr>
                  <td className=" bg-transparent align-middle">
                    <div className="d-flex justify-content-center">
                      <img
                        src={user.profilePictureData}
                        alt={(user.firstname, user.lastname)}
                        className="rounded-circle img-thumbnail col-md-6 float-md-start mb-3 ms-md-3"
                        style={{ width: "200px" }}
                      />
                    </div>
                  </td>
                  <td className=" bg-transparent align-middle">
                    <div className="d-flex justify-content-center">
                      <p>
                        prénom : {user.firstname} <br /> nom : {user.lastname}
                        <br />
                        email : {user.email}
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className=" bg-transparent align-items-middle">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={toggleEditingProfilPicture}
                      style={{ cursor: "pointer" }}
                      title="Modifier la photo de profile"
                    >
                      Modifier ma photo de profil
                    </Button>
                  </td>
                  <td className=" bg-transparent ">
                    {isEditing === false && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => setIsEditing(true)}
                      >
                        modifier mes infos
                      </Button>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>

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
                        <IconButton edge="end" onClick={handleShowPassword}>
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
                        <CheckCircleIcon className="mr-1" fontSize="small" />
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
                      className={hasLowerChar ? "text-success" : "text-danger"}
                    >
                      at least one lowercase character
                    </small>
                  </div>
                  <div>
                    {hasUpperChar ? (
                      <span className="text-success">
                        <CheckCircleIcon className="mr-1" fontSize="small" />
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
                        <CheckCircleIcon className="mr-1" fontSize="small" />
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
                        <CheckCircleIcon className="mr-1" fontSize="small" />
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
                merci de confirmer votre mot de passe pour valider ou annuler
                vos modifications
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
                    <span className="text-success">Password does match</span>
                  ) : (
                    <span className="text-danger">Password does not match</span>
                  )}
                </FormHelperText>
              )}
            </div>
          </div>
          <div>
            <p>en cas de modifications, vous devrez vous reconnecter</p>
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
    </div>
  );
};

export default AdminInfo;
