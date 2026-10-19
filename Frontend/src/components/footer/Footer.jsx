import React from "react";
import { Container } from "react-bootstrap";

const Footer = (props) => {
  return (
    <footer className="app-footer">
      <Container className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
        <span>{`${new Date().getFullYear()} - © Strive School | Developed for homework projects.`}</span>
        <span className="app-footer-note">Strive Blog</span>
      </Container>
    </footer>
  );
};

export default Footer;
