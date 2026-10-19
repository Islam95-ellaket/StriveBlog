import React from "react";
import Avatar from "../../avatar/Avatar";
import "./styles.css";

const BlogAuthor = props => {
  const { name, surname, avatar } = props;
  return (
    <div className="blog-author">
      <Avatar name={name} surname={surname} src={avatar} size={44} />
      <div className="blog-author-text">
        <span className="blog-author-by">di</span>
        <h2 className="blog-author-name">{name}{surname ? ` ${surname}` : ""}</h2>
      </div>
    </div>
  );
};

export default BlogAuthor;
