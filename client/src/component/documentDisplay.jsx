import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { getUser } from "../api/user";
import { Viewer } from "@react-pdf-viewer/core";
import { toast } from "react-toastify";

// Import styles
import "@react-pdf-viewer/core/lib/styles/index.css";

// design
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";

const DocumentDisplay = () => {
  const { user, setUser } = useContext(UserContext);
  const [showFiles, setShowFiles] = useState({});
  const [activeFile, setActiveFile] = useState(null);

  const loadFromBase64 = (base64) => {
    const base64toBlob = (data) => {
      // Cut the prefix `data:application/pdf;base64` from the raw base64
      const base64WithoutPrefix = data.substr(
        "data:application/pdf;base64,".length
      );

      const bytes = atob(base64WithoutPrefix);
      let length = bytes.length;
      let out = new Uint8Array(length);

      while (length--) {
        out[length] = bytes.charCodeAt(length);
      }

      return new Blob([out], { type: "application/pdf" });
    };

    const blob = base64toBlob(base64);
    const blobUrl = URL.createObjectURL(blob);

    return blobUrl;
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

    fetchData();
  }, [setUser]);
  // Function to toggle visibility of a file
  const toggleFile = (fileId) => {
    setShowFiles((prevShowFiles) => {
      const updatedShowFiles = { ...prevShowFiles };
      updatedShowFiles[fileId] = !updatedShowFiles[fileId];

      if (activeFile !== null && activeFile !== fileId) {
        updatedShowFiles[activeFile] = false; // Hide the previously active file
      }

      setActiveFile(updatedShowFiles[fileId] ? fileId : null);

      return updatedShowFiles;
    });
  };

  return (
    <div>
      <p>Vous avez {user.courseFiles.length} fichiers de cours</p>

      <ul className="list-group list-group-flush">
        {user.courseFiles.map((file) => (
          <li key={file._id} className="list-group-item bg-transparent">
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
              <Viewer fileUrl={loadFromBase64(file.courseFileData)} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentDisplay;
