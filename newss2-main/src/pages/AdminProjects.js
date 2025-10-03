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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  AccountCircle as AccountIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  Nature as NatureIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const AdminProjects = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [reviewDecision, setReviewDecision] = useState('');
  const [reviewComments, setReviewComments] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/projects');
      const data = await response.json();
      
      if (data.status === 'success') {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      enqueueSnackbar('Failed to load projects', { variant: 'error' });
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

  const handleReviewProject = (project) => {
    setSelectedProject(project);
    setReviewDialogOpen(true);
    setReviewDecision('');
    setReviewComments('');
  };

  const submitReview = async () => {
    if (!reviewDecision) {
      enqueueSnackbar('Please select a review decision', { variant: 'warning' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:8002/api/admin/projects/${selectedProject.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: reviewDecision,
          comments: reviewComments,
          reviewed_by: user?.email || 'admin@nccr.gov.in',
          review_date: new Date().toISOString().split('T')[0]
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        enqueueSnackbar('Project review submitted successfully!', { variant: 'success' });
        setReviewDialogOpen(false);
        fetchProjects(); // Refresh the projects list
      } else {
        enqueueSnackbar(data.message || 'Failed to submit review', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      enqueueSnackbar('Failed to submit review', { variant: 'error' });
    }
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

  const getFilteredProjects = () => {
    switch (tabValue) {
      case 0: return projects; // All projects
      case 1: return projects.filter(p => p.status === 'requires_review');
      case 2: return projects.filter(p => p.status === 'approved');
      case 3: return projects.filter(p => p.status === 'rejected');
      default: return projects;
    }
  };

  const getProjectStats = () => {
    const total = projects.length;
    const pending = projects.filter(p => p.status === 'requires_review').length;
    const approved = projects.filter(p => p.status === 'approved').length;
    const rejected = projects.filter(p => p.status === 'rejected').length;
    const totalCredits = projects.filter(p => p.status === 'approved').reduce((sum, p) => sum + (p.carbon_credits || 0), 0);
    
    return { total, pending, approved, rejected, totalCredits };
  };

  const stats = getProjectStats();

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
            NCCR - Project Management
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
            <MenuItem onClick={() => navigate('/admin/analytics')}>Analytics</MenuItem>
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
                <AdminIcon />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                🏛️ NCCR Project Review Center
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Monitor and approve blue carbon restoration projects across India
              </Typography>
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
                  {stats.total}
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
                <Badge badgeContent={stats.pending} color="warning">
                  <AssessmentIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                </Badge>
                <Typography variant="h4" color="warning.main">
                  {stats.pending}
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
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {stats.approved}
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
                <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" color="info.main">
                  {stats.totalCredits}
                </Typography>
                <Typography color="textSecondary">
                  Approved Credits (tCO₂)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Project Tabs */}
        <Card>
          <CardContent>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
              <Tab label="All Projects" />
              <Tab 
                label={
                  <Badge badgeContent={stats.pending} color="error">
                    Pending Review
                  </Badge>
                } 
              />
              <Tab label="Approved" />
              <Tab label="Rejected" />
            </Tabs>
            
            {getFilteredProjects().length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No projects found in this category.
              </Alert>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Project Details</strong></TableCell>
                      <TableCell><strong>Location & Area</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Carbon Credits</strong></TableCell>
                      <TableCell><strong>AI Score</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredProjects().map((project) => (
                      <TableRow key={project.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {project.project_name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {project.ecosystem_type} • Submitted by: {project.submitted_by || 'Community User'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              📍 {project.location}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {project.area_hectares} hectares
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getProjectStatusIcon(project.status)}
                            label={project.status?.replace('_', ' ').toUpperCase()}
                            color={getProjectStatusColor(project.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="primary" fontWeight="bold">
                            {project.carbon_credits || project.expected_carbon_credits || 0} tCO₂
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {project.verification_score ? (
                            <Chip
                              label={`${project.verification_score}/100`}
                              color={project.verification_score >= 80 ? 'success' : project.verification_score >= 60 ? 'warning' : 'error'}
                              variant="outlined"
                              size="small"
                            />
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              Pending
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AssessmentIcon />}
                            onClick={() => handleReviewProject(project)}
                            disabled={project.status === 'approved' || project.status === 'rejected'}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Review Project Dialog */}
      <Dialog 
        open={reviewDialogOpen} 
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>🔍 Project Review - NCCR Assessment</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Project Information */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    📋 Project Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Project Name</Typography>
                      <Typography variant="body1" fontWeight="bold">{selectedProject.project_name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Ecosystem Type</Typography>
                      <Typography variant="body1">{selectedProject.ecosystem_type}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Location</Typography>
                      <Typography variant="body1">{selectedProject.location}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Area</Typography>
                      <Typography variant="body1">{selectedProject.area_hectares} hectares</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                      <Typography variant="body1">{selectedProject.description}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* AI Verification Results */}
              {selectedProject.verification_score && (
                <Grid item xs={12}>
                  <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      🤖 AI Verification Results
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">Verification Score</Typography>
                        <Chip
                          label={`${selectedProject.verification_score}/100`}
                          color={selectedProject.verification_score >= 80 ? 'success' : selectedProject.verification_score >= 60 ? 'warning' : 'error'}
                          size="large"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">Risk Assessment</Typography>
                        <Typography variant="body1">
                          {selectedProject.verification_score >= 80 ? 'Low Risk' : selectedProject.verification_score >= 60 ? 'Medium Risk' : 'High Risk'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {/* Review Decision */}
              <Grid item xs={12}>
                <FormControl fullWidth required sx={{ mb: 2 }}>
                  <InputLabel>Review Decision</InputLabel>
                  <Select
                    value={reviewDecision}
                    label="Review Decision"
                    onChange={(e) => setReviewDecision(e.target.value)}
                  >
                    <MenuItem value="approved">✅ Approve Project</MenuItem>
                    <MenuItem value="rejected">❌ Reject Project</MenuItem>
                    <MenuItem value="requires_revision">📝 Request Revision</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Review Comments"
                  multiline
                  rows={4}
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Provide detailed feedback for the community..."
                  required
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={submitReview} 
            variant="contained"
            disabled={!reviewDecision || !reviewComments}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProjects;
