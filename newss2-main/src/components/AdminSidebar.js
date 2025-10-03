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
  Badge,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  VerifiedUser as VerifiedIcon,
  Analytics as AnalyticsIcon,
  Map as MapIcon,
} from '@mui/icons-material';

const SIDEBAR_WIDTH = 280;

const AdminSidebar = ({ open, onClose, pendingCount = 0 }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const adminActions = [
    {
      title: 'Dashboard',
      description: 'Admin overview & statistics',
      icon: <DashboardIcon />,
      path: '/admin/dashboard',
      color: theme.palette.primary.main,
    },
    {
      title: 'Project Reviews',
      description: 'Review & approve projects',
      icon: <VerifiedIcon />,
      path: '/admin/reviews',
      color: theme.palette.secondary.main,
      badge: pendingCount,
    },
    {
      title: 'Analyses',
      description: 'System analytics & reports',
      icon: <AnalyticsIcon />,
      path: '/admin/analytics',
      color: theme.palette.info.main,
    },
    {
      title: 'Location Map',
      description: 'Geographic project overview',
      icon: <MapIcon />,
      path: '/admin/map',
      color: theme.palette.success.main,
    },
  ];

  const handleNavigation = (action) => {
    navigate(action.path);
    if (onClose) onClose();
  };

  const isActive = (path) => {
    return location.pathname === path || 
           (path === '/admin/dashboard' && location.pathname === '/admin/dashboard');
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
          backgroundColor: theme.palette.background.sidebar,
          color: theme.palette.text.sidebar,
          border: 'none',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', height: '100%' }}>
        {/* Header */}
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              mx: 'auto',
              mb: 2,
              backgroundColor: theme.palette.secondary.main,
              fontSize: '1.5rem',
            }}
          >
            🏛️
          </Avatar>
          <Typography variant="h6" fontWeight={600} color="inherit">
            NCCR Admin
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.sidebarSecondary, mt: 0.5 }}>
            National Centre for Coastal Research
          </Typography>
        </Box>

        <Divider sx={{ borderColor: alpha('#FFFFFF', 0.12) }} />

        {/* Admin Actions */}
        <Box sx={{ p: 2 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              px: 2, 
              py: 1, 
              color: theme.palette.text.sidebarSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            Admin Controls
          </Typography>
          
          <List sx={{ pt: 0 }}>
            {adminActions.map((action, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(action)}
                  sx={{
                    borderRadius: '12px',
                    mx: 1,
                    minHeight: 56,
                    backgroundColor: isActive(action.path) 
                      ? alpha(theme.palette.primary.main, 0.15)
                      : 'transparent',
                    border: isActive(action.path) 
                      ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                      : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: alpha('#FFFFFF', 0.08),
                      transform: 'translateX(4px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    <Badge 
                      badgeContent={action.badge || 0} 
                      color="error" 
                      invisible={!action.badge}
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.75rem',
                          height: 18,
                          minWidth: 18,
                        }
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          backgroundColor: isActive(action.path) 
                            ? action.color 
                            : alpha(action.color, 0.2),
                          color: isActive(action.path) ? '#FFFFFF' : action.color,
                          fontSize: '1rem',
                        }}
                      >
                        {action.icon}
                      </Avatar>
                    </Badge>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={isActive(action.path) ? 600 : 500}>
                        {action.title}
                      </Typography>
                    }
                    secondary={
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: theme.palette.text.sidebarSecondary,
                          fontSize: '0.75rem',
                        }}
                      >
                        {action.description}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* System Health */}
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Divider sx={{ borderColor: alpha('#FFFFFF', 0.12), mb: 2 }} />
          
          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              🔧 System Health
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.sidebarSecondary }}>
              All verification services online
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.success.main,
                  }}
                />
                <Typography variant="caption" sx={{ color: theme.palette.text.sidebarSecondary }}>
                  AI Verification Active
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.success.main,
                  }}
                />
                <Typography variant="caption" sx={{ color: theme.palette.text.sidebarSecondary }}>
                  Backend Services Online
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AdminSidebar;
export { SIDEBAR_WIDTH };