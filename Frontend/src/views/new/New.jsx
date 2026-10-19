import React, { useState } from "react";
import { Alert, Button, Container, Form, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./styles.css";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { ApiError, createPost, uploadPostCover } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import ImageUploadField from "../../components/upload/ImageUploadField";

const NewBlogPost = () => {
  const { user, initializing } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [coverFile, setCoverFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusLabel, setStatusLabel] = useState("");
  const [error, setError] = useState(null);

  const [createdPostId, setCreatedPostId] = useState(null);
  const navigate = useNavigate();

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
          <p className="mb-3">Accedi per pubblicare un nuovo articolo.</p>
          <Button
            as={Link}
            to="/login"
            state={{ from: "/new", message: "Accedi per pubblicare un nuovo articolo." }}
            className="btn-sb-dark"
          >
            Accedi
          </Button>
        </Alert>
      </Container>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCreatedPostId(null);

    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    try {
      setSubmitting(true);
      setStatusLabel("Pubblicazione articolo…");
      const newPost = await createPost({
        title,
        category,
        content,
        readTime: { value: 0, unit: "minutes" },
      });

      if (coverFile && newPost?._id) {
        setStatusLabel("Caricamento della cover…");
        try {
          await uploadPostCover(newPost._id, coverFile);
        } catch (coverErr) {
          setCreatedPostId(newPost._id);
          setError(
            `Articolo pubblicato, ma la cover non è stata caricata: ${
              coverErr.message || "errore sconosciuto"
            }`
          );
          return;
        }
      }

      navigate(`/blog/${newPost._id}`);
    } catch (err) {
      if (err instanceof ApiError && err.errors?.length > 0) {
        setError(err.errors.map((e) => e.msg).join(" — "));
      } else {
        setError(err.message || "Invio fallito, riprova.");
      }
    } finally {
      setSubmitting(false);
      setStatusLabel("");
    }
  };

  const handleReset = () => {
    setTitle("");
    setCategory("");
    setEditorState(EditorState.createEmpty());
    setCoverFile(null);
    setError(null);
    setCreatedPostId(null);
  };

  return (
    <Container className="new-blog-container">
      <h1 className="sb-page-title h2 mb-4">Nuovo articolo</h1>
      <Form onSubmit={handleSubmit}>
        {error && (
          <Alert variant="danger">
            {error}
            {createdPostId && (
              <>
                {" "}
                <Link to={`/blog/${createdPostId}`}>Vai all'articolo</Link>
              </>
            )}
          </Alert>
        )}

        <Form.Group controlId="blog-title" className="mt-3">
          <Form.Label className="fw-semibold">Titolo</Form.Label>
          <Form.Control
            size="lg"
            placeholder="Titolo dell'articolo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={2}
            maxLength={100}
          />
        </Form.Group>

        <Form.Group controlId="blog-category" className="mt-3">
          <Form.Label className="fw-semibold">Categoria</Form.Label>
          <Form.Select
            size="lg"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Seleziona una categoria</option>
            <option value="Tech">Tech</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Cucina">Cucina</option>
            <option value="Sport">Sport</option>
            <option value="Viaggi">Viaggi</option>
          </Form.Select>
        </Form.Group>

        <ImageUploadField
          id="blog-cover"
          label="Cover (facoltativa)"
          file={coverFile}
          onChange={setCoverFile}
          variant="cover"
          disabled={submitting}
          hint="PNG o JPG, massimo 2 MB."
        />

        <Form.Group controlId="blog-content" className="mt-4">
          <Form.Label className="fw-semibold">Contenuto</Form.Label>
          <Editor
            editorState={editorState}
            onEditorStateChange={setEditorState}
            wrapperClassName="new-blog-editor-wrapper"
            editorClassName="new-blog-editor"
            toolbarClassName="new-blog-toolbar"
          />
        </Form.Group>

        <Form.Group className="d-flex mt-4 justify-content-end gap-3">
          <Button type="reset" size="lg" variant="outline-dark" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit" size="lg" className="btn-sb-dark" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                {statusLabel || "Invio…"}
              </>
            ) : (
              "Pubblica"
            )}
          </Button>
        </Form.Group>
      </Form>
    </Container>
  );
};

export default NewBlogPost;
