import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  AccountCircle as AccountIcon,
  TrendingUp as TrendingUpIcon,
  Nature as NatureIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
  ArrowBack as ArrowBackIcon,
  Nature as EcoIcon,
  Water as WaterIcon,
  Waves as WavesIcon,
  Grass as GrassIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8002/api/admin/analytics');
      const data = await response.json();
      
      if (data.status === 'success') {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      enqueueSnackbar('Failed to fetch analytics data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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

  const getEcosystemIcon = (type) => {
    switch (type) {
      case 'mangrove': return <NatureIcon sx={{ color: '#4caf50' }} />;
      case 'seagrass': return <GrassIcon sx={{ color: '#8bc34a' }} />;
      case 'saltmarsh': return <WaterIcon sx={{ color: '#2196f3' }} />;
      case 'coastal_wetland': return <WavesIcon sx={{ color: '#03a9f4' }} />;
      default: return <EcoIcon sx={{ color: '#607d8b' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending_verification': return 'warning';
      case 'requires_review': return 'info';
      default: return 'default';
    }
  };

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
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/admin')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <AdminIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            NCCR - Analytics Dashboard
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <AccountIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => navigate('/admin')}>Dashboard</MenuItem>
            <MenuItem onClick={() => navigate('/admin/projects')}>Projects</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 4, background: 'linear-gradient(45deg, #e8f5e8, #f3e5f5)' }}>
          <Grid container alignItems="center" spacing={3}>
            <Grid item>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
                <AssessmentIcon />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                📊 Blue Carbon Analytics Center
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Comprehensive insights into India's blue carbon restoration program
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {analytics && (
          <>
            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <NatureIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" color="primary">
                      {analytics.total_projects}
                    </Typography>
                    <Typography color="textSecondary">
                      Total Projects Registered
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" color="success.main">
                      {analytics.approved_projects}
                    </Typography>
                    <Typography color="textSecondary">
                      NCCR Approved Projects
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <LocationIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="h4" color="info.main">
                      {analytics.total_area_hectares.toFixed(1)}
                    </Typography>
                    <Typography color="textSecondary">
                      Total Area (Hectares)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                    <Typography variant="h4" color="secondary.main">
                      {analytics.total_carbon_credits.toFixed(0)}
                    </Typography>
                    <Typography color="textSecondary">
                      Carbon Credits (tCO₂)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={4}>
              {/* Ecosystem Distribution */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🌊 Ecosystem Distribution
                    </Typography>
                    <List>
                      {analytics.ecosystem_breakdown.map((ecosystem, index) => (
                        <React.Fragment key={ecosystem.ecosystem_type}>
                          <ListItem>
                            <ListItemIcon>
                              {getEcosystemIcon(ecosystem.ecosystem_type)}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                                    {ecosystem.ecosystem_type.replace('_', ' ')}
                                  </Typography>
                                  <Chip 
                                    label={`${ecosystem.count} projects`} 
                                    color="primary" 
                                    variant="outlined" 
                                    size="small"
                                  />
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="textSecondary">
                                    {ecosystem.total_area.toFixed(1)} hectares • {ecosystem.total_credits.toFixed(0)} tCO₂ credits
                                  </Typography>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={(ecosystem.count / analytics.total_projects) * 100} 
                                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                  />
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < analytics.ecosystem_breakdown.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Project Status Distribution */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📋 Project Status Overview
                    </Typography>
                    <List>
                      {analytics.status_breakdown.map((status, index) => (
                        <React.Fragment key={status.status}>
                          <ListItem>
                            <ListItemIcon>
                              {status.status === 'approved' && <CheckCircleIcon color="success" />}
                              {status.status === 'rejected' && <WarningIcon color="error" />}
                              {status.status === 'pending_verification' && <ScheduleIcon color="warning" />}
                              {status.status === 'requires_review' && <AssessmentIcon color="info" />}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                                    {status.status.replace('_', ' ')}
                                  </Typography>
                                  <Chip 
                                    label={`${status.count} projects`} 
                                    color={getStatusColor(status.status)}
                                    variant="outlined" 
                                    size="small"
                                  />
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="textSecondary">
                                    {((status.count / analytics.total_projects) * 100).toFixed(1)}% of total projects
                                  </Typography>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={(status.count / analytics.total_projects) * 100}
                                    color={getStatusColor(status.status)}
                                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                  />
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < analytics.status_breakdown.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Geographic Distribution */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🗺️ Geographic Distribution
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>State/Region</strong></TableCell>
                            <TableCell align="center"><strong>Projects</strong></TableCell>
                            <TableCell align="center"><strong>Total Area (ha)</strong></TableCell>
                            <TableCell align="center"><strong>Carbon Credits (tCO₂)</strong></TableCell>
                            <TableCell align="center"><strong>Dominant Ecosystem</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analytics.geographic_breakdown.map((location) => (
                            <TableRow key={location.location} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                                  {location.location}
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={location.count} color="primary" variant="outlined" size="small" />
                              </TableCell>
                              <TableCell align="center">
                                {location.total_area.toFixed(1)}
                              </TableCell>
                              <TableCell align="center">
                                <Typography color="secondary.main" fontWeight="bold">
                                  {location.total_credits.toFixed(0)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {getEcosystemIcon(location.dominant_ecosystem)}
                                  <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                                    {location.dominant_ecosystem?.replace('_', ' ') || 'Mixed'}
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Performance Insights */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🎯 Program Performance Insights
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h5" color="success.main">
                            {analytics.avg_project_size.toFixed(1)} ha
                          </Typography>
                          <Typography color="textSecondary">
                            Average Project Size
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h5" color="info.main">
                            {analytics.avg_carbon_credits.toFixed(1)} tCO₂
                          </Typography>
                          <Typography color="textSecondary">
                            Average Carbon Credits/Project
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h5" color="warning.main">
                            {analytics.approval_rate.toFixed(1)}%
                          </Typography>
                          <Typography color="textSecondary">
                            NCCR Approval Rate
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default AdminAnalytics;
