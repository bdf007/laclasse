import React from "react";

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
 */
const ConfirmModal = ({
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
}) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-content text-center" style={{ maxWidth: "26rem" }}>
        <p className="fs-5 mb-4">{message}</p>
        <div className="d-flex justify-content-center flex-wrap gap-2">
          <button className="btn btn-danger" onClick={onConfirm}>
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
