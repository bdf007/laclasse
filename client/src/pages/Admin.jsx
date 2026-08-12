import React, { useContext, useState, useEffect, useCallback } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { getUser } from "../api/user";
import { toast } from "react-toastify";
import Class from "../component/class";
import UserItem from "../component/UserItem";
import { extractErrorMessage } from "../utils/roleUtils";

import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

const MOBILE_BREAKPOINT = 768; // en dessous : mode cards forcé, pas de choix
const API = process.env.REACT_APP_API_URL;

const Admin = () => {
  const { user, setUser } = useContext(UserContext);

  const [listOfUser, setListOfUser] = useState([]);
  const [listOfBookers, setListOfBookers] = useState([]);
  const [listOfClass, setListOfClass] = useState([]);

  // état par utilisateur (clé = stud._id), plus de risque de croisement entre utilisateurs
  const [selectedClass, setSelectedClass] = useState({});
  const [selectedRole, setSelectedRole] = useState({});

  const [viewMode, setViewMode] = useState("cards");
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT,
  );

  // --- Responsive : cards forcées sous le breakpoint, choix libre au-dessus ---
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile) setViewMode("cards");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleViewMode = () => {
    if (isMobile) return; // pas de table forcée sur mobile
    setViewMode((v) => (v === "cards" ? "table" : "cards"));
  };

  // --- Chargement initial des données ---
  // Corrigé : le backend (getUsers) renvoie déjà le NOM de la classe dans
  // u.classes (pas un ID) — inutile et cassé de vouloir le re-résoudre ici
  // via /api/class/:id (ça plantait avec un BSONError, u.classes n'étant
  // pas un ObjectId valide).
  const fetchAndSetClassNames = useCallback((users) => {
    const updatedUsers = users.map((u) => ({
      ...u,
      className: u.classes || null,
    }));
    updatedUsers.sort((a, b) => {
      if (a.className && b.className)
        return a.className.localeCompare(b.className);
      if (a.className) return -1;
      if (b.className) return 1;
      return 0;
    });
    setListOfUser(updatedUsers);
  }, []);

  const getAllBookers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/get-list-of-all-booker`, {
        withCredentials: true,
      });
      setListOfBookers(res.data);
    } catch (err) {
      toast.error(
        extractErrorMessage(err, "Erreur de chargement des emprunts"),
      );
    }
  }, []);

  useEffect(() => {
    axios
      .get(`${API}/api/users`)
      .then((res) => fetchAndSetClassNames(res.data))
      .catch((err) =>
        toast.error(
          extractErrorMessage(err, "Erreur de chargement des utilisateurs"),
        ),
      );

    axios
      .get(`${API}/api/classes`)
      .then((res) => {
        setListOfClass(res.data.filter((c) => c.name !== "public"));
      })
      .catch((err) =>
        toast.error(
          extractErrorMessage(err, "Erreur de chargement des classes"),
        ),
      );

    getAllBookers();

    // un seul appel à getUser() (le doublon du composant d'origine a été supprimé)
    getUser()
      .then((res) => (res.error ? toast.error(res.error) : setUser(res)))
      .catch((err) =>
        toast.error(
          extractErrorMessage(err, "Erreur de chargement de l'utilisateur"),
        ),
      );
  }, [fetchAndSetClassNames, getAllBookers, setUser]);

  // --- Actions : mise à jour locale de l'état, plus de window.location.reload() ---

  const deleteUser = (id) => {
    const stud = listOfUser.find((u) => u._id === id);
    if (!stud) return;

    if (stud.role === "admin" || stud.role === "superadmin") {
      toast.error("Vous ne pouvez pas supprimer un admin ou un superadmin");
      return;
    }
    if (stud.classes) {
      toast.error(
        "L'utilisateur a une classe assignée, merci de le retirer de la classe avant de le supprimer",
      );
      return;
    }
    const booker = listOfBookers.find((b) => b.emprunteur === id);
    if (booker) {
      toast.error(
        "L'utilisateur a emprunté un livre, merci de récupérer le livre avant de le supprimer",
      );
      return;
    }

    axios
      .delete(`${API}/api/user/${id}`, { withCredentials: true })
      .then(() => {
        toast.success("Utilisateur supprimé");
        setListOfUser((prev) => prev.filter((u) => u._id !== id));
      })
      .catch((err) =>
        toast.error(extractErrorMessage(err, "Erreur lors de la suppression")),
      );
  };

  const updateUserRole = (userId) => {
    const role = selectedRole[userId];
    if (!role) {
      toast.error("Merci de choisir un rôle");
      return;
    }
    if (role === "user" || role === "oldstudent") {
      const stud = listOfUser.find((u) => u._id === userId);
      if (stud?.classes) {
        toast.error(
          "L'utilisateur a une classe assignée, merci de retirer la classe avant de changer son rôle",
        );
        return;
      }
    }

    axios
      .put(
        `${API}/api/user/${userId}/change-role`,
        { role },
        { withCredentials: true },
      )
      .then(() => {
        toast.success("Le rôle de l'utilisateur a été modifié");
        setListOfUser((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role } : u)),
        );
        setSelectedRole((prev) => ({ ...prev, [userId]: "" }));
      })
      .catch((err) =>
        toast.error(
          extractErrorMessage(err, "Erreur lors de la modification du rôle"),
        ),
      );
  };

  const assignClassToUser = (userId, classId) => {
    axios
      .post(
        `${API}/api/user/assign-class`,
        { userId, classId },
        { withCredentials: true },
      )
      .then(() => {
        toast.success("Classe assignée à l'utilisateur");
        const classe = listOfClass.find((c) => c._id === classId);
        setListOfUser((prev) =>
          prev.map((u) =>
            u._id === userId
              ? { ...u, classes: classId, className: classe?.name }
              : u,
          ),
        );
        setSelectedClass((prev) => ({ ...prev, [userId]: "" }));
      })
      .catch((err) =>
        toast.error(
          extractErrorMessage(err, "Erreur lors de l'assignation de la classe"),
        ),
      );
  };

  const removeClassFromUser = (userId) => {
    axios
      .post(
        `${API}/api/user/remove-class`,
        { userId },
        { withCredentials: true },
      )
      .then(() => {
        toast.success("Classe retirée de l'utilisateur");
        setListOfUser((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, classes: null, className: null } : u,
          ),
        );
        setSelectedClass((prev) => ({ ...prev, [userId]: "" }));
      })
      .catch((err) =>
        toast.error(
          extractErrorMessage(err, "Erreur lors du retrait de la classe"),
        ),
      );
  };

  if (!user) {
    return (
      <div className="container text-center home" style={{ marginTop: "4rem" }}>
        <div className="alert alert-primary p-5">
          <h1>Non autorisé</h1>
        </div>
      </div>
    );
  }

  if (user.role !== "admin" && user.role !== "superadmin") {
    return null;
  }

  return (
    <div
      className="container text-center home"
      style={{ marginTop: "1rem", paddingBottom: "12rem" }}
    >
      <div className="bg-transparent p-5">
        <h1>
          <span className="text-success">{user.firstname}'s</span> Admin
        </h1>

        <Class />

        <div className="mb-3 d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Liste des utilisateurs</h2>
          {!isMobile && (
            <button className="btn btn-primary" onClick={toggleViewMode}>
              {viewMode === "cards" ? (
                <DashboardOutlinedIcon />
              ) : (
                <FormatListBulletedOutlinedIcon />
              )}
            </button>
          )}
        </div>

        {viewMode === "cards" ? (
          <div className="d-flex flex-column align-items-stretch">
            {listOfUser.map((stud) => (
              <UserItem
                key={stud._id}
                stud={stud}
                layout="card"
                listOfClass={listOfClass}
                selectedClassId={selectedClass[stud._id]}
                onSelectClass={(id, val) =>
                  setSelectedClass((prev) => ({ ...prev, [id]: val }))
                }
                onAssignClass={assignClassToUser}
                onRemoveClass={removeClassFromUser}
                selectedRole={selectedRole[stud._id]}
                onSelectRole={(id, val) =>
                  setSelectedRole((prev) => ({ ...prev, [id]: val }))
                }
                onUpdateRole={updateUserRole}
                onDelete={deleteUser}
              />
            ))}
          </div>
        ) : (
          <div className="table-responsive text-break">
            <table className="table table-striped table-bordered table-hover">
              <thead>
                <tr>
                  <th scope="col">Prénom</th>
                  <th scope="col">Nom</th>
                  <th scope="col">Email</th>
                  <th scope="col">Rôle</th>
                  <th scope="col">Classe</th>
                  <th scope="col">Changer de classe</th>
                  <th scope="col">Modifier le rôle</th>
                  <th scope="col">Supprimer</th>
                </tr>
              </thead>
              <tbody>
                {listOfUser.map((stud) => (
                  <UserItem
                    key={stud._id}
                    stud={stud}
                    layout="row"
                    listOfClass={listOfClass}
                    selectedClassId={selectedClass[stud._id]}
                    onSelectClass={(id, val) =>
                      setSelectedClass((prev) => ({ ...prev, [id]: val }))
                    }
                    onAssignClass={assignClassToUser}
                    onRemoveClass={removeClassFromUser}
                    selectedRole={selectedRole[stud._id]}
                    onSelectRole={(id, val) =>
                      setSelectedRole((prev) => ({ ...prev, [id]: val }))
                    }
                    onUpdateRole={updateUserRole}
                    onDelete={deleteUser}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
