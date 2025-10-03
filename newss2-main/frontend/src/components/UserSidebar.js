import React from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Typography,
  Divider,
  Avatar,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Add as AddIcon,
  PhotoCamera as PhotoIcon,
  Store as MarketIcon,
  AccountBalance as ProjectIcon,
  Payment as PaymentIcon,
  Assessment as ReportsIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const SIDEBAR_WIDTH = 280;

const UserSidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const quickActions = [
    {
      title: 'Dashboard',
      description: 'Overview and statistics',
      icon: <DashboardIcon />,
      path: '/dashboard',
      color: theme.palette.primary.main,
    },
    {
      title: 'Create Project',
      description: 'Start new blue carbon project',
      icon: <AddIcon />,
      path: '/projects/create',
      color: theme.palette.secondary.main,
    },
    {
      title: 'Data Collection',
      description: 'Field data and measurements',
      icon: <PhotoIcon />,
      path: '/data-collection',
      color: theme.palette.warning.main,
    },
    {
      title: 'Marketplace',
      description: 'Trade carbon credits',
      icon: <MarketIcon />,
      path: '/marketplace',
      color: '#FF6B35',
    },
    {
      title: 'Carbon Credits',
      description: 'Manage tokenized credits',
      icon: <ProjectIcon />,
      path: '/carbon-credits',
      color: '#7C3AED',
    },
    {
      title: 'Payments',
      description: 'Transfer blockchain credits',
      icon: <PaymentIcon />,
      path: '/payments',
      color: theme.palette.success.main,
    },
    {
      title: 'Reports',
      description: 'Analytics and insights',
      icon: <ReportsIcon />,
      path: '/reports',
      color: '#DC2626',
    },
  ];

  const handleNavigation = (action) => {
    if (action.external) {
      window.open(action.url, '_blank');
    } else {
      navigate(action.path);
    }
    if (onClose) onClose();
  };

  const isActive = (path) => {
    return location.pathname === path || 
           (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard'));
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#0F0F1A',
          background: 'linear-gradient(180deg, #1C1C28 0%, #0F0F1A 100%)',
          color: '#FFFFFF',
          border: 'none',
          borderRight: '1px solid rgba(138, 43, 226, 0.2)',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)',
          overflowY: 'auto',
        },
      }}
    >
      <Box>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(74, 144, 226, 0.15) 100%)',
          borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
        }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              mx: 'auto',
              mb: 2,
              background: 'linear-gradient(135deg, #4A90E2 0%, #8A2BE2 100%)',
              fontSize: '1.8rem',
              boxShadow: '0 8px 25px rgba(138, 43, 226, 0.4)',
            }}
          >
            🌊
          </Avatar>
          <Typography 
            variant="h6" 
            fontWeight={700} 
            sx={{
              background: 'linear-gradient(135deg, #4A90E2 0%, #8A2BE2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 0.5,
            }}
          >
            Blue Carbon MRV
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.9rem',
            }}
          >
            Community Dashboard
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(138, 43, 226, 0.2)' }} />

        {/* Quick Actions */}
        <Box sx={{ p: 2 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              px: 2, 
              py: 1, 
              color: 'rgba(255, 255, 255, 0.6)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '0.75rem',
              fontWeight: 600,
              mb: 2,
            }}
          >
            Quick Actions
          </Typography>
          
          <List sx={{ pt: 0 }}>
            {quickActions.map((action, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(action)}
                  sx={{
                    borderRadius: '12px',
                    mx: 1,
                    minHeight: 64,
                    backgroundColor: isActive(action.path) 
                      ? 'rgba(138, 43, 226, 0.2)'
                      : 'transparent',
                    border: isActive(action.path) 
                      ? '1px solid rgba(138, 43, 226, 0.3)'
                      : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(138, 43, 226, 0.15)',
                      border: '1px solid rgba(138, 43, 226, 0.2)',
                      transform: 'translateX(6px)',
                      boxShadow: '0 4px 20px rgba(138, 43, 226, 0.3)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        background: isActive(action.path) 
                          ? `linear-gradient(135deg, ${action.color} 0%, #8A2BE2 100%)`
                          : `linear-gradient(135deg, ${alpha(action.color, 0.2)} 0%, rgba(138, 43, 226, 0.1) 100%)`,
                        color: isActive(action.path) ? '#FFFFFF' : action.color,
                        fontSize: '1.1rem',
                        boxShadow: isActive(action.path) ? '0 4px 15px rgba(138, 43, 226, 0.4)' : 'none',
                      }}
                    >
                      {action.icon}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={isActive(action.path) ? 700 : 500}
                        sx={{ color: '#FFFFFF', fontSize: '0.95rem' }}
                      >
                        {action.title}
                      </Typography>
                    }
                    secondary={
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.8rem',
                        }}
                      >
                        {action.description}
                      </Typography>
                    }
                  />
                  {action.external && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.success.main,
                        ml: 1,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Status Section */}
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(138, 43, 226, 0.2)',
        }}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(74, 144, 226, 0.1) 100%)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              boxShadow: '0 4px 15px rgba(52, 211, 153, 0.2)',
            }}
          >
            <Typography 
              variant="subtitle2" 
              fontWeight={700} 
              sx={{ 
                mb: 1,
                color: '#FFFFFF',
                fontSize: '0.9rem',
              }}
            >
              🔗 System Status
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.8rem',
              }}
            >
              All services operational
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5, gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#34D399',
                  boxShadow: '0 0 8px rgba(52, 211, 153, 0.6)',
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                }}
              >
                Backend Connected
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default UserSidebar;
export { SIDEBAR_WIDTH };