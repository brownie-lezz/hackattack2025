import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DescriptionIcon from '@mui/icons-material/Description';

const pages = [
  { title: 'Home', path: '/' },
  { title: 'About', path: '/about' },
  { title: 'Contact', path: '/contact' },
  { title: 'Resume Screening', path: '/resume-screening' },
];

const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <DescriptionIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            TALENTVERSE
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.title} onClick={handleCloseNavMenu}>
                  <Typography
                    textAlign="center"
                    component={Link}
                    to={page.path}
                    sx={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {page.title}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <DescriptionIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            TALENTVERSE
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.title}
                component={Link}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
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
    <>{user.is_employer ? employerLinks() : seekerLinks()}</>
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
