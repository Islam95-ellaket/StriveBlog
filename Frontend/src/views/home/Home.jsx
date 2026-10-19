import React from "react";
import { Container } from "react-bootstrap";
import BlogList from "../../components/blog/blog-list/BlogList";
import "./styles.css";

const Home = props => {
  return (
    <Container>
      <header className="home-hero">
        <h1 className="sb-page-title home-hero-title">
          Benvenuto sullo <span className="home-hero-accent">Strive Blog</span>
        </h1>
        <p className="home-hero-subtitle">
          Storie, idee e approfondimenti dalla community degli studenti.
        </p>
      </header>
      <BlogList />
    </Container>
  );
};

export default Home;
