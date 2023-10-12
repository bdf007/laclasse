import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import CommentUploader from "../component/comment";

const ChatAdmin = () => {
  const { user } = useContext(UserContext);
  return (
    <div>
      {user.role === "admin" || user.role === "superadmin" ? (
        <div>
          <CommentUploader />
        </div>
      ) : (
        <div>
          <h1>Not authorized</h1>
        </div>
      )}
    </div>
  );
};

export default ChatAdmin;
