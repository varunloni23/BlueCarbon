import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  CircularProgress,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { projectAPI, handleAPIError } from '../services/api';
import { useSnackbar } from 'notistack';

const ProjectList = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const filterStatus = filter === 'all' ? null : filter;
      const result = await projectAPI.list(filterStatus);
      setProjects(result.projects || []);
    } catch (error) {
      const errorInfo = handleAPIError(error);
      enqueueSnackbar(errorInfo.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filter, enqueueSnackbar]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'verified': return 'primary';
      case 'tokenized': return 'secondary';
      default: return 'default';
    }
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Blue Carbon Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/projects/create')}
        >
          Create New Project
        </Button>
      </Box>

      {/* Filter */}
      <Box mb={3}>
        <TextField
          select
          label="Filter by Status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">All Projects</MenuItem>
          <MenuItem value="submitted">Submitted</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
          <MenuItem value="verified">Verified</MenuItem>
          <MenuItem value="tokenized">Tokenized</MenuItem>
        </TextField>
      </Box>

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {projects.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No projects found
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  {filter === 'all' 
                    ? 'Create your first blue carbon restoration project'
                    : `No projects with status: ${filter}`
                  }
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/projects/create')}
                >
                  Create New Project
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          projects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {project.project_name}
                    </Typography>
                    <Chip
                      label={project.status}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Ecosystem:</strong> {project.ecosystem_type}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Area:</strong> {project.area_hectares} hectares
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Method:</strong> {project.restoration_method}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Created:</strong> {new Date(project.created_at).toLocaleDateString()}
                  </Typography>

                  {project.carbon_credits && (
                    <Box mt={2}>
                      <Chip
                        label={`${project.carbon_credits} Carbon Credits`}
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  )}

                  <Box mt={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetails(project)}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Project Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Project Details: {selectedProject?.project_name}
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Typography><strong>ID:</strong> {selectedProject.id}</Typography>
                <Typography><strong>Status:</strong> 
                  <Chip
                    label={selectedProject.status}
                    color={getStatusColor(selectedProject.status)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography><strong>Ecosystem Type:</strong> {selectedProject.ecosystem_type}</Typography>
                <Typography><strong>Area:</strong> {selectedProject.area_hectares} hectares</Typography>
                <Typography><strong>Restoration Method:</strong> {selectedProject.restoration_method}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Contact Information</Typography>
                <Typography><strong>Email:</strong> {selectedProject.contact_email}</Typography>
                <Typography><strong>Phone:</strong> {selectedProject.phone_number}</Typography>
                <Typography><strong>Location:</strong> {selectedProject.location.lat.toFixed(4)}, {selectedProject.location.lng.toFixed(4)}</Typography>
                <Typography><strong>Created By:</strong> {selectedProject.created_by}</Typography>
                <Typography><strong>Created At:</strong> {new Date(selectedProject.created_at).toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Community Details</Typography>
                <Typography>{selectedProject.community_details}</Typography>
              </Grid>
              {selectedProject.admin_review && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Admin Review</Typography>
                  <Typography><strong>Action:</strong> {selectedProject.admin_review.action}</Typography>
                  <Typography><strong>Comments:</strong> {selectedProject.admin_review.comments}</Typography>
                  <Typography><strong>Reviewed By:</strong> {selectedProject.admin_review.reviewed_by}</Typography>
                  <Typography><strong>Reviewed At:</strong> {new Date(selectedProject.admin_review.reviewed_at).toLocaleString()}</Typography>
                </Grid>
              )}
              {selectedProject.carbon_credits && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Carbon Credits</Typography>
                  <Typography><strong>Credits Issued:</strong> {selectedProject.carbon_credits}</Typography>
                  {selectedProject.tokenization && (
                    <>
                      <Typography><strong>Token ID:</strong> {selectedProject.tokenization.token_id}</Typography>
                      <Typography><strong>Blockchain TX:</strong> {selectedProject.tokenization.blockchain_tx}</Typography>
                    </>
                  )}
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectList;
