import axios from "axios";
import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import ImagePickerWithCrop from "../component/ImagePickerWithCrop";
import photoprofile from "../assets/photoprofilpublic.webp";

const getAboutPhotoUrl = () =>
  `${process.env.REACT_APP_API_URL}/api/about/photo`;

const AboutPublic = () => {
  const { user } = useContext(UserContext);
  const isAdmin = user && (user.role === "admin" || user.role === "superadmin");

  const [title, setTitle] = useState("");
  const [aboutFr, setAboutFr] = useState("");
  const [aboutEn, setAboutEn] = useState("");
  const [hasCustomPhoto, setHasCustomPhoto] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editLang, setEditLang] = useState("fr"); // "fr" | "en"
  const [editTitle, setEditTitle] = useState("");
  const [editAboutFr, setEditAboutFr] = useState("");
  const [editAboutEn, setEditAboutEn] = useState("");

  const getAbout = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/about`);
      setTitle(res.data.title || "");
      setAboutFr(res.data.aboutFr || "");
      setAboutEn(res.data.aboutEn || "");
      setHasCustomPhoto(Boolean(res.data.pcloudFileId));
    } catch (error) {
      console.log(error);
      toast.error(
        "Une erreur est survenue lors de la récupération des informations",
      );
    }
  };

  useEffect(() => {
    getAbout();
  }, []);

  const startEditing = () => {
    setEditTitle(title);
    setEditAboutFr(aboutFr);
    setEditAboutEn(aboutEn);
    setEditLang("fr");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveAbout = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/about`,
        { title: editTitle, aboutFr: editAboutFr, aboutEn: editAboutEn },
        { withCredentials: true },
      );
      toast.success("Informations mises à jour");
      setTitle(editTitle);
      setAboutFr(editAboutFr);
      setAboutEn(editAboutEn);
      setIsEditing(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handlePhotoReady = async (file) => {
    if (!file) return;
    try {
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/about/photo`,
        { imageData: base64Data },
        { withCredentials: true },
      );
      toast.success("Photo mise à jour");
      setHasCustomPhoto(true);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de la photo");
    }
  };

  return (
    <div className="container text-center" style={{ paddingBottom: "12rem" }}>
      <div style={{ paddingBottom: "12rem" }}>
        <br />
        <br />
        <br />
        <img
          src={hasCustomPhoto ? getAboutPhotoUrl() : photoprofile}
          className="rounded-circle img-thumbnail d-block mx-auto mb-3"
          style={{ width: "200px", height: "200px", objectFit: "cover" }}
          alt="..."
          onError={(e) => {
            e.target.src = photoprofile;
          }}
        />
        <h1>A propos de mes cours</h1>

        {isAdmin && (
          <div className="about-editor mt-4">
            <div className="mb-3">
              <p className="fw-bold mb-2">Changer la photo</p>
              <div className="d-flex justify-content-center">
                <ImagePickerWithCrop
                  inputIdPrefix="about-photo"
                  onFileReady={handlePhotoReady}
                  resetAfterReady
                />
              </div>
            </div>

            {isEditing ? (
              <>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Nom / titre (partagé entre les deux langues)"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <div className="d-flex justify-content-center gap-2 mb-2">
                  <button
                    type="button"
                    className={`btn ${
                      editLang === "fr" ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => setEditLang("fr")}
                  >
                    Français
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      editLang === "en" ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => setEditLang("en")}
                  >
                    English
                  </button>
                </div>
                <textarea
                  className="form-control mb-2"
                  rows="14"
                  value={editLang === "fr" ? editAboutFr : editAboutEn}
                  onChange={(e) =>
                    editLang === "fr"
                      ? setEditAboutFr(e.target.value)
                      : setEditAboutEn(e.target.value)
                  }
                />
                <div className="d-flex justify-content-center gap-2">
                  <button className="btn btn-success" onClick={saveAbout}>
                    Sauvegarder
                  </button>
                  <button className="btn btn-warning" onClick={cancelEditing}>
                    Annuler
                  </button>
                </div>
              </>
            ) : (
              <button className="btn btn-primary" onClick={startEditing}>
                Modifier le texte À propos
              </button>
            )}
          </div>
        )}

        {title && <h3 className="mt-4">{title}</h3>}

        <div className="about-columns mt-4">
          <div className="about-column">
            <h5>Français</h5>
            <pre className="about-text">
              {aboutFr || "Pas encore de texte."}
            </pre>
          </div>
          <div className="about-column">
            <h5>English</h5>
            <pre className="about-text">{aboutEn || "No text yet."}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPublic;
