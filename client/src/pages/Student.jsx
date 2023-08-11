import React, { useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { getUser } from "../api/user";
import { toast } from "react-toastify";

const Student = () => {
  const { user, setUser } = useContext(UserContext);

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
    <div>
      <h1>Student</h1>
      <h1>{user.firstname}</h1>
      <h2>{user.role}</h2>
    </div>
  );
};

export default Student;
