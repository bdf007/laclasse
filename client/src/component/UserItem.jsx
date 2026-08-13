import React from "react";
import {
  getRoleLabel,
  ROLE_OPTIONS,
  roleCanHaveClass,
  classPlaceholderMessage,
} from "../utils/roleUtils";

const UserItem = ({
  stud,
  layout, // "card" | "row"
  listOfClass,
  selectedClassId,
  onSelectClass,
  onAssignClass,
  onRemoveClass,
  selectedRole,
  onSelectRole,
  onUpdateRole,
  onDelete,
}) => {
  const canDelete =
    stud.role !== "admin" &&
    stud.role !== "superadmin" &&
    stud.role !== "AdminVin";
  const canHaveClass = roleCanHaveClass(stud.role);

  const classSection = canHaveClass ? (
    <div className="d-flex flex-column flex-sm-row gap-2 align-items-stretch">
      <select
        className="form-select"
        value={selectedClassId || ""}
        onChange={(e) => onSelectClass(stud._id, e.target.value)}
      >
        <option value="">Choisir la classe</option>
        {listOfClass.map((classe) => (
          <option value={classe._id} key={classe._id}>
            {classe.name}
          </option>
        ))}
        <option value="none">Aucune</option>
      </select>
      <button
        className="btn btn-primary text-nowrap"
        disabled={!selectedClassId}
        onClick={() =>
          selectedClassId === "none"
            ? onRemoveClass(stud._id)
            : onAssignClass(stud._id, selectedClassId)
        }
      >
        {selectedClassId === "none" ? "Retirer la classe" : "Assigner"}
      </button>
    </div>
  ) : (
    <p className="text-muted mb-0">{classPlaceholderMessage(stud.role)}</p>
  );

  const roleSection = (
    <div className="d-flex flex-column flex-sm-row gap-2 align-items-stretch">
      <select
        className="form-select"
        value={selectedRole || ""}
        onChange={(e) => onSelectRole(stud._id, e.target.value)}
        disabled={stud.role === "superadmin"}
      >
        <option value="">Choisir le rôle</option>
        {ROLE_OPTIONS.map((opt) => (
          <option value={opt.value} key={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        className="btn btn-primary text-nowrap"
        disabled={!selectedRole || stud.role === "superadmin"}
        onClick={() => onUpdateRole(stud._id)}
      >
        Modifier
      </button>
    </div>
  );

  if (layout === "row") {
    return (
      <tr>
        <td>{stud.firstname}</td>
        <td>{stud.lastname}</td>
        <td className="text-break">{stud.email}</td>
        <td>{getRoleLabel(stud.role)}</td>
        <td>{stud.className || "-"}</td>
        <td style={{ minWidth: 220 }}>{classSection}</td>
        <td style={{ minWidth: 220 }}>{roleSection}</td>
        <td>
          {canDelete && (
            <button
              className="btn btn-danger"
              onClick={() => onDelete(stud._id)}
            >
              Supprimer
            </button>
          )}
        </td>
      </tr>
    );
  }

  // layout === "card" (utilisé par défaut, notamment sur mobile)
  return (
    <div className="card mb-3">
      <div className="card-body text-start">
        <h5 className="card-title mb-0">
          {stud.firstname} {stud.lastname}
        </h5>
        <p className="text-muted small mb-2">{stud.email}</p>

        <p className="mb-1">
          <strong>Rôle :</strong> {getRoleLabel(stud.role)}
        </p>
        <p className="mb-3">
          <strong>Classe :</strong> {stud.className || "-"}
        </p>

        <div className="mb-3">{classSection}</div>
        <div className="mb-3">{roleSection}</div>

        {canDelete && (
          <button
            className="btn btn-danger w-100"
            onClick={() => onDelete(stud._id)}
          >
            Supprimer l'utilisateur
          </button>
        )}
      </div>
    </div>
  );
};

export default UserItem;
