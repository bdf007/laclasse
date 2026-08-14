import React, { useState } from "react";

/**
 * Popup de confirmation générique -- réutilisable partout où une action
 * (suppression, etc.) mérite d'être confirmée avant d'être exécutée.
 *
 * Usage typique dans un composant :
 *
 *   const [confirmAction, setConfirmAction] = useState(null);
 *
 *   const requestConfirm = (message, onConfirm) =>
 *     setConfirmAction({ message, onConfirm });
 *
 *   <button onClick={() => requestConfirm("Supprimer ce livre ?", () => deleteBook(id))}>
 *     Supprimer
 *   </button>
 *
 *   {confirmAction && (
 *     <ConfirmModal
 *       message={confirmAction.message}
 *       onConfirm={() => {
 *         confirmAction.onConfirm();
 *         setConfirmAction(null);
 *       }}
 *       onCancel={() => setConfirmAction(null)}
 *     />
 *   )}
 *
 * Pour demander un texte libre en plus (ex: motif de suppression), passer
 * promptLabel -- onConfirm reçoit alors la valeur saisie en argument :
 *
 *   requestConfirm("Supprimer ?", (reason) => deleteX(id, reason), {
 *     promptLabel: "Motif (visible par l'auteur)",
 *   });
 *
 *   <ConfirmModal
 *     ...
 *     promptLabel={confirmAction.promptLabel}
 *     onConfirm={(reason) => {
 *       confirmAction.onConfirm(reason);
 *       setConfirmAction(null);
 *     }}
 *   />
 */
const ConfirmModal = ({
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  promptLabel,
  promptPlaceholder,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-content text-center" style={{ maxWidth: "26rem" }}>
        <p className="fs-5 mb-3">{message}</p>

        {promptLabel && (
          <div className="text-start mb-3">
            <label className="form-label">{promptLabel}</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder={promptPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        )}

        <div className="d-flex justify-content-center flex-wrap gap-2">
          <button
            className="btn btn-danger"
            onClick={() => onConfirm(inputValue)}
          >
            {confirmLabel}
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
