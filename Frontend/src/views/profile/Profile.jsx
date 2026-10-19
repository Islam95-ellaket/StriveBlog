import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { deletePost, getAuthorPosts, uploadAuthorAvatar } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import Avatar from "../../components/avatar/Avatar";
import BlogItem from "../../components/blog/blog-item/BlogItem";
import ImageUploadField from "../../components/upload/ImageUploadField";
import "./styles.css";

export default function Profile() {
  const { user, initializing, refreshUser } = useAuth();

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [avatarOk, setAvatarOk] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const loadPosts = useCallback(async (authorId) => {
    setPostsLoading(true);
    setPostsError(null);
    try {
      const data = await getAuthorPosts(authorId);
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setPostsError(err.message || "Impossibile caricare i tuoi articoli.");
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?._id) loadPosts(user._id);
  }, [user?._id, loadPosts]);

  const handleDeletePost = async (postId) => {
    setDeleteError(null);
    setDeleteBusy(true);
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setConfirmDeleteId(null);
    } catch (err) {
      setDeleteError(err.message || "Cancellazione fallita, riprova.");
    } finally {
      setDeleteBusy(false);
    }
  };

  if (initializing) {
    return (
      <Container className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento…</span>
        </Spinner>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container style={{ maxWidth: 560 }}>
        <Alert variant="warning" className="text-center">
          <p className="mb-3">Accedi per vedere il tuo profilo.</p>
          <Button
            as={Link}
            to="/login"
            state={{ from: "/profile", message: "Accedi per vedere il tuo profilo." }}
            className="btn-sb-dark"
          >
            Accedi
          </Button>
        </Alert>
      </Container>
    );
  }

  const handleAvatarSave = async () => {
    if (!avatarFile) return;
    setAvatarError(null);
    setAvatarOk(false);
    setAvatarBusy(true);
    try {
      await uploadAuthorAvatar(user._id, avatarFile);
      await refreshUser();
      setAvatarFile(null);
      setAvatarOk(true);
    } catch (err) {
      setAvatarError(err.message || "Caricamento avatar fallito, riprova.");
    } finally {
      setAvatarBusy(false);
    }
  };

  const dobLabel = user.dob
    ? new Date(user.dob).toLocaleDateString("it-IT")
    : null;

  return (
    <Container style={{ maxWidth: 900 }}>
      <section className="sb-card profile-card">
        <div className="profile-header">
          <Avatar
            name={user.name}
            surname={user.surname}
            src={user.avatar}
            size={110}
          />
          <div className="profile-identity">
            <h1 className="sb-page-title h3 mb-1">
              {user.name} {user.surname}
            </h1>
            <div className="text-muted">{user.email}</div>
            {dobLabel && <div className="text-muted small">Nato il {dobLabel}</div>}
          </div>
        </div>

        <div className="profile-avatar-edit">
          <ImageUploadField
            id="profile-avatar"
            label="Cambia avatar"
            variant="avatar"
            file={avatarFile}
            onChange={(f) => {
              setAvatarFile(f);
              setAvatarError(null);
              setAvatarOk(false);
            }}
            disabled={avatarBusy}
            hint="PNG o JPG, massimo 2 MB. Facoltativo."
          />
          {avatarFile && (
            <Button
              className="btn-sb-dark mt-3"
              onClick={handleAvatarSave}
              disabled={avatarBusy}
            >
              {avatarBusy ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Caricamento…
                </>
              ) : (
                "Salva nuovo avatar"
              )}
            </Button>
          )}
          {avatarError && (
            <Alert variant="danger" className="mt-3 mb-0">{avatarError}</Alert>
          )}
          {avatarOk && (
            <Alert variant="success" className="mt-3 mb-0">
              Avatar aggiornato correttamente.
            </Alert>
          )}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="h4 sb-page-title mb-4">I miei articoli</h2>
        {postsLoading ? (
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Caricamento…</span>
            </Spinner>
          </div>
        ) : postsError ? (
          <Alert variant="danger">
            {postsError}{" "}
            <Button
              variant="outline-dark"
              size="sm"
              className="ms-2"
              onClick={() => loadPosts(user._id)}
            >
              Riprova
            </Button>
          </Alert>
        ) : posts.length === 0 ? (
          <Alert variant="light" className="border text-center">
            Non hai ancora pubblicato articoli.{" "}
            <Link to="/new">Scrivi il primo!</Link>
          </Alert>
        ) : (
          <>
            {deleteError && (
              <Alert variant="danger" className="mb-3">
                {deleteError}
              </Alert>
            )}
            <Row className="g-4">
              {posts.map((post) => (
                <Col key={post._id} xs={12} sm={6} lg={3}>
                  <BlogItem
                    {...post}
                    actions={
                      <div className="d-flex gap-2">
                        <Button
                          as={Link}
                          to={`/edit/${post._id}`}
                          variant="outline-dark"
                          size="sm"
                          className="flex-fill"
                        >
                          Modifica
                        </Button>
                        {confirmDeleteId === post._id ? (
                          <>
                            <Button
                              variant="danger"
                              size="sm"
                              className="flex-fill"
                              disabled={deleteBusy}
                              onClick={() => handleDeletePost(post._id)}
                            >
                              {deleteBusy ? "Eliminazione…" : "Conferma"}
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Annulla
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="flex-fill"
                            onClick={() => setConfirmDeleteId(post._id)}
                          >
                            Elimina
                          </Button>
                        )}
                      </div>
                    }
                  />
                </Col>
              ))}
            </Row>
          </>
        )}
      </section>
    </Container>
  );
}
