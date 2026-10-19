import React, { useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import Avatar from "../avatar/Avatar";

export const IMAGE_ACCEPT = "image/png,image/jpeg";
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;

export function validateImageFile(file) {
  if (!file) return null;
  const okTypes = ["image/png", "image/jpeg"];
  if (!okTypes.includes(file.type)) {
    return "Formato non supportato: usa PNG o JPG/JPEG.";
  }
  if (file.size > IMAGE_MAX_BYTES) {
    const mb = (IMAGE_MAX_BYTES / (1024 * 1024)).toFixed(0);
    return `Immagine troppo grande: massimo ${mb} MB.`;
  }
  return null;
}

export default function ImageUploadField({
  id,
  label,
  file,
  onChange,
  variant = "cover",
  disabled = false,
  hint,
  existingSrc = null,
  existingLabel = "Immagine attuale",
}) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = (e) => {
    const selected = e.target.files?.[0] || null;
    const validationError = validateImageFile(selected);
    setError(validationError);
    onChange(validationError ? null : selected);
  };

  const handleRemove = () => {
    setError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  };

  return (
    <Form.Group controlId={id} className="mt-3">
      {label && <Form.Label className="fw-semibold">{label}</Form.Label>}

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        onChange={handleFile}
        disabled={disabled}
        className="d-none"
        aria-describedby={hint ? `${id}-hint` : undefined}
      />

      {previewUrl ? (
        <div className={`sb-upload-preview sb-upload-preview-${variant}`}>
          {variant === "avatar" ? (
            <Avatar src={previewUrl} size={120} alt="Anteprima avatar selezionato" />
          ) : (
            <img
              src={previewUrl}
              alt="Anteprima della cover selezionata"
              className="sb-upload-preview-image"
            />
          )}
          <div className="d-flex gap-2 mt-3 justify-content-center flex-wrap">
            <Button
              variant="outline-dark"
              size="sm"
              onClick={openPicker}
              disabled={disabled}
            >
              Sostituisci
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
            >
              Rimuovi
            </Button>
          </div>
        </div>
      ) : existingSrc ? (

        <div className={`sb-upload-preview sb-upload-preview-${variant}`}>
          {variant === "avatar" ? (
            <Avatar src={existingSrc} size={120} alt={existingLabel} />
          ) : (
            <img
              src={existingSrc}
              alt={existingLabel}
              className="sb-upload-preview-image"
            />
          )}
          <div className="small text-muted mt-2">{existingLabel}</div>
          <div className="d-flex gap-2 mt-2 justify-content-center">
            <Button
              variant="outline-dark"
              size="sm"
              onClick={openPicker}
              disabled={disabled}
            >
              Sostituisci
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`sb-upload-zone ${error ? "is-invalid" : ""}`}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={openPicker}
          onKeyDown={handleKeyDown}
          aria-label={label || "Seleziona un'immagine dal computer"}
          aria-disabled={disabled}
        >
          <div className="fs-2" aria-hidden="true">🖼️</div>
          <div className="fw-semibold mt-1">Seleziona un'immagine dal computer</div>
          {hint && (
            <div id={`${id}-hint`} className="sb-upload-hint mt-1">
              {hint}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-danger small mt-2" role="alert">
          {error}
        </div>
      )}
    </Form.Group>
  );
}
