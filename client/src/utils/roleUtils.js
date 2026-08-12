// Source unique de vérité pour les rôles : labels affichés + options de select.

export const ROLE_LABELS = {
  user: "Utilisateur",
  student: "Élève",
  oldstudent: "Ancien élève",
  admin: "Admin",
  superadmin: "Super Admin",
  AdminVin: "Admin Vinothèque",
};

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || role || "-";
}

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  }),
);

// Rôles qui n'ont, par conception, jamais de classe assignée
const ROLES_WITHOUT_CLASS = ["oldstudent", "admin", "superadmin", "AdminVin"];

export function roleCanHaveClass(role) {
  return !ROLES_WITHOUT_CLASS.includes(role);
}

// Message affiché à la place du sélecteur de classe, selon le rôle
export function classPlaceholderMessage(role) {
  if (role === "oldstudent") return "Ancien élève";
  if (role === "user")
    return "Changez le rôle pour pouvoir attribuer une classe";
  return "Les admins n'ont pas de classe assignée";
}

export function extractErrorMessage(err, fallback) {
  return err?.response?.data?.error || err?.message || fallback;
}
