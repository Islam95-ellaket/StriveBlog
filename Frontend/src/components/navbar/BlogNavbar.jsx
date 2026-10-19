import React from "react";
import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import Avatar from "../avatar/Avatar";
import logo from "../../assets/logo.png";
import "./styles.css";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Navbar expand="lg" className="blog-navbar" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img className="blog-navbar-brand" alt="Strive Blog — home" src={logo} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="blog-navbar-nav" aria-label="Apri il menu di navigazione" />
        <Navbar.Collapse id="blog-navbar-nav">
          <Nav className="ms-auto align-items-lg-center gap-2 gap-lg-3 py-3 py-lg-0">
            {user && (
              <Button
                as={Link}
                to="/new"
                className="blog-navbar-add-button btn-sb-dark"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-plus-lg"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 0 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z" />
                </svg>
                Nuovo Articolo
              </Button>
            )}
            {user ? (
              <NavDropdown
                id="blog-user-dropdown"
                align="end"
                title={
                  <span className="d-inline-flex align-items-center gap-2">
                    <Avatar name={user.name} surname={user.surname} src={user.avatar} size={30} alt="" />
                    <span className="blog-navbar-username">{user.name}</span>
                  </span>
                }
              >
                <NavDropdown.Item as={Link} to="/profile">
                  Il mio profilo
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Esci</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Button as={Link} to="/login" variant="outline-dark">
                Accedi
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
