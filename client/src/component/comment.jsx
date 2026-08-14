import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { toast } from "react-toastify";
import ConfirmModal from "./confirmModal";

//design
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";

// Valeur choisie dans la déroulante admin pour "diffuser à toutes les
// classes" -- distincte de "" (qui signifie "rien choisi encore") côté
// interface. Elle est convertie en "" (la vraie valeur envoyée en base)
// au moment de l'envoi.
const ALL_CLASSES_OPTION = "__all__";

const CommentUploader = () => {
  const [listOfClassNames, setListOfClassNames] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [searchClass, setSearchClass] = useState("");
  const [searchFirstname, setSearchFirstname] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchComment, setSearchComment] = useState("");

  const [comment, setComment] = useState("");
  const { user } = useContext(UserContext);

  const [listOfComment, setListOfComment] = useState([]);

  // Popup de confirmation générique, réutilisée pour les suppressions
  const [confirmAction, setConfirmAction] = useState(null);
  const requestConfirm = (message, onConfirm, options = {}) =>
    setConfirmAction({ message, onConfirm, ...options });

  //get the size of the window
  // eslint-disable-next-line
  const [width, setWidth] = useState(window.innerWidth);
  const [show, setShow] = useState(true);

  const isAdminUser = user.role === "admin" || user.role === "superadmin";

  const getComment = async () => {
    try {
      // Du plus récent au plus ancien.
      const sortByDateDesc = (a, b) => new Date(b.Date) - new Date(a.Date);

      if (isAdminUser) {
        await axios
          .get(`${process.env.REACT_APP_API_URL}/api/comment`, {
            withCredentials: true,
          })
          .then((res) => {
            setListOfComment(res.data.sort(sortByDateDesc));
          });
      } else {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/comment/${user.classes}`,
          { withCredentials: true },
        );
        setListOfComment(response.data.sort(sortByDateDesc));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getListOfClassNames = async () => {
    try {
      await axios
        .get(`${process.env.REACT_APP_API_URL}/api/classes`)
        .then((res) => {
          setListOfClassNames(res.data);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchClass = (e) => {
    const value = e.target.value;
    setSearchClass(value);
    localStorage.setItem("searchClass", value);
  };

  const handleSearchFirstname = (e) => {
    const value = e.target.value;
    setSearchFirstname(value);
    localStorage.setItem("searchFirstname", value);
  };

  const handleSearchEmail = (e) => {
    const value = e.target.value;
    setSearchEmail(value);
    localStorage.setItem("searchEmail", value);
  };

  const handleSearchComment = (e) => {
    const value = e.target.value;
    setSearchComment(value);
    localStorage.setItem("searchComment", value);
  };

  useEffect(() => {
    // Un élève sans classe n'a rien à voir ni à poster -- pas besoin de
    // charger les commentaires dans ce cas.
    if (!isAdminUser && !user.classes) return;
    getComment();
    getListOfClassNames();
    // deactivate eslint warning
    // eslint-disable-next-line
  }, [comment, setComment]);

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  // Réécrit : la classe réellement envoyée est calculée directement au
  // moment de l'appel, plutôt que de dépendre d'un setClassName() qui ne
  // serait de toute façon pas encore répercuté dans la même fonction
  // (React ne met pas à jour la variable avant le prochain rendu) --
  // c'est ce qui faisait qu'un admin envoyait toujours un message sans
  // classe, quoi qu'il choisisse.
  const handleUpload = () => {
    const classToSend = isAdminUser
      ? selectedClass === ALL_CLASSES_OPTION
        ? ""
        : selectedClass
      : user.classes;

    axios
      .post(
        `${process.env.REACT_APP_API_URL}/api/comment`,
        {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          comment: comment,
          user: user._id,
          classes: classToSend,
        },
        { withCredentials: true },
      )
      .then((response) => {
        toast.success("Commentaire posté avec succès");
        setListOfComment([response.data, ...listOfComment]);

        // reset the form
        setComment("");
        setSelectedClass("");
        document.getElementById("comment").value = "";
      })
      .catch(() => {
        toast.error("Erreur lors de l'envoi du message");
      });
  };

  // Réécrit : si c'est l'auteur qui supprime son propre message,
  // suppression réelle sans confirmation de motif. Si c'est quelqu'un
  // d'autre (un admin qui modère), on demande un motif -- le backend se
  // charge de masquer le message (deletedByAdmin) plutôt que de le
  // supprimer réellement, pour que l'auteur sache pourquoi.
  const performDelete = (id, reason) => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/api/comment/${id}`, {
        data: reason !== undefined ? { reason } : undefined,
        withCredentials: true,
      })
      .then(() => {
        toast.success("Commentaire supprimé");
        getComment(); // recharge : reflète la modération éventuelle
      })
      .catch(() => {
        toast.error("Erreur lors de la suppression");
      });
  };

  const deleteComment = (comment) => {
    const isOwnComment = comment.user === user._id;

    if (isOwnComment) {
      requestConfirm("Supprimer ce commentaire ?", () =>
        performDelete(comment._id),
      );
    } else {
      requestConfirm(
        "Supprimer ce message ? L'auteur en sera informé avec le motif ci-dessous.",
        (reason) => performDelete(comment._id, reason),
        {
          promptLabel: "Motif de la suppression (visible par l'auteur)",
          promptPlaceholder: "Ex : propos insultants, hors sujet...",
        },
      );
    }
  };

  // Suppression réelle et définitive d'un message déjà modéré -- plus rien
  // à garder, contrairement à deleteComment qui masque sans effacer.
  const handlePermanentDelete = (comment) => {
    requestConfirm(
      "Supprimer définitivement ce message ? Cette action est irréversible.",
      async () => {
        try {
          await axios.delete(
            `${process.env.REACT_APP_API_URL}/api/comment/${comment._id}/permanent`,
            { withCredentials: true },
          );
          toast.success("Message supprimé définitivement");
          getComment();
        } catch (error) {
          toast.error("Erreur lors de la suppression");
        }
      },
    );
  };

  // Empêche un double-clic (ou plusieurs clics rapides) d'envoyer
  // plusieurs signalements avant que la liste n'ait eu le temps de se
  // rafraîchir et de masquer l'icône.
  const [pendingReportIds, setPendingReportIds] = useState(new Set());

  const reportComment = (comment) => {
    if (pendingReportIds.has(comment._id)) return;

    requestConfirm("Signaler ce message à l'administrateur ?", async () => {
      setPendingReportIds((prev) => new Set(prev).add(comment._id));
      try {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/comment/${comment._id}/report`,
          {},
          { withCredentials: true },
        );
        toast.success("Message signalé à l'administrateur");
        await getComment();
      } catch (error) {
        toast.error("Erreur lors du signalement");
      } finally {
        setPendingReportIds((prev) => {
          const next = new Set(prev);
          next.delete(comment._id);
          return next;
        });
      }
    });
  };

  // Admin uniquement : le(s) signalement(s) sont jugés non fondés, on les
  // efface sans toucher au message lui-même.
  const clearReports = (comment) => {
    requestConfirm(
      "Ignorer le(s) signalement(s) sur ce message ?",
      async () => {
        try {
          await axios.put(
            `${process.env.REACT_APP_API_URL}/api/comment/${comment._id}/clear-reports`,
            {},
            { withCredentials: true },
          );
          toast.success("Signalements ignorés");
          getComment();
        } catch (error) {
          toast.error("Erreur lors de la mise à jour");
        }
      },
    );
  };

  // check if the size of the window is a mobile size
  const handleResize = () => {
    const newWidth = window.innerWidth;
    setWidth(newWidth);
    if (newWidth < 1200) {
      setShow(false);
    } else {
      setShow(true);
    }
  };
  useEffect(() => {
    handleResize(); // Call it on initial render
    window.addEventListener("resize", handleResize); // Attach it to the resize event

    // Don't forget to remove the event listener on cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line
  }, []);

  // Un élève sans classe assignée ne doit voir ni consulter ni poster de
  // message -- le module entier reste invisible pour lui.
  if (!isAdminUser && !user.classes) {
    return null;
  }

  const filteredComments = listOfComment.filter(
    (val) =>
      (val.classes || "").toLowerCase().includes(searchClass.toLowerCase()) &&
      (val.firstname || "")
        .toLowerCase()
        .includes(searchFirstname.toLowerCase()) &&
      (val.email || "").toLowerCase().includes(searchEmail.toLowerCase()) &&
      (val.comment || "").toLowerCase().includes(searchComment.toLowerCase()),
  );

  return (
    <div className="container" style={{ paddingBottom: "12rem" }}>
      {isAdminUser ? (
        show === true ? (
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Prénom</th>
                  <th>email</th>
                  <th>Commentaire</th>
                  <th>Signalements</th>
                  <th>date</th>
                  <th>action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="search-fields">
                  <td>
                    <input
                      type="text"
                      placeholder="recherche par classe"
                      value={searchClass}
                      onChange={handleSearchClass}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="recherche par prénom"
                      value={searchFirstname}
                      onChange={handleSearchFirstname}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="recherche par email"
                      value={searchEmail}
                      onChange={handleSearchEmail}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="recherche par commentaire"
                      value={searchComment}
                      onChange={handleSearchComment}
                    />
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                {filteredComments.map((comment) => {
                  const isAdminComment =
                    comment.userRole === "admin" ||
                    comment.userRole === "superadmin";
                  const commentClassAdmin = isAdminComment
                    ? "bg-primary text-white text-end"
                    : "";
                  const commentClassAdmin2 = isAdminComment
                    ? "bg-primary text-white text-start"
                    : "";
                  const hasReports =
                    comment.reports && comment.reports.length > 0;
                  return (
                    <tr
                      key={comment._id}
                      className={hasReports ? "table-warning" : ""}
                    >
                      <td className={`${commentClassAdmin}`}>
                        {comment.classes || "Toutes les classes"}
                      </td>
                      <td className={`${commentClassAdmin}`}>
                        {comment.firstname}
                      </td>
                      <td className={`${commentClassAdmin}`}>
                        {comment.email}
                      </td>
                      <td className={`${commentClassAdmin}`}>
                        {comment.comment}
                      </td>
                      <td style={{ maxWidth: "140px", whiteSpace: "normal" }}>
                        {hasReports && (
                          <>
                            <span className="badge bg-warning text-dark d-inline-block mb-1">
                              Signalé ({comment.reports.length})
                            </span>
                            <div className="small text-muted mb-1">
                              {comment.reports
                                .map((r) => `${r.firstname} ${r.lastname}`)
                                .join(", ")}
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => clearReports(comment)}
                            >
                              Ignorer
                            </button>
                          </>
                        )}
                      </td>
                      <td className={`${commentClassAdmin2}`}>
                        {new Date(comment.Date).toLocaleDateString("fr-FR")} à{" "}
                        {new Date(comment.Date).toLocaleTimeString("fr-FR")}
                      </td>
                      <td className="text-end">
                        {comment.deletedByAdmin ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handlePermanentDelete(comment)}
                          >
                            Supprimer définitivement
                          </button>
                        ) : (
                          <DeleteForeverRoundedIcon
                            style={{ cursor: "pointer" }}
                            onClick={() => deleteComment(comment)}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Classe"
                  value={searchClass}
                  onChange={handleSearchClass}
                />
              </div>
              <div className="col-6">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Prénom"
                  value={searchFirstname}
                  onChange={handleSearchFirstname}
                />
              </div>
              <div className="col-12">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Commentaire"
                  value={searchComment}
                  onChange={handleSearchComment}
                />
              </div>
            </div>

            {filteredComments.map((comment) => {
              const hasReports = comment.reports && comment.reports.length > 0;
              return (
                <div
                  key={comment._id}
                  className={`card mb-2 ${hasReports ? "border-warning" : ""}`}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="card-subtitle mb-1 text-muted">
                          {comment.classes || "Toutes les classes"}
                        </h6>
                        <p className="mb-1 fw-bold">{comment.firstname}</p>
                      </div>
                      {!comment.deletedByAdmin && (
                        <DeleteForeverRoundedIcon
                          style={{ cursor: "pointer" }}
                          onClick={() => deleteComment(comment)}
                        />
                      )}
                    </div>
                    <p className="mb-2">{comment.comment}</p>
                    {hasReports && (
                      <div className="mb-2">
                        <span className="badge bg-warning text-dark d-inline-block mb-1">
                          Signalé ({comment.reports.length})
                        </span>
                        <div className="small text-muted mb-1">
                          {comment.reports
                            .map((r) => `${r.firstname} ${r.lastname}`)
                            .join(", ")}
                        </div>
                        <div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => clearReports(comment)}
                          >
                            Ignorer
                          </button>
                        </div>
                      </div>
                    )}
                    {comment.deletedByAdmin && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger mb-2"
                        onClick={() => handlePermanentDelete(comment)}
                      >
                        Supprimer définitivement
                      </button>
                    )}
                    <p className="text-muted small mb-0">
                      {new Date(comment.Date).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(comment.Date).toLocaleTimeString("fr-FR")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : showComments === false ? (
        <button
          className="btn btn-primary"
          onClick={() => setShowComments(true)}
        >
          Afficher les messages de la classe
        </button>
      ) : (
        <button
          className="btn btn-primary"
          onClick={() => setShowComments(false)}
        >
          Masquer les messages de la classe
        </button>
      )}
      {showComments === true && user.role === "student" && user.classes && (
        <>
          <ul className="list-group list-group-flush ">
            <li className="text-center list-group-item bg-transparent">
              <h2>Chat avec ta classe</h2>
            </li>
            <li className="form-group list-group-item bg-transparent">
              <label htmlFor="comment">Commentaire*</label>
              <textarea
                value={comment}
                id="comment"
                size="small"
                className="form-control mb-3"
                placeholder="Commentaire*"
                label="Commentaire*"
                onChange={handleCommentChange}
              >
                {" "}
              </textarea>
              <p className="fs-6 text-muted">*: champs obligatoire</p>
            </li>
            <li className="form-group list-group-item bg-transparent d-flex justify-content-center">
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={!comment}
              >
                Envoyer
              </button>
            </li>
          </ul>
        </>
      )}
      {isAdminUser && (
        <>
          <ul className="list-group list-group-flush ">
            <li className="form-group list-group-item bg-transparent d-flex justify-content-center">
              <div className="d-flex justify-content-between">
                <select
                  className="form-select"
                  aria-label="Default select example"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Choisir une classe</option>
                  <option value={ALL_CLASSES_OPTION}>Toutes les classes</option>
                  {listOfClassNames.map(
                    (classe) =>
                      classe.name !== "public" && (
                        <option value={classe.name} key={classe._id}>
                          {classe.name}
                        </option>
                      ),
                  )}
                </select>
              </div>
            </li>
            <li className="form-group list-group-item bg-transparent">
              <label htmlFor="comment">Commentaire*</label>
              <textarea
                value={comment}
                id="comment"
                size="small"
                className="form-control mb-3"
                placeholder="Commentaire*"
                label="Commentaire*"
                onChange={handleCommentChange}
              >
                {" "}
              </textarea>
              <p className="fs-6 text-muted">*: champs obligatoire</p>
            </li>
            <li className="form-group list-group-item bg-transparent d-flex justify-content-center">
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={!comment || !selectedClass}
              >
                Envoyer
              </button>
            </li>
            <div>
              <br />
            </div>
          </ul>
        </>
      )}
      <div>
        {showComments === true && listOfComment.length === 0 && (
          <h3>Aucun Commentaire pour le moment</h3>
        )}
        {showComments === true &&
          listOfComment.map((comment) => {
            const isCurrentUserComment = comment.user === user._id;
            const commentClass = isCurrentUserComment
              ? "justify-content-end text-success"
              : "justify-content-start text-primary";

            const isAdminComment =
              comment.userRole === "admin" || comment.userRole === "superadmin";
            const commentClassAdmin = isAdminComment
              ? "bg-danger text-white"
              : "";
            return (
              <div key={comment._id}>
                <div className="container">
                  {user.role === "admin" ||
                    (user.role === "superadmin" && (
                      <span className="text-danger fs-4">
                        {comment.classes || "Toutes les classes"}
                      </span>
                    ))}
                  <br />
                  {comment.Date && (
                    <span className="text-success fs-6 ">
                      envoyé le :{/* add the date and the time in fr*/}
                      {new Date(comment.Date).toLocaleDateString(
                        "fr-FR",
                      )} à {new Date(comment.Date).toLocaleTimeString("fr-FR")}
                    </span>
                  )}
                  <br />
                  <p
                    className={`d-flex ${commentClass} ${commentClassAdmin} ${
                      comment.deletedByAdmin ? "fst-italic text-muted" : ""
                    }`}
                  >
                    <span className="fs-4">{comment.firstname} :</span>

                    <span className="fs-4 ">{comment.comment}</span>
                    {!comment.deletedByAdmin &&
                      (user.role !== "admin" || user.role !== "superadmin") &&
                      comment.user === user._id && (
                        <HighlightOffOutlinedIcon
                          style={{ cursor: "pointer" }}
                          onClick={() => deleteComment(comment)}
                        />
                      )}
                    {!comment.deletedByAdmin &&
                      !isAdminUser &&
                      comment.user !== user._id &&
                      comment.userRole !== "admin" &&
                      comment.userRole !== "superadmin" &&
                      !(comment.reports || []).some(
                        (r) => r.user === user._id,
                      ) && (
                        <FlagOutlinedIcon
                          style={{
                            cursor: pendingReportIds.has(comment._id)
                              ? "not-allowed"
                              : "pointer",
                            opacity: pendingReportIds.has(comment._id)
                              ? 0.4
                              : 1,
                          }}
                          titleAccess="Signaler ce message"
                          onClick={() => reportComment(comment)}
                        />
                      )}
                  </p>
                </div>
              </div>
            );
          })}
      </div>

      {confirmAction && (
        <ConfirmModal
          message={confirmAction.message}
          promptLabel={confirmAction.promptLabel}
          promptPlaceholder={confirmAction.promptPlaceholder}
          onConfirm={(value) => {
            confirmAction.onConfirm(value);
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default CommentUploader;
