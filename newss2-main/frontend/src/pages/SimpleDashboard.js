import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Nature as EcoIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PhotoCamera as PhotoIcon,
  LocationOn as LocationIcon,
  Store as MarketIcon,
  AccountBalance as ProjectIcon,
  Verified as VerifiedIcon,
  Payment as PaymentIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';

const SimpleDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    stats: {
      totalProjects: 0,
      pendingReview: 0,
      approved: 0,
      carbonCredits: 0
    }
  });

  useEffect(() => {
    // Get user info from localStorage
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/projects');
      const data = await response.json();
      
      // Fetch detailed status for each project
      const projectsWithStatus = await Promise.all(
        (data.projects || []).map(async (project) => {
          try {
            const statusResponse = await fetch(`http://localhost:8002/api/projects/${project.id}/verification-status`);
            const statusData = await statusResponse.json();
            return {
              ...project,
              verification_status: statusData.success ? statusData.verification_status : null
            };
          } catch (error) {
            console.warn(`Could not load status for project ${project.id}`);
            return project;
          }
        })
      );
      
      setDashboardData({
        projects: projectsWithStatus,
        stats: {
          totalProjects: projectsWithStatus.length,
          pendingReview: projectsWithStatus.filter(p => p.status === 'pending_verification' || p.status === 'requires_review').length,
          approved: projectsWithStatus.filter(p => p.status === 'approved').length,
          carbonCredits: projectsWithStatus.reduce((sum, p) => sum + (p.carbon_credits || 0), 0),
          thirdPartyVerified: projectsWithStatus.filter(p => p.verification_status?.verification_stages?.third_party_verification?.completed).length,
          blockchainRegistered: projectsWithStatus.filter(p => p.verification_status?.verification_stages?.blockchain_registration?.completed).length
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const quickActions = [
    {
      title: 'Create New Project',
      description: 'Start a new blue carbon restoration project',
      icon: <AddIcon />,
      color: theme.palette.primary.main,
      action: () => navigate('/projects/create')
    },
    {
      title: 'Data Collection',
      description: 'Collect field data and measurements',
      icon: <PhotoIcon />,
      color: theme.palette.success.main,
      action: () => navigate('/data-collection')
    },
    {
      title: 'Marketplace',
      description: 'Trade carbon credits',
      icon: <MarketIcon />,
      color: theme.palette.warning.main,
      action: () => navigate('/marketplace')
    },
    {
      title: 'Carbon Credits',
      description: 'Manage tokenized carbon credits',
      icon: <VerifiedIcon />,
      color: theme.palette.info.main,
      action: () => navigate('/carbon-credits')
    },
    {
      title: 'Payments',
      description: 'Transfer blockchain carbon credits',
      icon: <PaymentIcon />,
      color: theme.palette.success.main,
      action: () => navigate('/payments')
    },
    {
      title: 'Reports',
      description: 'View detailed analytics and reports',
      icon: <LocationIcon />,
      color: theme.palette.success.main,
      action: () => navigate('/reports')
    }
  ];  const recentActivities = [
    {
      title: 'NGO Verification System Launched',
      description: '3rd party verification portal now available for organizations',
      time: '1 hour ago',
      icon: <VerifiedIcon color="primary" />
    },
    {
      title: 'Project Status Tracker Active',
      description: 'Real-time verification pipeline tracking now available',
      time: '2 hours ago',
      icon: <CheckCircleIcon color="success" />
    },
    {
      title: 'Blockchain Integration Live',
      description: 'Live project registration on Polygon Amoy testnet operational',
      time: '3 hours ago',
      icon: <LocationIcon color="info" />
    },
    {
      title: 'AI Verification Enhanced',
      description: 'Enhanced AI verification with fraud detection active',
      time: '4 hours ago',
      icon: <VerifiedIcon color="secondary" />
    }
  ];

  return (
    <Box 
      sx={{ 
        backgroundColor: '#1C1C28',
        minHeight: '100vh',
        color: '#FFFFFF',
        p: 3,
        '& *': { color: '#FFFFFF !important' },
        '& .MuiPaper-root': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#FFFFFF',
        },
        '& .MuiCard-root': {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(74, 144, 226, 0.3)',
          },
        },
        '& .MuiTypography-root': { color: '#FFFFFF !important' },
        '& .MuiChip-root': {
          backgroundColor: 'rgba(74, 144, 226, 0.2)',
          color: '#FFFFFF',
          border: '1px solid rgba(74, 144, 226, 0.3)',
        },
        '& .MuiAlert-root': {
          backgroundColor: 'rgba(52, 211, 153, 0.1)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          color: '#FFFFFF',
        },
        // Remove scrollbars
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        overflow: 'auto',
      }}
    >
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #4A90E2 0%, #9333EA 50%, #34D399 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Welcome to Blue Carbon MRV
            </Typography>
            <Typography variant="h6" sx={{ color: '#B3B3B3 !important', mb: 1 }}>
              {userInfo ? `Hello, ${userInfo.email}` : 'Community Dashboard'}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#888888 !important' }}>
              Monitor, Report, and Verify your coastal ecosystem restoration projects
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* System Status Alert */}
      <Alert 
        severity="success" 
        sx={{ 
          mb: 4, 
          borderRadius: '12px',
          backgroundColor: 'rgba(52, 211, 153, 0.15)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          color: '#FFFFFF !important',
          backdropFilter: 'blur(10px)',
          '& .MuiAlert-icon': {
            fontSize: '1.5rem',
            color: '#34D399 !important',
          },
          '& .MuiAlert-message': {
            color: '#FFFFFF !important',
          },
        }}
      >
        🔗 System Status: All services operational | Backend: Connected | AI Verification: Active
      </Alert>

      {/* Enhanced Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.15) 0%, rgba(74, 144, 226, 0.25) 100%)',
              border: '1px solid rgba(74, 144, 226, 0.3)',
              backdropFilter: 'blur(15px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(74, 144, 226, 0.2)',
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(74, 144, 226, 0.4)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: '#4A90E2', 
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 15px rgba(74, 144, 226, 0.4)',
                  }}
                >
                  <ProjectIcon />
                </Avatar>
                <Box>
                  <Typography sx={{ color: '#B3B3B3 !important' }} gutterBottom variant="subtitle2">
                    Total Projects
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#FFFFFF !important' }}>
                    {dashboardData.stats.totalProjects}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.25) 100%)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              backdropFilter: 'blur(15px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 152, 0, 0.2)',
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(255, 152, 0, 0.4)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: '#FF9800', 
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)',
                  }}
                >
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography sx={{ color: '#B3B3B3 !important' }} gutterBottom variant="subtitle2">
                    Pending Review
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#FFFFFF !important' }}>
                    {dashboardData.stats.pendingReview}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.25) 100%)',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              backdropFilter: 'blur(15px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(33, 150, 243, 0.4)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: '#2196F3', 
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
                  }}
                >
                  <VerifiedIcon />
                </Avatar>
                <Box>
                  <Typography sx={{ color: '#B3B3B3 !important' }} gutterBottom variant="subtitle2">
                    NGO Verified
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#FFFFFF !important' }}>
                    {dashboardData.stats.thirdPartyVerified || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.25) 100%)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              backdropFilter: 'blur(15px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(76, 175, 80, 0.4)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: '#4CAF50', 
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                  }}
                >
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography sx={{ color: '#B3B3B3 !important' }} gutterBottom variant="subtitle2">
                    Approved
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#FFFFFF !important' }}>
                    {dashboardData.stats.approved}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(147, 51, 234, 0.25) 100%)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              backdropFilter: 'blur(15px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(147, 51, 234, 0.2)',
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(147, 51, 234, 0.4)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: '#9333EA', 
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 15px rgba(147, 51, 234, 0.4)',
                    fontSize: '1.2rem',
                  }}
                >
                  ⛓️
                </Avatar>
                <Box>
                  <Typography sx={{ color: '#B3B3B3 !important' }} gutterBottom variant="subtitle2">
                    Blockchain
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#FFFFFF !important' }}>
                    {dashboardData.stats.blockchainRegistered || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15) 0%, rgba(52, 211, 153, 0.25) 100%)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              backdropFilter: 'blur(15px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(52, 211, 153, 0.2)',
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(52, 211, 153, 0.4)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: '#34D399', 
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 15px rgba(52, 211, 153, 0.4)',
                  }}
                >
                  <EcoIcon />
                </Avatar>
                <Box>
                  <Typography sx={{ color: '#B3B3B3 !important' }} gutterBottom variant="subtitle2">
                    Carbon Credits
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#FFFFFF !important' }}>
                    {dashboardData.stats.carbonCredits}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ 
                color: '#FFFFFF !important',
                fontWeight: 600,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              🚀 Quick Actions
            </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '16px',
                        '&:hover': { 
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 30px rgba(138, 43, 226, 0.4)',
                          backgroundColor: 'rgba(138, 43, 226, 0.1)',
                          border: '1px solid rgba(138, 43, 226, 0.3)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      onClick={action.action}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: action.color, 
                              mr: 2,
                              width: 48,
                              height: 48,
                              boxShadow: '0 4px 15px rgba(138, 43, 226, 0.3)',
                              background: `linear-gradient(135deg, ${action.color} 0%, #8A2BE2 100%)`,
                            }}
                          >
                            {action.icon}
                          </Avatar>
                          <Typography 
                            variant="h6"
                            sx={{ 
                              color: '#FFFFFF !important',
                              fontWeight: 600,
                            }}
                          >
                            {action.title}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.7) !important',
                            lineHeight: 1.5,
                          }}
                        >
                          {action.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography 
                variant="h5"
                sx={{ 
                  color: '#FFFFFF !important',
                  fontWeight: 600,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                📋 Recent Activity
              </Typography>
              <Tooltip title="Notifications">
                <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <NotificationIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      {activity.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <>
                          <Typography variant="body2" color="textSecondary">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {activity.time}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Projects */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography 
                variant="h5"
                sx={{ 
                  color: '#FFFFFF !important',
                  fontWeight: 600,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                🌱 Recent Projects
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/projects/create')}
                sx={{
                  background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
                  boxShadow: '0 4px 15px rgba(138, 43, 226, 0.4)',
                  borderRadius: '10px',
                  px: 3,
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #9333EA 0%, #60A5FA 100%)',
                    boxShadow: '0 8px 25px rgba(138, 43, 226, 0.6)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Create New Project
              </Button>
            </Box>
            
            {dashboardData.projects.length === 0 ? (
              <Alert severity="info">
                No projects found. Create your first blue carbon restoration project to get started!
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {dashboardData.projects.slice(0, 6).map((project) => {
                  const verificationStatus = project.verification_status;
                  const stages = verificationStatus?.verification_stages || {};
                  
                  // Calculate progress percentage
                  let progress = 0;
                  if (stages.ai_verification?.completed) progress += 25;
                  if (stages.third_party_verification?.completed) progress += 25;
                  if (stages.admin_review?.completed) progress += 25;
                  if (stages.blockchain_registration?.completed) progress += 25;
                  
                  return (
                    <Grid item xs={12} md={4} key={project.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {project.project_name || 'Unnamed Project'}
                          </Typography>
                          
                          <Chip
                            label={project.status?.replace('_', ' ').toUpperCase()}
                            color={project.status === 'approved' ? 'success' : 'warning'}
                            size="small"
                            sx={{ mb: 2 }}
                          />
                          
                          {/* Verification Pipeline Progress */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              Verification Progress: {progress}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={progress} 
                              sx={{ height: 8, borderRadius: 1 }}
                            />
                          </Box>
                          
                          {/* Verification Stages */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="textSecondary" display="block">
                              Pipeline Status:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                              <Chip 
                                label="AI" 
                                size="small" 
                                color={stages.ai_verification?.completed ? 'success' : 'default'}
                                variant={stages.ai_verification?.completed ? 'filled' : 'outlined'}
                              />
                              <Chip 
                                label="NGO" 
                                size="small" 
                                color={stages.third_party_verification?.completed ? 'success' : 'default'}
                                variant={stages.third_party_verification?.completed ? 'filled' : 'outlined'}
                              />
                              <Chip 
                                label="Admin" 
                                size="small" 
                                color={stages.admin_review?.completed ? 'success' : 'default'}
                                variant={stages.admin_review?.completed ? 'filled' : 'outlined'}
                              />
                              <Chip 
                                label="⛓️" 
                                size="small" 
                                color={stages.blockchain_registration?.completed ? 'success' : 'default'}
                                variant={stages.blockchain_registration?.completed ? 'filled' : 'outlined'}
                              />
                            </Box>
                          </Box>
                          
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>Ecosystem:</strong> {project.ecosystem_type}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>Area:</strong> {project.area_hectares} hectares
                          </Typography>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>AI Score:</strong> {project.verification_score || 0}/100
                          </Typography>
                          
                          {stages.blockchain_registration?.completed && (
                            <Box sx={{ mt: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                              <Typography variant="caption" color="success.dark">
                                ✅ Blockchain Registered
                              </Typography>
                            </Box>
                          )}
                          
                          {stages.third_party_verification?.organization && (
                            <Box sx={{ mt: 1, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                              <Typography variant="caption" color="info.dark">
                                🏢 Verified by: {stages.third_party_verification.organization}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SimpleDashboard;
