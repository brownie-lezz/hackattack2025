import { useContext } from "react";
import { Link } from "react-router-dom";
import logo from "./logo.png";

import AuthContext from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user } = useContext(AuthContext);

  const seekerLinks = () => (
    <ul className="navbar-nav">
      <li className="nav-item dropdown">
        <span
          className="nav-link dropdown-toggle"
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <span>
            <i className="bi bi-person-circle me-1"></i>
            Account
          </span>
        </span>
        <ul className="dropdown-menu">
          <li className="nav-item">
            <Link className="nav-link" to="/profile/seeker">
              <span>Profile</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/jobs/recommendations">
              <span>Recommendations</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/jobs/applications">
              <span>History</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/jobs/bookmarks">
              <span>Bookmarks</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/logout">
              <span>Logout</span>
            </Link>
          </li>
        </ul>
      </li>
    </ul>
  );

  const employerLinks = () => (
    <ul className="navbar-nav">
      <li className="nav-item dropdown">
        <span
          className="nav-link dropdown-toggle"
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <span>Hire</span>
        </span>
        <ul className="dropdown-menu">
          <li>
            <Link className="dropdown-item" to="/jobs/create">
              <span>Create Job</span>
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to="/jobs/employer">
              <span>Your Jobs</span>
            </Link>
          </li>
        </ul>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/profile/employer">
          <span>Profile</span>
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/logout">
          <span>Logout</span>
        </Link>
      </li>
    </ul>
  );

  const authLinks = () => (
    <>{user.role === 'employer' ? employerLinks() : seekerLinks()}</>
  );

  const publicLinks = () => (
    <ul className="navbar-nav mx-auto">
      <li className="nav-item">
        <Link className="nav-link" to="/jobs">
          <span>Jobs</span>
        </Link>
      </li>
    </ul>
  );

  const guestLinks = () => (
    <ul className="navbar-nav">
      <li className="nav-item">
        <Link className="nav-link" to="/login">
          <span>Login</span>
        </Link>
      </li>
      <li className="nav-item dropdown">
        <span
          className="nav-link dropdown-toggle"
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <span>Sign Up</span>
        </span>
        <ul className="dropdown-menu">
          <li>
            <Link className="dropdown-item" to="/signup?role=seeker">
              <span>Seeker</span>
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to="/signup?role=employer">
              <span>Employer</span>
            </Link>
          </li>
        </ul>
      </li>
    </ul>
  );

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-body-tertiary navbar-fixed fixed-top">
      <div className="container">
        <a className="navbar-brand" href="/">
          <span className="navbar-title h4">
            Talent<span className="text-danger">Verse</span>
          </span>
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          {publicLinks()}
          {user ? authLinks() : guestLinks()}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
