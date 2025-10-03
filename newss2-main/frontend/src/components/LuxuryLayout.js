import React, { useState, useEffect } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  Divider,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';
import UserSidebar, { SIDEBAR_WIDTH } from './UserSidebar';
import AdminSidebar from './AdminSidebar';

const LuxuryLayout = ({ children, isAdmin = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Get user info from localStorage
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }

    // Fetch pending count for admin
    if (isAdmin) {
      fetchPendingCount();
    }
  }, [isAdmin]);

  const fetchPendingCount = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/admin/dashboard');
      const data = await response.json();
      setPendingCount(data.statistics?.pending_review || 0);
    } catch (error) {
      console.warn('Could not fetch pending count:', error);
    }
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('auth_token');
    navigate('/login');
    handleProfileClose();
  };

  const getUserTypeColor = () => {
    return isAdmin ? theme.palette.secondary.main : theme.palette.primary.main;
  };

  const getUserTypeLabel = () => {
    return isAdmin ? 'NCCR Admin' : 'Community User';
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#0F0F1A',
      background: 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 50%, #16213E 100%)',
      // Completely remove scrollbars globally
      '& *': {
        '&::-webkit-scrollbar': { display: 'none !important' },
        scrollbarWidth: 'none !important',
        msOverflowStyle: 'none !important',
      },
      overflow: 'hidden',
    }}>
      {/* Sidebar */}
      {isAdmin ? (
        <AdminSidebar pendingCount={pendingCount} />
      ) : (
        <UserSidebar />
      )}

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top AppBar */}
        <AppBar 
          position="fixed" 
          sx={{ 
            width: `calc(100% - ${SIDEBAR_WIDTH}px)`, 
            ml: `${SIDEBAR_WIDTH}px`,
            backgroundColor: 'rgba(15, 15, 26, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            color: '#FFFFFF',
            borderBottom: '1px solid rgba(138, 43, 226, 0.3)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#FFFFFF' }}>
                {isAdmin ? '🏛️ Admin Console' : '🌊 Blue Carbon Dashboard'}
              </Typography>
              <Chip
                label={getUserTypeLabel()}
                size="small"
                sx={{
                  backgroundColor: alpha(getUserTypeColor(), 0.2),
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: `1px solid ${alpha(getUserTypeColor(), 0.3)}`,
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton color="inherit">
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>

              {/* User Profile */}
              <Tooltip title="Account">
                <IconButton onClick={handleProfileClick} color="inherit">
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      backgroundColor: getUserTypeColor(),
                      fontSize: '0.875rem',
                    }}
                  >
                    {isAdmin ? '🏛️' : <PersonIcon />}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              minWidth: 200,
              mt: 1,
            }
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {userInfo?.name || 'User'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {userInfo?.email || 'No email'}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleProfileClose}>
            <AccountIcon sx={{ mr: 2, fontSize: '1.25rem' }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleProfileClose}>
            <SettingsIcon sx={{ mr: 2, fontSize: '1.25rem' }} />
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
            <LogoutIcon sx={{ mr: 2, fontSize: '1.25rem' }} />
            Logout
          </MenuItem>
        </Menu>

        {/* Content Area */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3,
            mt: 8, // Account for AppBar height
            backgroundColor: 'transparent',
            minHeight: 'calc(100vh - 64px)',
            maxHeight: 'calc(100vh - 64px)',
            overflowY: 'auto',
            // Style scrollbars for main content
            '&::-webkit-scrollbar': { 
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(138, 43, 226, 0.4)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(138, 43, 226, 0.6)',
              },
            },
          }}
        >
          <Box
            sx={{
              maxWidth: 'xl',
              mx: 'auto',
              width: '100%',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LuxuryLayout;