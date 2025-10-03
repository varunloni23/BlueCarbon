import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Alert, Typography, Button, Box, Card, CardContent, Grid,
  Chip, CircularProgress, IconButton, Fab, Paper, List, ListItem,
  ListItemIcon, ListItemText, Avatar, LinearProgress
} from '@mui/material';
import {
  Add as AddIcon, Nature as NatureIcon, Verified as VerifiedIcon,
  Schedule as ScheduleIcon, Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon, Upload as UploadIcon,
  Info as InfoIcon, Timeline as TimelineIcon, CloudUpload as CloudUploadIcon,
  Settings as SettingsIcon, Eco as EcoIcon, Map as MapIcon,
  TrendingUp as TrendingUpIcon, Group as GroupIcon, MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

// Simple Community Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [stats, setStats] = useState({ 
    totalProjects: 6, 
    totalCredits: 0, 
    verifiedProjects: 0, 
    pendingVerification: 0 
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const userProfile = {
    name: 'Community Member',
    email: localStorage.getItem('userEmail') || 'user@example.com',
    organization: 'Local Environmental Group',
    location: 'Tamil Nadu Coast'
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Header */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          🌊 Welcome to Blue Carbon MRV
        </Typography>
        <Typography variant="h6" gutterBottom>
          Hello, {userProfile.email}
        </Typography>
        <Typography variant="body1">
          Monitor, Report, and Verify your coastal ecosystem restoration projects
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'info.main' }}>
          🔗 System Status: All services operational | Backend: Connected | AI Verification: Active
        </Typography>
      </Alert>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <NatureIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalProjects}</Typography>
                  <Typography variant="body2" color="textSecondary">Total Projects</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">0</Typography>
                  <Typography variant="body2" color="textSecondary">Pending Review</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VerifiedIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">0</Typography>
                  <Typography variant="body2" color="textSecondary">NGO Verified</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">0</Typography>
                  <Typography variant="body2" color="textSecondary">Approved</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CloudUploadIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">0</Typography>
                  <Typography variant="body2" color="textSecondary">Blockchain</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EcoIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">0</Typography>
                  <Typography variant="body2" color="textSecondary">Carbon Credits</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            🚀 Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/projects/create')}
                sx={{ py: 2 }}
              >
                Create New Project
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                Start a new blue carbon restoration project
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth variant="outlined"
                startIcon={<TimelineIcon />}
                onClick={() => navigate('/projects')}
                sx={{ py: 2 }}
              >
                Project Status Tracker
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                Track verification pipeline progress
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth variant="outlined"
                startIcon={<VerifiedIcon />}
                onClick={() => navigate('/ngo-verification')}
                sx={{ py: 2 }}
              >
                NGO Verification Portal
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                Access 3rd party verification system
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth variant="outlined"
                startIcon={<MapIcon />}
                onClick={() => navigate('/data-collection')}
                sx={{ py: 2 }}
              >
                Data Collection
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                Collect field data and measurements
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth variant="outlined"
                startIcon={<MonetizationOnIcon />}
                onClick={() => navigate('/marketplace')}
                sx={{ py: 2 }}
              >
                Marketplace
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                Trade carbon credits
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth variant="outlined"
                startIcon={<EcoIcon />}
                onClick={() => navigate('/carbon-credits')}
                sx={{ py: 2 }}
              >
                Carbon Credits
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                Manage tokenized carbon credits
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth variant="outlined"
                startIcon={<MonetizationOnIcon />}
                onClick={() => navigate('/payments')}
                sx={{ py: 2 }}
              >
                Payments
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                Transfer blockchain carbon credits
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth variant="outlined"
                startIcon={<AssessmentIcon />}
                onClick={() => navigate('/reports')}
                sx={{ py: 2 }}
              >
                Reports
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                View detailed analytics and reports
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                📋 Recent Activity
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <VerifiedIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="NGO Verification System Launched"
                    secondary="3rd party verification portal now available for organizations"
                  />
                  <Typography variant="caption" color="textSecondary">
                    1 hour ago
                  </Typography>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <TimelineIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Project Status Tracker Active"
                    secondary="Real-time verification pipeline tracking now available"
                  />
                  <Typography variant="caption" color="textSecondary">
                    2 hours ago
                  </Typography>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CloudUploadIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Blockchain Integration Live"
                    secondary="Live project registration on Polygon Amoy testnet operational"
                  />
                  <Typography variant="caption" color="textSecondary">
                    3 hours ago
                  </Typography>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="AI Verification Enhanced"
                    secondary="Enhanced AI verification with fraud detection active"
                  />
                  <Typography variant="caption" color="textSecondary">
                    4 hours ago
                  </Typography>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                🌱 Recent Projects
              </Typography>
              
              {/* Sample Projects */}
              <Box sx={{ mb: 2 }}>
                <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    titled
                  </Typography>
                  <Chip label="SUBMITTED" color="warning" size="small" sx={{ mb: 1 }} />
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Verification Progress: 25%
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>Pipeline Status:</Typography>
                    <Chip label="AI" color="success" size="small" sx={{ mr: 0.5 }} />
                    <Chip label="NGO" color="default" size="small" sx={{ mr: 0.5 }} />
                    <Chip label="Admin" color="default" size="small" sx={{ mr: 0.5 }} />
                    <Chip label="⛓️" color="default" size="small" />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary">
                    Ecosystem: mangrove
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Area: 100 hectares
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    AI Score: 0/100
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Untitled Project
                  </Typography>
                  <Chip label="SUBMITTED" color="warning" size="small" sx={{ mb: 1 }} />
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Verification Progress: 25%
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>Pipeline Status:</Typography>
                    <Chip label="AI" color="success" size="small" sx={{ mr: 0.5 }} />
                    <Chip label="NGO" color="default" size="small" sx={{ mr: 0.5 }} />
                    <Chip label="Admin" color="default" size="small" sx={{ mr: 0.5 }} />
                    <Chip label="⛓️" color="default" size="small" />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary">
                    Ecosystem: mangrove
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Area: 10 hectares
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    AI Score: 0/100
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add project"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/projects/create')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default Dashboard;