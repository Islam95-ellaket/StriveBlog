import React, { useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { BsPencil, BsTrash } from "react-icons/bs";
import { addComment, deleteComment, updateComment } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import Avatar from "../avatar/Avatar";

export default function BlogComments({ postId, comments = [] }) {
  const { user } = useAuth();
  const location = useLocation();
  const [list, setList] = useState(comments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [busyId, setBusyId] = useState(null);

  React.useEffect(() => {
    setList(comments);
  }, [comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      const created = await addComment(postId, content.trim());
      setList((prev) => [...prev, created]);
      setContent("");
    } catch (err) {
      setError(err.message || "Impossibile pubblicare il commento.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleUpdate = async (e, commentId) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    setError(null);
    setBusyId(commentId);
    try {
      const updated = await updateComment(postId, commentId, editContent.trim());
      setList((prev) => prev.map((c) => (c._id === commentId ? updated : c)));
      cancelEdit();
    } catch (err) {
      setError(err.message || "Impossibile modificare il commento.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Eliminare questo commento?")) return;
    setError(null);
    setBusyId(commentId);
    try {
      await deleteComment(postId, commentId);
      setList((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      setError(err.message || "Impossibile eliminare il commento.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mt-5">
      <h2 className="h4 mb-4">
        Commenti {list.length > 0 ? `(${list.length})` : ""}
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {list.length === 0 && (
        <p className="text-muted">Nessun commento ancora presente.</p>
      )}

      {list.map((comment) => {
        const isMine = user && comment.author?._id === user._id;
        const isEditing = editingId === comment._id;
        return (
          <div key={comment._id} className="d-flex gap-3 mb-4">
            <Avatar
              name={comment.author?.name}
              src={comment.author?.avatar}
              size={40}
            />
            <div className="flex-grow-1">
              <div className="fw-semibold">
                {comment.author?.name || "Utente"}
                <span className="text-muted fw-normal small ms-2">
                  {comment.createdAt
                    ? new Date(comment.createdAt).toLocaleDateString("it-IT")
                    : ""}
                </span>
              </div>

              {isEditing ? (
                <Form onSubmit={(e) => handleUpdate(e, comment._id)}>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    required
                  />
                  <div className="mt-2 d-flex gap-2">
                    <Button
                      type="submit"
                      variant="dark"
                      size="sm"
                      disabled={busyId === comment._id}
                    >
                      {busyId === comment._id ? "Salvataggio…" : "Salva"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="sm"
                      onClick={cancelEdit}
                    >
                      Annulla
                    </Button>
                  </div>
                </Form>
              ) : (
                <>
                  <p className="mb-1">{comment.content}</p>
                  {isMine && (
                    <div className="d-flex gap-3">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-decoration-none"
                        onClick={() => startEdit(comment)}
                        disabled={busyId === comment._id}
                      >
                        <BsPencil className="me-1" />
                        Modifica
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-decoration-none text-danger"
                        onClick={() => handleDelete(comment._id)}
                        disabled={busyId === comment._id}
                      >
                        <BsTrash className="me-1" />
                        Elimina
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      {user ? (
        <Form onSubmit={handleSubmit} className="mt-4">
          <Form.Group controlId="comment-content">
            <Form.Label className="fw-semibold">Lascia un commento</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </Form.Group>
          <Button type="submit" variant="dark" className="mt-3" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Invio…
              </>
            ) : (
              "Pubblica commento"
            )}
          </Button>
        </Form>
      ) : (
        <Alert variant="light" className="border mt-4">
          <Link
            to="/login"
            state={{ from: location.pathname, message: "Accedi per lasciare un commento." }}
          >
            Accedi
          </Link>{" "}
          per lasciare un commento.
        </Alert>
      )}
    </section>
  );
}
