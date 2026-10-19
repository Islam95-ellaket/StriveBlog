import React, { useEffect, useState } from "react";
import { Alert, Button, Container, Form, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "../new/styles.css";
import {
  ContentState,
  EditorState,
  convertFromHTML,
  convertToRaw,
} from "draft-js";
import draftToHtml from "draftjs-to-html";
import { ApiError, getPost, updatePost, uploadPostCover } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import ImageUploadField from "../../components/upload/ImageUploadField";

function htmlToEditorState(html) {
  if (!html) return EditorState.createEmpty();
  const { contentBlocks, entityMap } = convertFromHTML(html);
  if (!contentBlocks || contentBlocks.length === 0) {
    return EditorState.createEmpty();
  }
  return EditorState.createWithContent(
    ContentState.createFromBlockArray(contentBlocks, entityMap)
  );
}

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, initializing } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [needAuth, setNeedAuth] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [coverFile, setCoverFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusLabel, setStatusLabel] = useState("");
  const [saveError, setSaveError] = useState(null);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initializing) return;

    if (!user) {
      setPost(null);
      setLoading(false);
      setLoadError(null);
      setNeedAuth(true);
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      setLoadError(null);
      setNeedAuth(false);
      try {
        const data = await getPost(id);
        if (data?._id) {
          setPost(data);
          setTitle(data.title || "");
          setCategory(data.category || "");
          setEditorState(htmlToEditorState(data.content));
        } else {
          navigate("/404");
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          setPost(null);
          setNeedAuth(true);
        } else if (err instanceof ApiError && err.status === 404) {
          navigate("/404");
        } else {
          setLoadError(err.message || "Impossibile caricare l'articolo.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate, user, initializing]);

  if (initializing || loading) {
    return (
      <Container className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento…</span>
        </Spinner>
      </Container>
    );
  }

  if (needAuth || !user) {
    return (
      <Container style={{ maxWidth: 560 }}>
        <Alert variant="warning" className="text-center">
          <p className="mb-3">Accedi per modificare gli articoli.</p>
          <Button
            as={Link}
            to="/login"
            state={{ from: `/edit/${id}`, message: "Accedi per modificare gli articoli." }}
            className="btn-sb-dark"
          >
            Accedi
          </Button>
        </Alert>
      </Container>
    );
  }

  if (loadError) {
    return (
      <Container style={{ maxWidth: 560 }}>
        <Alert variant="danger" className="text-center">
          <p className="mb-3">{loadError}</p>
          <Button variant="outline-dark" onClick={() => navigate(0)}>
            Riprova
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!post) {
    return null;
  }

  const isOwner =
    post.author && user && String(post.author._id) === String(user._id);

  if (!isOwner) {
    return (
      <Container style={{ maxWidth: 560 }}>
        <Alert variant="warning" className="text-center">
          <p className="mb-3">Puoi modificare solo i tuoi articoli.</p>
          <Button as={Link} to={`/blog/${post._id}`} className="btn-sb-dark">
            Torna all'articolo
          </Button>
        </Alert>
      </Container>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);
    setSaved(false);

    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    const payload = { title, category, content };
    if (post.cover) payload.cover = post.cover;
    if (post.readTime) payload.readTime = post.readTime;

    try {
      setSubmitting(true);
      setStatusLabel("Salvataggio articolo…");
      await updatePost(post._id, payload);

      if (coverFile) {
        setStatusLabel("Caricamento della nuova cover…");
        try {
          await uploadPostCover(post._id, coverFile);
        } catch (coverErr) {
          setSaved(true);
          setSaveError(
            `Articolo salvato, ma la nuova cover non è stata caricata: ${
              coverErr.message || "errore sconosciuto"
            }`
          );
          return;
        }
      }

      navigate(`/blog/${post._id}`);
    } catch (err) {
      if (err instanceof ApiError && err.errors?.length > 0) {
        setSaveError(err.errors.map((x) => x.msg).join(" — "));
      } else {
        setSaveError(err.message || "Salvataggio fallito, riprova.");
      }
    } finally {
      setSubmitting(false);
      setStatusLabel("");
    }
  };

  return (
    <Container className="new-blog-container">
      <h1 className="sb-page-title h2 mb-4">Modifica articolo</h1>
      <Form onSubmit={handleSubmit}>
        {saveError && (
          <Alert variant={saved ? "warning" : "danger"}>
            {saveError}
            {saved && (
              <>
                {" "}
                <Link to={`/blog/${post._id}`}>Vai all'articolo</Link>
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
          id="blog-cover-edit"
          label="Cover"
          file={coverFile}
          onChange={setCoverFile}
          variant="cover"
          disabled={submitting}
          hint="PNG o JPG, massimo 2 MB. Se non ne selezioni una nuova, resta quella attuale."
          existingSrc={post.cover}
          existingLabel="Cover attuale"
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
          <Button
            as={Link}
            to={`/blog/${post._id}`}
            size="lg"
            variant="outline-dark"
          >
            Annulla
          </Button>
          <Button type="submit" size="lg" className="btn-sb-dark" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                {statusLabel || "Invio…"}
              </>
            ) : (
              "Salva modifiche"
            )}
          </Button>
        </Form.Group>
      </Form>
    </Container>
  );
};

export default EditPost;
