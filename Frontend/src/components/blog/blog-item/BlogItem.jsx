import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./styles.css";

function formatDate(createdAt) {
  if (!createdAt) return null;
  return new Date(createdAt).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const BlogItem = (props) => {
  const { title, cover, _id, category, createdAt, readTime, actions } = props;
  const date = formatDate(createdAt);
  const readingMinutes = readTime?.value ?? 0;

  const meta = [category, date, `${readingMinutes} min di lettura`]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="blog-item">
      <Link to={`/blog/${_id}`} className="blog-link">
        <Card className="blog-card h-100">
          {cover ? (
            <Card.Img variant="top" src={cover} className="blog-cover" alt={title} />
          ) : (
            <div className="blog-cover blog-cover-placeholder" aria-hidden="true">
              <span>{category || "Strive Blog"}</span>
            </div>
          )}
          <Card.Body>
            <div className="blog-card-meta">{meta}</div>
            <Card.Title as="h3" className="h5 blog-card-title">
              {title}
            </Card.Title>
          </Card.Body>
        </Card>
      </Link>
      {actions && <div className="blog-card-actions">{actions}</div>}
    </div>
  );
};

export default BlogItem;
