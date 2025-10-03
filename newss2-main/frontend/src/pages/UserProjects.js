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
  Fab
} from '@mui/material';
import {
  Nature as NatureIcon,
  AccountCircle as AccountIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const UserProjects = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // New project form data
  const [newProject, setNewProject] = useState({
    project_name: '',
    ecosystem_type: 'mangrove',
    location: '',
    area_hectares: '',
    description: '',
    restoration_activities: '',
    expected_carbon_credits: ''
  });

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

  const handleCreateProject = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newProject,
          area_hectares: parseFloat(newProject.area_hectares),
          expected_carbon_credits: parseFloat(newProject.expected_carbon_credits),
          submitted_by: user?.email || 'demo_user',
          submission_date: new Date().toISOString().split('T')[0]
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        enqueueSnackbar('Project submitted successfully!', { variant: 'success' });
        setCreateDialogOpen(false);
        setNewProject({
          project_name: '',
          ecosystem_type: 'mangrove',
          location: '',
          area_hectares: '',
          description: '',
          restoration_activities: '',
          expected_carbon_credits: ''
        });
        fetchProjects(); // Refresh the projects list
      } else {
        enqueueSnackbar(data.message || 'Failed to submit project', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error creating project:', error);
      enqueueSnackbar('Failed to submit project', { variant: 'error' });
    }
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setViewDialogOpen(true);
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
            onClick={() => navigate('/user')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <NatureIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Projects
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
            <MenuItem onClick={() => navigate('/user')}>Dashboard</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h4" gutterBottom>
                🌿 Blue Carbon Projects
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Manage your restoration projects and track their progress
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Submit New Project
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Projects Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Your Project Portfolio
            </Typography>
            
            {projects.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No projects found. Submit your first blue carbon restoration project!
              </Alert>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Project Name</strong></TableCell>
                      <TableCell><strong>Ecosystem</strong></TableCell>
                      <TableCell><strong>Location</strong></TableCell>
                      <TableCell><strong>Area (ha)</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Carbon Credits</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {project.project_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={project.ecosystem_type} 
                            variant="outlined" 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{project.location}</TableCell>
                        <TableCell>{project.area_hectares}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getProjectStatusIcon(project.status)}
                            label={project.status?.replace('_', ' ').toUpperCase()}
                            color={getProjectStatusColor(project.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="primary">
                            {project.carbon_credits || project.expected_carbon_credits || 0} tCO₂
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => handleViewProject(project)}
                          >
                            View
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

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Create Project Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>🌱 Submit New Blue Carbon Project</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={newProject.project_name}
                onChange={(e) => setNewProject({...newProject, project_name: e.target.value})}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Ecosystem Type</InputLabel>
                <Select
                  value={newProject.ecosystem_type}
                  label="Ecosystem Type"
                  onChange={(e) => setNewProject({...newProject, ecosystem_type: e.target.value})}
                >
                  <MenuItem value="mangrove">Mangrove</MenuItem>
                  <MenuItem value="seagrass">Seagrass</MenuItem>
                  <MenuItem value="saltmarsh">Salt Marsh</MenuItem>
                  <MenuItem value="coastal_wetland">Coastal Wetland</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={newProject.location}
                onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Area (Hectares)"
                type="number"
                value={newProject.area_hectares}
                onChange={(e) => setNewProject({...newProject, area_hectares: e.target.value})}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expected Carbon Credits (tCO₂)"
                type="number"
                value={newProject.expected_carbon_credits}
                onChange={(e) => setNewProject({...newProject, expected_carbon_credits: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Description"
                multiline
                rows={3}
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Restoration Activities"
                multiline
                rows={2}
                value={newProject.restoration_activities}
                onChange={(e) => setNewProject({...newProject, restoration_activities: e.target.value})}
                helperText="Describe the specific restoration activities planned"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateProject} 
            variant="contained"
            disabled={!newProject.project_name || !newProject.location || !newProject.area_hectares}
          >
            Submit Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Project Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>🌿 Project Details</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedProject.project_name}
                </Typography>
                <Chip
                  icon={getProjectStatusIcon(selectedProject.status)}
                  label={selectedProject.status?.replace('_', ' ').toUpperCase()}
                  color={getProjectStatusColor(selectedProject.status)}
                />
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
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Carbon Credits</Typography>
                <Typography variant="body1" color="primary">
                  {selectedProject.carbon_credits || selectedProject.expected_carbon_credits || 0} tCO₂
                </Typography>
              </Grid>
              
              {selectedProject.verification_score && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">AI Verification Score</Typography>
                  <Typography variant="body1">{selectedProject.verification_score}/100</Typography>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                <Typography variant="body1">{selectedProject.description}</Typography>
              </Grid>
              
              {selectedProject.restoration_activities && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Restoration Activities</Typography>
                  <Typography variant="body1">{selectedProject.restoration_activities}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProjects;
