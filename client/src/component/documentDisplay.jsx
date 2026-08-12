import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
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
  const [loadingFileId, setLoadingFileId] = useState(null);

  // Cache des PDF déjà téléchargés (fileId -> blob URL), pour ne pas
  // retélécharger un fichier de plusieurs Mo à chaque clic.
  const fileUrlsRef = useRef({});

  // get the info of the user logged in
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getUser();
        if (res.error) toast(res.error);
        else setUser(res);
      } catch (err) {
        toast(err);
      }
    };

    fetchData();
  }, [setUser]);

  // Nettoie les URLs locales à la fermeture du composant, pour éviter
  // toute fuite mémoire.
  useEffect(() => {
    const fileUrls = fileUrlsRef.current;
    return () => {
      Object.values(fileUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Télécharge le PDF (authentifié) et retourne une URL locale utilisable
  // par le lecteur ou un lien de téléchargement. Mis en cache par fichier.
  const getOrFetchFileUrl = async (fileId) => {
    if (fileUrlsRef.current[fileId]) {
      return fileUrlsRef.current[fileId];
    }

    setLoadingFileId(fileId);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/courseFiles/${fileId}/download`,
        {
          responseType: "blob",
          withCredentials: true,
        },
      );
      const url = URL.createObjectURL(res.data);
      fileUrlsRef.current[fileId] = url;
      return url;
    } catch (error) {
      toast.error("Erreur lors du chargement du fichier");
      throw error;
    } finally {
      setLoadingFileId(null);
    }
  };

  // Function to toggle visibility of a file
  const toggleFile = async (fileId) => {
    const willShow = !showFiles[fileId];

    if (willShow) {
      try {
        await getOrFetchFileUrl(fileId);
      } catch (error) {
        return; // l'erreur est déjà signalée dans getOrFetchFileUrl
      }
    }

    setShowFiles((prevShowFiles) => {
      const updatedShowFiles = { ...prevShowFiles };
      updatedShowFiles[fileId] = willShow;

      if (activeFile !== null && activeFile !== fileId) {
        updatedShowFiles[activeFile] = false; // Hide the previously active file
      }

      setActiveFile(willShow ? fileId : null);

      return updatedShowFiles;
    });
  };

  const handleDownload = async (fileId, courseFileTitle) => {
    try {
      const url = await getOrFetchFileUrl(fileId);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${courseFileTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      // déjà signalé
    }
  };

  return (
    <div>
      <p>Vous avez {user.courseFiles.length} fichiers de cours</p>

      <ul className="list-group list-group-flush">
        {user.courseFiles.map((file) => (
          <li key={file._id} className="list-group-item bg-transparent">
            <h3>
              {file.courseFileTitle}
              <button
                type="button"
                className="btn btn-link p-0 ms-2"
                onClick={() => handleDownload(file._id, file.courseFileTitle)}
                disabled={loadingFileId === file._id}
                title="Télécharger"
              >
                <DownloadOutlinedIcon />
              </button>
              <button
                onClick={() => toggleFile(file._id)}
                className="btn btn-primary ms-2"
                disabled={loadingFileId === file._id}
              >
                {loadingFileId === file._id
                  ? "Chargement..."
                  : showFiles[file._id]
                    ? "masquer le fichier"
                    : "Afficher le fichier"}
              </button>
            </h3>
            {showFiles[file._id] &&
              file._id === activeFile &&
              fileUrlsRef.current[file._id] && (
                <Viewer fileUrl={fileUrlsRef.current[file._id]} />
              )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentDisplay;
