import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as ProjectIcon,
  Science as DataIcon,
  AdminPanelSettings as AdminIcon,
  Verified as VerifyIcon,
  Store as MarketIcon,
  Assessment as ReportIcon,
  Notifications as NotificationIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/projects', label: 'Projects', icon: <ProjectIcon /> },
    { path: '/data-collection', label: 'Data Collection', icon: <DataIcon /> },
    { path: '/admin', label: 'Admin', icon: <AdminIcon /> },
    { path: '/verification', label: 'Verification', icon: <VerifyIcon /> },
    { path: '/marketplace', label: 'Marketplace', icon: <MarketIcon /> },
    { path: '/reports', label: 'Reports', icon: <ReportIcon /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 0,
            mr: 4,
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/dashboard')}
        >
          🌊 Blue Carbon MRV
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderRadius: 2,
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <NotificationIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Profile">
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
            >
              <AccountIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>Settings</MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
