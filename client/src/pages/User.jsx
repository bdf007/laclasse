import React from "react";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { getUser } from "../api/user";
import { toast } from "react-toastify";

const User = () => {
  const { user, setUser } = useContext(UserContext);
  const [listOfBooks, setListOfBooks] = useState([]);

  const getAllBooksFromAUser = async () => {
    try {
      const userID = user._id;
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/get-all-books-from-a-user/${userID}`,
        { withCredentials: true }
      );
      console.log("books", res.data);
      setListOfBooks(res.data);
    } catch (err) {
      toast.error(err);
    }
  };
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
    getAllBooksFromAUser();
    fetchData();
  }, [setUser, setListOfBooks]);
  return (
    <div className="container text-center" style={{ paddingBottom: "12rem" }}>
      <h1>welcome {user.firstname}</h1>
      <div className="row">
        <div className="col-md-6">
          <h2>Mes infos</h2>
          <p>
            prénom : {user.firstname} <br /> nom : {user.lastname}
            <br />
            email : {user.email}
          </p>
        </div>
        <div className="col-md-6">
          {!user.classes ? (
            <p>Vous n'avez pas encore de classe</p>
          ) : (
            <>
              <p>Vous êtes dans la classe {user.classes}</p>
            </>
          )}
          {listOfBooks.length > 0 ? (
            <div>
              <p>
                vous avez emprunté{" "}
                <span className="text-primary"> {listOfBooks.length} </span>
                livre(s)
              </p>

              {listOfBooks.map((book) => (
                <p key={book._id} className="fst-italic fw-light">
                  {book.title}
                </p>
              ))}
            </div>
          ) : (
            <p>vous n'avez pas encore emprunté de livre</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default User;
