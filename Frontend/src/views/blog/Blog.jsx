import React, { useEffect, useState } from "react";
import { Alert, Button, Container, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError, deletePost, getPost } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import BlogAuthor from "../../components/blog/blog-author/BlogAuthor";
import BlogComments from "../../components/comments/BlogComments";
import BlogLike from "../../components/likes/BlogLike";

import "./styles.css";

const Blog = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needAuth, setNeedAuth] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, initializing } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (initializing) return undefined;

    if (!user) {
      setBlog(null);
      setLoading(false);
      setError(null);
      setNeedAuth(true);
      return undefined;
    }

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      setNeedAuth(false);
      try {
        const data = await getPost(id);
        if (data?._id) {
          setBlog(data);
        } else {
          navigate("/404");
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          setBlog(null);
          setNeedAuth(true);
        } else if (err instanceof ApiError && err.status === 404) {
          navigate("/404");
        } else {
          setError(err.message || "Impossibile caricare l'articolo.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    return undefined;
  }, [id, navigate, user, initializing]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento…</span>
        </Spinner>
      </Container>
    );
  }

  if (needAuth) {
    return (
      <Container style={{ maxWidth: 560 }}>
        <Alert variant="warning" className="text-center">
          <p className="mb-3">Accedi per leggere gli articoli.</p>
          <Button
            as={Link}
            to="/login"
            state={{ from: `/blog/${id}`, message: "Accedi per leggere gli articoli." }}
            className="btn-sb-dark"
          >
            Accedi
          </Button>
        </Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={{ maxWidth: 560 }}>
        <Alert variant="danger" className="text-center">
          <p className="mb-3">{error}</p>
          <Button variant="outline-dark" onClick={() => navigate(0)}>
            Riprova
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!blog) {
    return null;
  }

  const readingLabel = blog.readTime?.value
    ? `${blog.readTime.value} ${blog.readTime.unit || "min"}`
    : null;

  const metaParts = [
    blog.createdAt
      ? new Date(blog.createdAt).toLocaleDateString("it-IT", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null,
    blog.category,
    readingLabel ? `lettura da ${readingLabel}` : null,
  ].filter(Boolean);

  const isOwner =
    blog.author && user && String(blog.author._id) === String(user._id);

  const handleDelete = async () => {
    setDeleteError(null);
    setDeleteBusy(true);
    try {
      await deletePost(blog._id);
      navigate("/");
    } catch (err) {
      setDeleteError(err.message || "Cancellazione fallita, riprova.");
      setDeleteBusy(false);
    }
  };

  return (
    <article className="blog-details-root">
      <Container style={{ maxWidth: 820 }}>
        {blog.category && (
          <span className="blog-details-category">{blog.category}</span>
        )}
        <h1 className="sb-page-title blog-details-title">{blog.title}</h1>

        <div className="blog-details-container">
          {blog.author && <BlogAuthor {...blog.author} />}
          <div className="blog-details-info">
            <span>{metaParts.join(" · ")}</span>
            <BlogLike likes={blog.likes} />
          </div>
        </div>

        {isOwner && (
          <div className="blog-details-actions d-flex align-items-center gap-2 flex-wrap">
            <Button
              as={Link}
              to={`/edit/${blog._id}`}
              variant="outline-dark"
              size="sm"
            >
              Modifica articolo
            </Button>
            {!confirmDelete ? (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setConfirmDelete(true)}
              >
                Elimina articolo
              </Button>
            ) : (
              <>
                <span className="small text-muted">Eliminare definitivamente?</span>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={deleteBusy}
                  onClick={handleDelete}
                >
                  {deleteBusy ? "Eliminazione…" : "Conferma eliminazione"}
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Annulla
                </Button>
              </>
            )}
          </div>
        )}
        {deleteError && (
          <Alert variant="danger" className="py-2">
            {deleteError}
          </Alert>
        )}

        {blog.cover && (
          <img
            className="blog-details-cover"
            src={blog.cover}
            alt={`Copertina di ${blog.title}`}
          />
        )}

        <div
          className="blog-details-content"
          dangerouslySetInnerHTML={{
            __html: blog.content,
          }}
        />

        <hr className="my-5" />

        <BlogComments postId={blog._id} comments={blog.comments} />
      </Container>
    </article>
  );
};

export default Blog;
