import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { API_URL, ApiError, uploadAuthorAvatar } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import ImageUploadField from "../../components/upload/ImageUploadField";

export default function Login() {
  const { user, login, register, loginWithToken, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    dob: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarWarning, setAvatarWarning] = useState(null);

  const [blockRedirect, setBlockRedirect] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const from = location.state?.from || "/";
  const notice = location.state?.message;

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;
    setGoogleLoading(true);
    loginWithToken(token)
      .then(() => navigate(from, { replace: true }))
      .catch(() => {
        setError("Il link di accesso non è valido o è scaduto: riprova.");
        setSearchParams({}, { replace: true });
      })
      .finally(() => setGoogleLoading(false));
  }, [searchParams, loginWithToken, navigate, from, setSearchParams]);

  useEffect(() => {
    if (user && !blockRedirect) navigate(from, { replace: true });
  }, [user, navigate, from, blockRedirect]);

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setAvatarWarning(null);
    setSubmitting(true);
    try {
      if (tab === "login") {
        await login(form.email, form.password);
      } else {
        const payload = {
          name: form.name,
          surname: form.surname,
          email: form.email,
          password: form.password,
        };
        if (form.dob) payload.dob = form.dob;

        if (avatarFile) setBlockRedirect(true);
        const me = await register(payload);
        if (avatarFile) {
          try {
            await uploadAuthorAvatar(me._id, avatarFile);
            await refreshUser();
          } catch (avatarErr) {
            setAvatarWarning(
              `Account creato, ma l'avatar non è stato caricato (${
                avatarErr.message || "errore sconosciuto"
              }). Potrai cambiarlo in seguito dal tuo profilo.`
            );
            return;
          }
        }
      }
      navigate(from, { replace: true });
    } catch (err) {
      setBlockRedirect(false);
      if (err instanceof ApiError && Array.isArray(err.errors) && err.errors.length > 0) {
        setError(err.errors.map((e) => e.msg).join(" — "));
      } else {
        setError(err.message || "Qualcosa è andato storto, riprova.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (googleLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" />
        <p className="mt-3">Accesso in corso…</p>
      </Container>
    );
  }

  return (
    <Container style={{ maxWidth: 480 }}>
      <Card className="sb-card border-0">
        <Card.Body className="p-4 p-md-5">
          <h1 className="h3 mb-4 text-center sb-page-title">Strive Blog</h1>

          {notice && <Alert variant="info">{notice}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          {avatarWarning && (
            <Alert variant="warning">
              <p className="mb-3">{avatarWarning}</p>
              <Button
                variant="outline-dark"
                size="sm"
                onClick={() => navigate(from, { replace: true })}
              >
                Continua senza avatar
              </Button>
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {tab === "register" && (
              <Row className="g-3">
                <Col sm={6}>
                  <Form.Group controlId="register-name">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                      value={form.name}
                      onChange={updateField("name")}
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group controlId="register-surname">
                    <Form.Label>Cognome</Form.Label>
                    <Form.Control
                      value={form.surname}
                      onChange={updateField("surname")}
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            <Form.Group controlId="login-email" className="mt-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={updateField("email")}
                required
              />
            </Form.Group>

            {tab === "register" && (
              <Form.Group controlId="register-dob" className="mt-3">
                <Form.Label>Data di nascita (facoltativa)</Form.Label>
                <Form.Control
                  type="date"
                  value={form.dob}
                  onChange={updateField("dob")}
                />
              </Form.Group>
            )}

            <Form.Group controlId="login-password" className="mt-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={form.password}
                onChange={updateField("password")}
                required
                minLength={tab === "register" ? 8 : undefined}
              />
              {tab === "register" && (
                <Form.Text className="text-muted">
                  Almeno 8 caratteri.
                </Form.Text>
              )}
            </Form.Group>

            {tab === "register" && (
              <ImageUploadField
                id="register-avatar"
                label="Avatar (facoltativo)"
                variant="avatar"
                file={avatarFile}
                onChange={setAvatarFile}
                disabled={submitting}
                hint="PNG o JPG, massimo 2 MB."
              />
            )}

            <Button type="submit" className="btn-sb-dark w-100 mt-4" disabled={submitting}>
              {submitting
                ? "Attendere…"
                : tab === "login"
                  ? "Accedi"
                  : "Crea account"}
            </Button>
          </Form>

          <div className="d-flex align-items-center my-4">
            <hr className="flex-grow-1" />
            <span className="px-2 text-muted small">oppure</span>
            <hr className="flex-grow-1" />
          </div>

          <a
            className="btn btn-outline-primary w-100"
            href={`${API_URL}/auth/google`}
          >
            Accedi con Google
          </a>

          <div className="text-center mt-4">
            {tab === "login" ? (
              <span>
                Non hai un account?{" "}
                <Button variant="link" className="p-0" onClick={() => setTab("register")}>
                  Registrati
                </Button>
              </span>
            ) : (
              <span>
                Hai già un account?{" "}
                <Button variant="link" className="p-0" onClick={() => setTab("login")}>
                  Accedi
                </Button>
              </span>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
