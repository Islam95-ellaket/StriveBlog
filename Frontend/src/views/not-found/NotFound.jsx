import React from "react";
import { Button, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Container className="text-center py-5" style={{ maxWidth: 560 }}>
      <p className="display-1 fw-bold sb-text-accent mb-0">404</p>
      <h1 className="h3 sb-page-title mb-3">Pagina non trovata</h1>
      <p className="text-muted mb-4">
        La pagina che stai cercando non esiste o è stata spostata.
      </p>
      <Button as={Link} to="/" className="btn-sb-dark">
        Torna alla home
      </Button>
    </Container>
  );
}
