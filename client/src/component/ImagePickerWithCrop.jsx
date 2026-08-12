import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { toast } from "react-toastify";

// ---------- Utilitaire de rognage (canvas) ----------

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

async function getCroppedImageFile(imageSrc, croppedAreaPixels, fileName) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Le rognage a échoué"));
          return;
        }
        resolve(new File([blob], fileName, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92
    );
  });
}

const ASPECT_OPTIONS = [
  { label: "Paysage", value: 4 / 3 },
  { label: "Portrait", value: 3 / 4 },
  { label: "Carré", value: 1 },
  { label: "Très haut", value: 9 / 16 },
  { label: "Très large", value: 16 / 9 },
];

/**
 * Sélecteur d'image réutilisable : Galerie / Appareil photo, aperçu,
 * rognage interactif (formats au choix). Une fois validé, renvoie le
 * fichier final (rogné) via onFileReady — prêt à être utilisé exactement
 * comme un <input type="file"> classique (setSelectedFile(file)).
 *
 * inputIdPrefix : à personnaliser si plusieurs instances existent sur la
 * même page en même temps (évite les id HTML en double).
 */
const ImagePickerWithCrop = ({ onFileReady, inputIdPrefix = "image-picker" }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [rawFile, setRawFile] = useState(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(4 / 3);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleRawFilePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRawFile(file);
    setRawPreviewUrl(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setIsCropping(true);
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const cancelCropping = () => {
    if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl);
    setRawFile(null);
    setRawPreviewUrl(null);
    setIsCropping(false);
  };

  const confirmCrop = async () => {
    if (!rawFile || !croppedAreaPixels) return;
    try {
      const croppedFile = await getCroppedImageFile(
        rawPreviewUrl,
        croppedAreaPixels,
        rawFile.name.replace(/\.[^/.]+$/, "") + ".jpg"
      );
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(croppedFile);
      setPreviewUrl(URL.createObjectURL(croppedFile));
      onFileReady(croppedFile);
      cancelCropping();
    } catch (err) {
      console.error(err);
      toast.error("Le rognage a échoué, réessaie.");
    }
  };

  const changeImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    onFileReady(null);
  };

  return (
    <div className="form-group">
      {isCropping && rawPreviewUrl ? (
        <>
          <div className="image-picker-aspect-group">
            {ASPECT_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                className={`image-picker-aspect-btn ${
                  aspect === option.value ? "is-active" : ""
                }`}
                onClick={() => setAspect(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="image-picker-cropper">
            <Cropper
              image={rawPreviewUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="image-picker-zoom"
            aria-label="Zoom"
          />
          <div className="image-picker-crop-actions">
            <button type="button" className="btn btn-success" onClick={confirmCrop}>
              Valider le cadrage
            </button>
            <button type="button" className="btn btn-warning" onClick={cancelCropping}>
              Annuler
            </button>
          </div>
        </>
      ) : (
        <>
          {previewUrl && (
            <div className="image-picker-preview">
              <img src={previewUrl} alt="Aperçu" className="img-thumbnail" />
            </div>
          )}

          <div className="image-picker-btn-group">
            <div>
              <input
                type="file"
                id={`${inputIdPrefix}-gallery`}
                accept="image/*"
                className="image-picker-input"
                onChange={handleRawFilePick}
              />
              <label
                htmlFor={`${inputIdPrefix}-gallery`}
                className="btn btn-outline-primary"
              >
                Galerie
              </label>
            </div>
            <div>
              <input
                type="file"
                id={`${inputIdPrefix}-camera`}
                accept="image/*"
                capture="environment"
                className="image-picker-input"
                onChange={handleRawFilePick}
              />
              <label
                htmlFor={`${inputIdPrefix}-camera`}
                className="btn btn-outline-primary"
              >
                Appareil photo
              </label>
            </div>
          </div>

          {selectedFile && (
            <button
              type="button"
              className="btn btn-link p-0 mt-2"
              onClick={changeImage}
            >
              Retirer l'image
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ImagePickerWithCrop;
