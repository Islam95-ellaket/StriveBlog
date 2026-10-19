import React from "react";
import { AiOutlineLike } from "react-icons/ai";
import { Badge } from "react-bootstrap";

export default function BlogLike({ likes = [] }) {
  const count = Array.isArray(likes) ? likes.length : 0;
  return (
    <Badge bg="light" text="dark" className="border">
      <AiOutlineLike aria-hidden /> {count} {count === 1 ? "like" : "like"}
    </Badge>
  );
}
