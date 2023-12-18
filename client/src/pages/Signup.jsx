import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// design
import {
  TextField,
  InputAdornment,
  IconButton,
  OutlinedInput,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

// API functions
import { register } from "../api/user";

const Signup = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("Nouvelle inscription");

  // form states
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // password validation
  let hasSixChar = password.length >= 6;
  let hasLowerChar = /(.*[a-z].*)/.test(password);
  let hasUpperChar = /(.*[A-Z].*)/.test(password);
  let hasNumber = /(.*[0-9].*)/.test(password);
  let hasSpecialChar = /(.*[^a-zA-Z0-9].*)/.test(password);

  const handleRegister = async (e) => {
    const res = await register({
      firstname,
      lastname,
      email,
      password,
    });
    setSubject(`Nouveau inscription de ${firstname} ${lastname}`);
    console.log(subject);
    if (res.error) toast.error(res.error);
    else {
      toast.success(res.message);
      // redirect to login page
      navigate("/login");
    }
  };

  return (
    <div className="home">
      <div
        className="container mt-5 col-10 col-sm-8 col-md-6 col-lg-5"
        style={{ paddingBottom: "12rem" }}
      >
        <div className="text-center mb-5 alert alert-primary">
          <label htmlFor="" className="h2">
            Sign Up
          </label>
        </div>
        <form
          action="https://formsubmit.co/stephanie.midelet@gmail.com"
          method="POST"
        >
          <input type="hidden" name="_subject" value={subject} />
          <div className="form-group">
            <TextField
              size="small"
              variant="outlined"
              className="form-control mb-3"
              label="Firstname"
              name="firstname"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
            />
          </div>
          <div className="form-group">
            <TextField
              size="small"
              variant="outlined"
              className="form-control mb-3"
              label="Lastname"
              name="lastname"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
            />
          </div>
          <div className="form-group">
            <TextField
              size="small"
              variant="outlined"
              className="form-control mb-3"
              label="Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                endAdornment={
                  <InputAdornment>
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <VisibilityIcon />
                      ) : (
                        <VisibilityOffIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            {password && (
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
            <TextField
              size="small"
              variant="outlined"
              className="form-control"
              label="Confirm Password"
              type="password"
              value={confirmpassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {password && confirmpassword && (
              <FormHelperText className="ml-1 mt-1">
                {password === confirmpassword ? (
                  <span className="text-success">Password does match</span>
                ) : (
                  <span className="text-danger">Password does not match</span>
                )}
              </FormHelperText>
            )}
          </div>
          <div className="text-center mt-4">
            <button
              className="btn btn-primary mb-4"
              type="submit"
              disabled={
                !email ||
                !password ||
                !confirmpassword ||
                !firstname ||
                !lastname ||
                password !== confirmpassword ||
                !hasSixChar ||
                !hasLowerChar ||
                !hasUpperChar ||
                !hasNumber ||
                !hasSpecialChar ||
                !emailRegex.test(email)
              }
              onClick={handleRegister}
            >
              Submit
            </button>
          </div>
          <input type="hidden" name="_subject" value="Nouvelle inscription" />
          <input type="hidden" name="_captcha" value="false" />
          <input
            type="hidden"
            name="_next"
            value="https://la-classe-de-francais.us/Login"
          />
        </form>
      </div>
    </div>
  );
};

export default Signup;
