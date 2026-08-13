import React, { useState, useEffect, useContext, useCallback } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import ReviewCarousel from "../component/reviewCarousel";
import ImagePickerWithCrop from "../component/ImagePickerWithCrop";
import ConfirmModal from "../component/confirmModal";

// design
import acceuil from "../assets/acceuilwobg.webp";
import photoacceuil1 from "../assets/photoacceuil1.webp";
import photoacceuil2 from "../assets/photoacceuil2.webp";
import photoacceuil3 from "../assets/photoacceuil3.webp";
import photoacceuil4 from "../assets/photoacceuil4.webp";
import photoacceuil5 from "../assets/photoacceuil5.webp";
import photoacceuil6 from "../assets/photoacceuil6.webp";
import photoacceuil7 from "../assets/photoacceuil7.webp";

// Repli statique : utilisé si le chargement dynamique échoue (souci de
// connexion à la base) ou si aucune photo n'a encore été ajoutée -- la
// page d'accueil affiche toujours quelque chose.
const STATIC_FALLBACK_PHOTOS = [
  photoacceuil1,
  photoacceuil2,
  photoacceuil3,
  photoacceuil4,
  photoacceuil5,
  photoacceuil6,
  photoacceuil7,
];

const getHomePhotoImageUrl = (id) =>
  `${process.env.REACT_APP_API_URL}/api/home-photos/image/${id}`;

// Répartit les photos dans N colonnes en ajoutant toujours la suivante
// dans la colonne actuellement la plus courte (plutôt qu'un simple tour
// de rôle, qui pouvait empiler plusieurs formats portrait dans la même
// colonne et créer un effet d'escalier).
const packIntoColumns = (items, numColumns, getRelativeHeight) => {
  const columns = Array.from({ length: numColumns }, () => []);
  const heights = Array(numColumns).fill(0);

  items.forEach((item) => {
    let shortestIndex = 0;
    for (let i = 1; i < numColumns; i++) {
      if (heights[i] < heights[shortestIndex]) shortestIndex = i;
    }
    columns[shortestIndex].push(item);
    heights[shortestIndex] += getRelativeHeight(item);
  });

  return columns;
};

const Home = () => {
  const { user } = useContext(UserContext);
  const isAdmin = user && (user.role === "admin" || user.role === "superadmin");

  const [photos, setPhotos] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [numColumns, setNumColumns] = useState(
    window.innerWidth < 600 ? 1 : window.innerWidth < 900 ? 2 : 3,
  );
  const [staticRatios, setStaticRatios] = useState({});

  // Mesure une seule fois le ratio largeur/hauteur réel de chaque photo de
  // secours -- sans ça, elles étaient toutes traitées comme des carrés
  // pour la répartition en colonnes, créant le même effet d'escalier
  // qu'on venait de corriger pour les photos dynamiques.
  useEffect(() => {
    STATIC_FALLBACK_PHOTOS.forEach((src, index) => {
      const img = new Image();
      img.onload = () => {
        setStaticRatios((prev) => ({
          ...prev,
          [index]: img.width / img.height || 1,
        }));
      };
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setNumColumns(w < 600 ? 1 : w < 900 ? 2 : 3);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchPhotos = useCallback(async () => {
    try {
      const url = isAdmin
        ? `${process.env.REACT_APP_API_URL}/api/admin/home-photos`
        : `${process.env.REACT_APP_API_URL}/api/home-photos`;
      const res = await axios.get(url, { withCredentials: isAdmin });
      setPhotos(res.data);
    } catch (error) {
      // En cas d'échec (souci de connexion à la base par ex.), on retombe
      // sur les photos statiques -- pas de toast, ça reste transparent
      // pour un simple visiteur.
      setPhotos([]);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handlePhotoReady = async (file) => {
    if (!file) return;
    try {
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Mesure le ratio largeur/hauteur de la photo rognée, pour pouvoir
      // équilibrer correctement les colonnes à l'affichage.
      const aspectRatio = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img.width / img.height || 1);
        img.onerror = () => resolve(1);
        img.src = base64Data;
      });

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/home-photos`,
        { imageData: base64Data, aspectRatio },
        { withCredentials: true },
      );
      toast.success("Photo ajoutée");
      fetchPhotos();
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la photo");
    }
  };

  const movePhoto = async (photo, direction) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/home-photos/${photo._id}/move`,
        { direction },
        { withCredentials: true },
      );
      fetchPhotos();
    } catch (error) {
      toast.error("Erreur lors du déplacement");
    }
  };

  const toggleVisibility = async (photo) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/home-photos/${photo._id}/visibility`,
        { visible: !photo.visible },
        { withCredentials: true },
      );
      setPhotos((prev) =>
        prev.map((p) =>
          p._id === photo._id ? { ...p, visible: !p.visible } : p,
        ),
      );
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const requestDeletePhoto = (photo) => {
    setConfirmAction({
      message: "Supprimer cette photo ?",
      onConfirm: async () => {
        try {
          await axios.delete(
            `${process.env.REACT_APP_API_URL}/api/admin/home-photos/${photo._id}`,
            { withCredentials: true },
          );
          toast.success("Photo supprimée");
          fetchPhotos();
        } catch (error) {
          toast.error("Erreur lors de la suppression");
        }
      },
    });
  };

  const useDynamicPhotos = photos.length > 0;

  const staticPhotoItems = STATIC_FALLBACK_PHOTOS.map((src, index) => ({
    src,
    index,
  }));

  const photoColumns = useDynamicPhotos
    ? packIntoColumns(
        photos,
        numColumns,
        (photo) => 1 / (photo.aspectRatio || 1),
      )
    : packIntoColumns(
        staticPhotoItems,
        numColumns,
        (item) => 1 / (staticRatios[item.index] || 1),
      );

  // Aperçu de ce que voit un vrai visiteur (photos visibles uniquement,
  // sans les boutons d'édition) -- affiché côté admin à la place du logo.
  // Si tout est masqué, un vrai visiteur retomberait sur les photos
  // statiques -- l'aperçu doit refléter ça, pas afficher une grille vide.
  const visiblePhotos = photos.filter((p) => p.visible);
  const previewUseDynamic = visiblePhotos.length > 0;
  const previewColumns = previewUseDynamic
    ? packIntoColumns(
        visiblePhotos,
        numColumns,
        (photo) => 1 / (photo.aspectRatio || 1),
      )
    : packIntoColumns(
        staticPhotoItems,
        numColumns,
        (item) => 1 / (staticRatios[item.index] || 1),
      );

  return (
    <>
      <div className="home">
        <Helmet>
          <meta
            name="description"
            content="La Classe de français de stéphanie Labbé"
          />
          <meta
            name="keyword"
            content="french teacher, course, native speaker, stéphanie labbé, la classe de français, la classe, professeur de francais, stéphanie midelet, classe, francais, san diego, calfornie"
          />
        </Helmet>
        <div className="container-fluid" style={{ paddingBottom: "12rem" }}>
          <div className="row">
            <div className="col-md-6" style={{ borderLeft: "1px solid black" }}>
              {isAdmin ? (
                <div style={{ marginTop: "5rem", paddingTop: "5rem" }}>
                  <h5 className="text-center mb-3">Aperçu du rendu public</h5>
                  <div className="home-photo-columns">
                    {previewColumns.map((column, colIndex) => (
                      <div className="home-photo-column" key={colIndex}>
                        {column.map((item) =>
                          previewUseDynamic ? (
                            <div className="home-photo-item" key={item._id}>
                              <img
                                className="img-thumbnail"
                                src={getHomePhotoImageUrl(item._id)}
                                alt="acceuil classe français stéphanie labbé midelet californie san-diego"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="home-photo-item" key={item.index}>
                              <img
                                className="img-thumbnail"
                                src={item.src}
                                alt="acceuil classe français stéphanie labbé midelet californie san-diego"
                              />
                            </div>
                          ),
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: "5rem", paddingTop: "5rem" }}>
                  <img
                    className="img-fluid"
                    src={acceuil}
                    alt="acceuil classe français stéphanie labbé midelet californie san-diego"
                  />
                </div>
              )}
            </div>
            <div className="col-md-6">
              {isAdmin && (
                <div className="home-photo-add-section">
                  <p className="fw-bold mb-2">Ajouter une photo</p>
                  <ImagePickerWithCrop
                    inputIdPrefix="home-photo"
                    onFileReady={handlePhotoReady}
                    resetAfterReady
                  />
                </div>
              )}

              {isAdmin ? (
                // Vue de gestion : mêmes colonnes équilibrées que le rendu
                // public (respecte les vraies proportions des photos),
                // avec les boutons directement sur chaque photo. Un clic
                // sur monter/descendre change bien la position réelle
                // d'une place, mais la photo peut aussi changer de colonne
                // visuellement (le recalcul tient compte des tailles).
                photos.length === 0 ? (
                  <p className="text-muted text-center">
                    Aucune photo enregistrée pour l'instant. Utilise le bouton
                    ci-dessus pour en ajouter une.
                  </p>
                ) : (
                  <div className="home-photo-columns">
                    {photoColumns.map((column, colIndex) => (
                      <div className="home-photo-column" key={colIndex}>
                        {column.map((item) => (
                          <div
                            className={`home-photo-item${
                              !item.visible ? " home-photo-hidden" : ""
                            }`}
                            key={item._id}
                          >
                            <img
                              className="img-thumbnail"
                              src={getHomePhotoImageUrl(item._id)}
                              alt="acceuil classe français stéphanie labbé midelet californie san-diego"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            <div className="home-photo-actions">
                              <button
                                type="button"
                                className="home-photo-action-btn"
                                onClick={() => movePhoto(item, "up")}
                                disabled={
                                  photos.findIndex(
                                    (p) => p._id === item._id,
                                  ) === 0
                                }
                                aria-label="Monter cette photo"
                                title="Monter cette photo"
                              >
                                <ArrowUpwardIcon fontSize="small" />
                              </button>
                              <button
                                type="button"
                                className="home-photo-action-btn"
                                onClick={() => movePhoto(item, "down")}
                                disabled={
                                  photos.findIndex(
                                    (p) => p._id === item._id,
                                  ) ===
                                  photos.length - 1
                                }
                                aria-label="Descendre cette photo"
                                title="Descendre cette photo"
                              >
                                <ArrowDownwardIcon fontSize="small" />
                              </button>
                              <button
                                type="button"
                                className="home-photo-action-btn"
                                onClick={() => toggleVisibility(item)}
                                aria-label={
                                  item.visible
                                    ? "Masquer cette photo"
                                    : "Afficher cette photo"
                                }
                                title={
                                  item.visible
                                    ? "Masquer cette photo"
                                    : "Afficher cette photo"
                                }
                              >
                                {item.visible ? (
                                  <VisibilityIcon fontSize="small" />
                                ) : (
                                  <VisibilityOffIcon fontSize="small" />
                                )}
                              </button>
                              <button
                                type="button"
                                className="home-photo-action-btn home-photo-action-delete"
                                onClick={() => requestDeletePhoto(item)}
                                aria-label="Supprimer cette photo"
                                title="Supprimer cette photo"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                // Rendu public réel (visiteur non-admin) : colonnes
                // équilibrées par taille + repli statique si besoin,
                // inchangé.
                <div className="home-photo-columns">
                  {photoColumns.map((column, colIndex) => (
                    <div className="home-photo-column" key={colIndex}>
                      {column.map((item) =>
                        useDynamicPhotos ? (
                          <div className="home-photo-item" key={item._id}>
                            <img
                              className="img-thumbnail"
                              src={getHomePhotoImageUrl(item._id)}
                              alt="acceuil classe français stéphanie labbé midelet californie san-diego"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="home-photo-item" key={item.index}>
                            <img
                              className="img-thumbnail"
                              src={item.src}
                              alt="acceuil classe français stéphanie labbé midelet californie san-diego"
                            />
                          </div>
                        ),
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ReviewCarousel />
        </div>
      </div>

      {confirmAction && (
        <ConfirmModal
          message={confirmAction.message}
          onConfirm={() => {
            confirmAction.onConfirm();
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  );
};

export default Home;
