import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  LinearProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Nature as NatureIcon,
  AccountCircle as AccountIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PhotoCamera as PhotoIcon,
  LocationOn as LocationIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    total_projects: 0,
    approved_projects: 0,
    pending_projects: 0,
    total_credits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch user's projects
      const response = await fetch('http://localhost:8002/api/projects');
      const data = await response.json();
      
      if (data.status === 'success') {
        // Filter projects for current user (demo - all projects shown)
        const projects = data.projects || [];
        setUserProjects(projects);
        
        // Calculate user stats
        const approved = projects.filter(p => p.status === 'approved').length;
        const pending = projects.filter(p => ['pending_verification', 'requires_review'].includes(p.status)).length;
        const totalCredits = projects.reduce((sum, p) => sum + (p.carbon_credits || 0), 0);
        
        setDashboardStats({
          total_projects: projects.length,
          approved_projects: approved,
          pending_projects: pending,
          total_credits: totalCredits
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      enqueueSnackbar('Failed to load dashboard data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    enqueueSnackbar('Logged out successfully', { variant: 'success' });
  };

  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending_verification': return 'warning';
      case 'requires_review': return 'info';
      default: return 'default';
    }
  };

  const getProjectStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon />;
      case 'rejected': return <WarningIcon />;
      case 'pending_verification': return <ScheduleIcon />;
      case 'requires_review': return <AssessmentIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const recentActivities = [
    { icon: <PhotoIcon />, text: 'New photos uploaded to Sundarbans project', time: '2 hours ago' },
    { icon: <LocationIcon />, text: 'GPS waypoints recorded for Seagrass project', time: '1 day ago' },
    { icon: <CheckCircleIcon />, text: 'Mangrove project approved by NCCR', time: '3 days ago' },
    { icon: <AssessmentIcon />, text: 'AI verification completed', time: '5 days ago' }
  ];

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <NatureIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Blue Carbon MRV - User Portal
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <AccountIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => navigate('/user/projects')}>My Projects</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 4, background: 'linear-gradient(45deg, #e3f2fd, #f3e5f5)' }}>
          <Grid container alignItems="center" spacing={3}>
            <Grid item>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
                {user?.name?.charAt(0)}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                Welcome back, {user?.name}!
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {user?.organization} • Community Project Manager
              </Typography>
              <Chip 
                label={`${dashboardStats.total_projects} Active Projects`} 
                color="primary" 
                sx={{ mt: 1 }} 
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate('/user/projects/create')}
                sx={{ mr: 2 }}
              >
                New Project
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ViewIcon />}
                onClick={() => navigate('/user/projects')}
              >
                View Projects
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <NatureIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {dashboardStats.total_projects}
                </Typography>
                <Typography color="textSecondary">
                  Total Projects
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {dashboardStats.approved_projects}
                </Typography>
                <Typography color="textSecondary">
                  Approved Projects
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {dashboardStats.pending_projects}
                </Typography>
                <Typography color="textSecondary">
                  Pending Review
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" color="info.main">
                  {dashboardStats.total_credits}
                </Typography>
                <Typography color="textSecondary">
                  Carbon Credits
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Recent Projects */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Your Recent Projects
                </Typography>
                
                {userProjects.length === 0 ? (
                  <Alert severity="info">
                    No projects found. <Button onClick={() => navigate('/user/projects/create')}>Create your first project</Button>
                  </Alert>
                ) : (
                  <List>
                    {userProjects.slice(0, 5).map((project) => (
                      <ListItem 
                        key={project.id}
                        sx={{ 
                          border: '1px solid #e0e0e0', 
                          borderRadius: 2, 
                          mb: 1,
                          '&:hover': { bgcolor: '#f5f5f5' }
                        }}
                      >
                        <ListItemIcon>
                          {getProjectStatusIcon(project.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={project.project_name}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                {project.ecosystem_type} • {project.area_hectares} hectares
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Chip
                                  label={project.status?.replace('_', ' ').toUpperCase()}
                                  color={getProjectStatusColor(project.status)}
                                  size="small"
                                />
                                {project.verification_score && (
                                  <Chip
                                    label={`AI Score: ${project.verification_score}/100`}
                                    variant="outlined"
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate('/user/projects')}
                        >
                          View Details
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🔔 Recent Activity
                </Typography>
                
                <List dense>
                  {recentActivities.map((activity, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {activity.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.text}
                        secondary={activity.time}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🚀 Quick Actions
                </Typography>
                
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/user/projects/create')}
                  sx={{ mb: 2 }}
                >
                  Submit New Project
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ViewIcon />}
                  onClick={() => navigate('/user/projects')}
                  sx={{ mb: 2 }}
                >
                  View All Projects
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PhotoIcon />}
                  disabled
                >
                  Upload Media (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserDashboard;
