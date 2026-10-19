import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ApiError, getPosts } from "../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import BlogItem from "../blog-item/BlogItem";

const BlogList = () => {
  const { user, initializing } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needAuth, setNeedAuth] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNeedAuth(false);
    try {
      const data = await getPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setPosts([]);
        setNeedAuth(true);
      } else {
        setError(err.message || "Impossibile caricare gli articoli.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initializing) return;
    if (!user) {
      setPosts([]);
      setLoading(false);
      setError(null);
      setNeedAuth(true);
      return;
    }
    loadPosts();
  }, [user, initializing, loadPosts]);

  if (needAuth) {
    return (
      <Alert variant="warning" className="mt-4">
        Accedi per vedere gli articoli.{" "}
        <Button
          as={Link}
          to="/login"
          state={{ from: "/", message: "Accedi per vedere gli articoli." }}
          variant="outline-dark"
          size="sm"
          className="ms-2"
        >
          Accedi
        </Button>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Container className="d-flex justify-content-center" style={{ marginTop: 100 }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento…</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-4">
        {error}{" "}
        <Button variant="outline-dark" size="sm" className="ms-2" onClick={loadPosts}>
          Riprova
        </Button>
      </Alert>
    );
  }

  if (posts.length === 0) {
    return (
      <Alert variant="light" className="mt-4 text-center border">
        Nessun articolo pubblicato.{" "}
        <Link to="/new">Scrivi il primo articolo!</Link>
      </Alert>
    );
  }

  return (
    <Row className="g-4">
      {posts.map((post) => (
        <Col key={post._id} xs={12} sm={6} lg={3}>
          <BlogItem {...post} />
        </Col>
      ))}
    </Row>
  );
};

export default BlogList;
