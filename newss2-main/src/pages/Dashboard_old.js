import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Alert,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Nature as NatureIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Upload as UploadIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  CloudUpload as CloudUploadIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Eco as EcoIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

// NGO Dashboard Component - Completely different from user dashboard
const NGODashboard = ({ userProfile }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [verifiedProjects, setVerifiedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [fieldData, setFieldData] = useState({
    soilPh: '',
    waterSalinity: '',
    treeCount: '',
    ecosystemHealth: '',
    carbonEstimate: '',
    fieldNotes: '',
    sitePhotos: [],
    gpsCoordinates: ''
  });

  // Fetch projects pending NGO verification
  useEffect(() => {
    fetchPendingProjects();
  }, []);

  const fetchPendingProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8002/api/projects');
      const data = await response.json();
      
      if (data.status === 'success') {
        // Filter projects that need NGO verification (AI verified but not 3rd party verified)
        const projectsNeedingVerification = [];
        const alreadyVerified = [];
        
        for (const project of data.projects) {
          try {
            const statusResponse = await fetch(`http://localhost:8002/api/projects/${project.id}/verification-status`);
            const statusData = await statusResponse.json();
            
            if (statusData.ai_verification?.passed && !statusData.third_party_verification?.completed) {
              projectsNeedingVerification.push({...project, verification_status: statusData});
            } else if (statusData.third_party_verification?.completed) {
              alreadyVerified.push({...project, verification_status: statusData});
            }
          } catch (err) {
            console.log('Error fetching verification status for project:', project.id);
          }
        }
        
        setPendingProjects(projectsNeedingVerification);
        setVerifiedProjects(alreadyVerified);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      enqueueSnackbar('Error loading projects', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectVerification = (project) => {
    setSelectedProject(project);
    setVerificationDialog(true);
  };

  const submitVerificationReport = async (action) => {
    if (!selectedProject) return;
    
    try {
      const verificationData = {
        project_id: selectedProject.id,
        action: action, // 'approve' or 'reject'
        field_verification: fieldData,
        ngo_organization: userProfile.organization || userProfile.name,
        verification_date: new Date().toISOString(),
        notes: fieldData.fieldNotes
      };

      const response = await fetch('http://localhost:8002/api/3rd-party/submit-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData)
      });

      const result = await response.json();
      
      if (result.success || response.ok) {
        enqueueSnackbar(`Project ${action}d successfully`, { variant: 'success' });
        setVerificationDialog(false);
        setSelectedProject(null);
        setFieldData({
          soilPh: '', waterSalinity: '', treeCount: '', ecosystemHealth: '',
          carbonEstimate: '', fieldNotes: '', sitePhotos: [], gpsCoordinates: ''
        });
        fetchPendingProjects(); // Refresh the list
      } else {
        enqueueSnackbar(result.message || 'Error submitting verification', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      enqueueSnackbar('Error submitting verification report', { variant: 'error' });
    }
  };

  const renderNGOOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          NGO Verification Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Welcome, {userProfile.organization || userProfile.name}
        </Typography>
      </Grid>

      {/* NGO Stats Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
              <Box>
                <Typography variant="h4">{pendingProjects.length}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Pending Verification
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
              <Box>
                <Typography variant="h4">{verifiedProjects.length}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Verified Projects
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
              <Box>
                <Typography variant="h4">
                  {Math.round((verifiedProjects.length / (pendingProjects.length + verifiedProjects.length) || 0) * 100)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Completion Rate
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VerifiedIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h4">Active</Typography>
                <Typography variant="body2" color="textSecondary">
                  Verification Status
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Actions for NGOs */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={() => setActiveTab(1)}
                  sx={{ py: 2 }}
                >
                  Review Applications
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TimelineIcon />}
                  onClick={() => window.open('http://localhost:8005', '_blank')}
                  sx={{ py: 2 }}
                >
                  Status Dashboard
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => setActiveTab(2)}
                  sx={{ py: 2 }}
                >
                  My Reports
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/profile')}
                  sx={{ py: 2 }}
                >
                  NGO Profile
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPendingVerifications = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Projects Pending Verification
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Review community applications and provide field verification data
        </Typography>
      </Grid>

      {pendingProjects.length === 0 ? (
        <Grid item xs={12}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ScheduleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Pending Verifications
            </Typography>
            <Typography variant="body2" color="textSecondary">
              All projects have been verified or no new applications are available.
            </Typography>
          </Paper>
        </Grid>
      ) : (
        pendingProjects.map((project) => (
          <Grid item xs={12} md={6} key={project.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {project.project_name || 'Untitled Project'}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {project.description || 'No description provided'}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={`${project.ecosystem_type || 'Unknown'} Ecosystem`}
                    color="primary" 
                    size="small" 
                    sx={{ mr: 1 }} 
                  />
                  <Chip 
                    label={`${project.area_hectares || 0} hectares`}
                    color="secondary" 
                    size="small" 
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>AI Verification Score:</strong> {project.verification_status?.verification_score || 0}/100
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Status:</strong> Ready for Field Verification
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Submitted:</strong> {new Date(project.created_at).toLocaleDateString()}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AssessmentIcon />}
                  onClick={() => handleProjectVerification(project)}
                >
                  Start Verification
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );

  const renderVerificationReports = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Completed Verifications
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Your submitted verification reports
        </Typography>
      </Grid>

      {verifiedProjects.map((project) => (
        <Grid item xs={12} md={6} key={project.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  {project.project_name || 'Untitled Project'}
                </Typography>
                <Chip 
                  label="Verified" 
                  color="success" 
                  size="small"
                  icon={<CheckCircleIcon />}
                />
              </Box>
              
              <Typography variant="body2" color="textSecondary" paragraph>
                Verified by: {project.verification_status?.verification_stages?.third_party_verification?.organization || userProfile.name}
              </Typography>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  enqueueSnackbar('Report details coming soon', { variant: 'info' });
                }}
              >
                View Report
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <>
      {/* NGO Dashboard Header */}
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="h6">
          🏢 NGO Verification Dashboard - {userProfile.organization || 'Verification Organization'}
        </Typography>
        <Typography variant="body2">
          Review and verify community blue carbon projects. Upload field measurements and forward to admin for approval.
        </Typography>
      </Alert>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Overview" />
              <Tab label={`Applications (${pendingProjects.length})`} />
              <Tab label={`Reports (${verifiedProjects.length})`} />
            </Tabs>
          </Box>

          {activeTab === 0 && renderNGOOverview()}
          {activeTab === 1 && renderPendingVerifications()}
          {activeTab === 2 && renderVerificationReports()}
        </>
      )}

      {/* Verification Dialog */}
      <Dialog 
        open={verificationDialog} 
        onClose={() => setVerificationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Field Verification - {selectedProject?.project_name || 'Project'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            Complete field verification by filling out the form below
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Soil pH Level"
                type="number"
                value={fieldData.soilPh}
                onChange={(e) => setFieldData({...fieldData, soilPh: e.target.value})}
                inputProps={{ step: "0.1", min: "0", max: "14" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Water Salinity (ppt)"
                type="number"
                value={fieldData.waterSalinity}
                onChange={(e) => setFieldData({...fieldData, waterSalinity: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tree Count"
                type="number"
                value={fieldData.treeCount}
                onChange={(e) => setFieldData({...fieldData, treeCount: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Carbon Estimate (tCO2/year)"
                type="number"
                value={fieldData.carbonEstimate}
                onChange={(e) => setFieldData({...fieldData, carbonEstimate: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ecosystem Health Assessment"
                multiline
                rows={2}
                value={fieldData.ecosystemHealth}
                onChange={(e) => setFieldData({...fieldData, ecosystemHealth: e.target.value})}
                placeholder="Describe the current state of the ecosystem..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Field Notes & Recommendations"
                multiline
                rows={3}
                value={fieldData.fieldNotes}
                onChange={(e) => setFieldData({...fieldData, fieldNotes: e.target.value})}
                placeholder="Additional observations, recommendations, or concerns..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="GPS Coordinates"
                value={fieldData.gpsCoordinates}
                onChange={(e) => setFieldData({...fieldData, gpsCoordinates: e.target.value})}
                placeholder="Latitude, Longitude"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => submitVerificationReport('reject')}
            color="error"
            variant="outlined"
          >
            Reject Project
          </Button>
          <Button 
            onClick={() => submitVerificationReport('approve')}
            variant="contained"
            color="success"
          >
            Approve & Forward to Admin
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCredits: 0,
    verifiedProjects: 0,
    pendingVerification: 0,
    myProjects: [],
    notifications: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [quickUploadDialog, setQuickUploadDialog] = useState(false);
  
  // Get user info from localStorage to determine role
  const getCurrentUserInfo = () => {
    try {
      const userInfoRaw = localStorage.getItem('userInfo') || '{}';
      const ngoOrgRaw = localStorage.getItem('ngo_organization') || '{}';
      
      console.log('RAW localStorage userInfo:', userInfoRaw);
      console.log('RAW localStorage ngo_organization:', ngoOrgRaw);
      
      const userInfo = JSON.parse(userInfoRaw);
      const ngoOrg = JSON.parse(ngoOrgRaw);
      
      console.log('PARSED userInfo:', userInfo);
      console.log('PARSED ngoOrg:', ngoOrg);
      console.log('userInfo.userType:', userInfo.userType);
      console.log('ngoOrg.id:', ngoOrg.id);
      
      if (userInfo.userType === 'ngo' || ngoOrg.id) {
        console.log('DETECTED NGO USER - returning NGO profile');
        return {
          name: ngoOrg.name || userInfo.name || 'NGO Verifier',
          organization: ngoOrg.name || 'Verification Organization',
          location: ngoOrg.authorized_regions?.[0] || 'India',
          userType: 'ngo',
          orgId: ngoOrg.id
        };
      } else if (userInfo.userType === 'admin') {
        console.log('DETECTED ADMIN USER - returning admin profile');
        return {
          name: userInfo.name || 'NCCR Admin',
          organization: 'National Centre for Coastal Research',
          location: 'Chennai, India',
          userType: 'admin'
        };
      } else {
        console.log('DETECTED COMMUNITY USER - returning community profile');
        return {
          name: userInfo.name || 'Community Member',
          organization: 'Local Environmental Group',
          location: 'Tamil Nadu Coast',
          userType: 'community'
        };
      }
    } catch (e) {
      console.error('ERROR in getCurrentUserInfo:', e);
      return {
        name: 'Community Member',
        organization: 'Local Environmental Group',
        location: 'Tamil Nadu Coast',
        userType: 'community'
      };
    }
  };

  const [userProfile, setUserProfile] = useState(getCurrentUserInfo());

  useEffect(() => {
    // Refresh user profile on component mount
    const refreshedProfile = getCurrentUserInfo();
    console.log('useEffect refreshedProfile:', refreshedProfile);
    setUserProfile(refreshedProfile);
    
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Force re-check user profile when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const refreshedProfile = getCurrentUserInfo();
      console.log('Storage change refreshedProfile:', refreshedProfile);
      setUserProfile(refreshedProfile);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Test Python backend connection
      const statusResponse = await fetch('http://localhost:8002/api/status');
      if (statusResponse.ok) {
        setBackendStatus('connected');
        
        // Fetch user's projects data
        const projectsResponse = await fetch('http://localhost:8002/api/projects');
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          const projects = projectsData.projects || [];
          
          // Filter projects for current user (in real app, would filter by user ID)
          const myProjects = projects.slice(0, 3); // Demo: show first 3 as user's projects
          
          setStats(prevStats => ({
            ...prevStats,
            totalProjects: projects.length,
            myProjects: myProjects,
            recentActivity: [
              { id: 1, action: 'Project verified', project: 'Mangrove Restoration', time: '2 hours ago' },
              { id: 2, action: 'Data uploaded', project: 'Coastal Protection', time: '4 hours ago' }
            ],
            notifications: [
              { id: 1, type: 'success', message: 'Project approved by NGO', time: '1 hour ago' },
              { id: 2, type: 'info', message: 'New verification required', time: '3 hours ago' }
            ]
          }));
        }
      } else {
        setBackendStatus('disconnected');
        enqueueSnackbar('Backend connection failed', { variant: 'warning' });
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setBackendStatus('error');
      enqueueSnackbar('Failed to fetch dashboard data', { variant: 'error' });
    } finally {
      setLoading(false);
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

  const handleQuickUpload = () => {
    setQuickUploadDialog(false);
    navigate('/projects/create');
  };

  const renderCommunityDashboard = () => (
    <>
      {/* Backend Status Alert */}
      {backendStatus !== 'connected' && (
        <Alert 
          severity={backendStatus === 'checking' ? 'info' : 'warning'} 
          sx={{ mb: 3 }}
          action={
            <IconButton size="small" onClick={fetchDashboardData}>
              <RefreshIcon />
            </IconButton>
          }
        >
          {backendStatus === 'checking' ? 'Connecting to backend...' : 
           backendStatus === 'disconnected' ? 'Backend disconnected - Some features may be limited' :
           'Backend connection error - Please check your connection'}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {/* Welcome Header */}
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <PersonIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h4" gutterBottom>
                    Welcome back, {userProfile.name}!
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {userProfile.organization} • {userProfile.location}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
                    Continue your blue carbon restoration journey. Your efforts are making a real impact on coastal ecosystems.
                  </Typography>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/projects/create')}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    New Project
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Key Statistics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography color="textSecondary" gutterBottom>
                        My Projects
                      </Typography>
                      <Typography variant="h4">{stats.totalProjects}</Typography>
                    </Box>
                    <NatureIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography color="textSecondary" gutterBottom>
                        Carbon Credits Earned
                      </Typography>
                      <Typography variant="h4">{stats.totalCredits}</Typography>
                    </Box>
                    <EcoIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography color="textSecondary" gutterBottom>
                        Verified Projects
                      </Typography>
                      <Typography variant="h4">{stats.verifiedProjects}</Typography>
                    </Box>
                    <VerifiedIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography color="textSecondary" gutterBottom>
                        Pending Review
                      </Typography>
                      <Typography variant="h4">{stats.pendingVerification}</Typography>
                    </Box>
                    <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🚀 Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/projects/create')}
                    sx={{ py: 2 }}
                  >
                    Start New Project
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => setQuickUploadDialog(true)}
                    sx={{ py: 2 }}
                  >
                    Quick Upload
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<MapIcon />}
                    onClick={() => navigate('/data-collection')}
                    sx={{ py: 2 }}
                  >
                    Field Data
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AssessmentIcon />}
                    onClick={() => navigate('/reports')}
                    sx={{ py: 2 }}
                  >
                    View Reports
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* My Projects */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Projects
              </Typography>
              {stats.myProjects.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <NatureIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No Projects Yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Start your blue carbon restoration journey by creating your first project.
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/projects/create')}
                  >
                    Create Your First Project
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {stats.myProjects.map((project) => (
                    <Grid item xs={12} md={4} key={project.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {project.project_name || 'Untitled Project'}
                          </Typography>
                          <Chip 
                            label={project.status || 'SUBMITTED'} 
                            color={getStatusColor(project.status)}
                            size="small"
                            sx={{ mb: 2 }}
                          />
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            {project.description || 'No description available'}
                          </Typography>
                          
                          {project.verification_progress && (
                            <>
                              <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                                Verification Progress: {project.verification_progress}%
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={project.verification_progress} 
                                sx={{ mb: 2 }}
                              />
                            </>
                          )}
                          
                          <Button variant="outlined" size="small">
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Quick Upload Dialog */}
      <Dialog open={quickUploadDialog} onClose={() => setQuickUploadDialog(false)}>
        <DialogTitle>Quick Project Upload</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Start a new project submission with these quick options:
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<UploadIcon />}
              sx={{ mb: 2 }}
              onClick={handleQuickUpload}
            >
              Upload Photos & Media
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MapIcon />}
              sx={{ mb: 2 }}
              onClick={handleQuickUpload}
            >
              Add GPS Coordinates
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AssessmentIcon />}
              onClick={handleQuickUpload}
            >
              Enter Field Measurements
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickUploadDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleQuickUpload}>
            Start Full Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add project"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/projects/create')}
      >
        <AddIcon />
      </Fab>
    </>
  );

  // Debug logging for user type detection
  console.log('Dashboard userProfile:', userProfile);
  console.log('userProfile.userType:', userProfile.userType);
  console.log('localStorage userInfo:', localStorage.getItem('userInfo'));
  console.log('localStorage ngo_organization:', localStorage.getItem('ngo_organization'));

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Debug indicator for user type */}
      <Alert severity="info" sx={{ mb: 2 }}>
        🔍 Current User Type: "{userProfile.userType || 'undefined'}" | Name: "{userProfile.name || 'undefined'}" 
        {userProfile.userType === 'ngo' ? ' → Showing NGO Dashboard' : ' → Showing Community Dashboard'}
        <Button 
          variant="outlined" 
          size="small" 
          sx={{ ml: 2 }}
          onClick={() => {
            const refreshedProfile = getCurrentUserInfo();
            console.log('Manual refresh profile:', refreshedProfile);
            setUserProfile(refreshedProfile);
          }}
        >
          Refresh Profile
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          sx={{ ml: 1 }}
          onClick={() => navigate('/login')}
        >
          Re-login
        </Button>
      </Alert>
      
      {/* Conditional rendering based on user type */}
      {userProfile.userType === 'ngo' ? (
        <NGODashboard userProfile={userProfile} />
      ) : (
        renderCommunityDashboard()
      )}
    </Container>
  );
};

export default Dashboard;