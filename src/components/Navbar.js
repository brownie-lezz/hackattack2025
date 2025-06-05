import React, { useState, useContext } from 'react';
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
import logo from "./logo.png";
import AuthContext from "../context/AuthContext";
import "./Navbar.css";

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
  const { user } = useContext(AuthContext);

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

  // User role-based links
  const seekerLinks = () => (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button component={Link} to="/profile/seeker" color="inherit">Profile</Button>
      <Button component={Link} to="/jobs/recommendations" color="inherit">Recommendations</Button>
      <Button component={Link} to="/jobs/applications" color="inherit">History</Button>
      <Button component={Link} to="/jobs/bookmarks" color="inherit">Bookmarks</Button>
      <Button component={Link} to="/logout" color="inherit">Logout</Button>
    </Box>
  );

  const employerLinks = () => (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button component={Link} to="/jobs/create" color="inherit">Create Job</Button>
      <Button component={Link} to="/jobs/employer" color="inherit">Your Jobs</Button>
      <Button component={Link} to="/profile/employer" color="inherit">Profile</Button>
      <Button component={Link} to="/logout" color="inherit">Logout</Button>
    </Box>
  );

  const guestLinks = () => (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button component={Link} to="/login" color="inherit">Login</Button>
      <Button component={Link} to="/signup?role=seeker" color="inherit">Sign Up as Seeker</Button>
      <Button component={Link} to="/signup?role=employer" color="inherit">Sign Up as Employer</Button>
    </Box>
  );

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
            {user ? (
              user.is_employer ? employerLinks() : seekerLinks()
            ) : (
              guestLinks()
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
