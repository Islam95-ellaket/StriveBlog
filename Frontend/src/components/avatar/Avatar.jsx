import React from "react";

export default function Avatar({ name, surname, src, size = 40, alt }) {
  if (src) {
    return (
      <img
        src={src}
        width={size}
        height={size}
        alt={alt ?? `Avatar di ${name || "utente"}`}
        className="sb-avatar-img rounded-circle"
        style={{ width: size, height: size }}
      />
    );
  }

  const initials = `${(name || "?").charAt(0)}${(surname || "").charAt(0)}`
    .toUpperCase()
    .trim() || "?";

  return (
    <span
      className="sb-avatar-fallback"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      role="img"
      aria-label={alt ?? `Avatar di ${name || "utente"}`}
    >
      {initials}
    </span>
  );
}
