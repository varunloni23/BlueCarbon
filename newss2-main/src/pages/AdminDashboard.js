import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Avatar,
} from '@mui/material';

// Import Leaflet components
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import custom components
import IPFSMediaViewer from '../components/IPFSMediaViewer';

import {
  CheckCircle,
  Cancel,
  Dashboard as DashboardIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Analytics as AnalyticsIcon,
  Map as MapIcon,
  PhotoLibrary as MediaIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Logout as LogoutIcon,
  Link as BlockchainIcon,
} from '@mui/icons-material';
import { adminAPI, handleAPIError } from '../services/api';
import { useSnackbar } from 'notistack';

// Fix for Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom markers for different project statuses
const getMarkerColor = (status) => {
  switch (status) {
    case 'approved': return '#4caf50'; // Green
    case 'requires_review': return '#f44336'; // Red
    case 'pending_verification': return '#ff9800'; // Orange
    case 'submitted': return '#2196f3'; // Blue
    default: return '#9e9e9e'; // Grey
  }
};

// Custom marker icon based on status
const createCustomIcon = (status) => {
  const color = getMarkerColor(status);
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color}; 
      width: 25px; 
      height: 25px; 
      border-radius: 50%; 
      border: 3px solid white; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      position: relative;
    "></div>`,
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -12.5]
  });
};

const AdminDashboard = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [adminStats, setAdminStats] = useState({
    total_projects: 0,
    pending_review: 0,
    ai_flagged: 0,
    approved: 0,
    rejected: 0,
    total_credits: 0,
    total_revenue: 0,
  });
  
  // Dialog states
  const [reviewDialog, setReviewDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [projectMapDialog, setProjectMapDialog] = useState(false);
  const [ipfsMediaDialog, setIpfsMediaDialog] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [aiAnalysisDialog, setAiAnalysisDialog] = useState(false);
  
  // Review form state
  const [reviewComments, setReviewComments] = useState('');
  const [reviewData, setReviewData] = useState({
    decision: '',
    comments: '',
    credits_awarded: '',
    compliance_notes: '',
  });


  useEffect(() => {
    console.log('AdminDashboard component mounted');
    loadDashboard();
    fetchAdminData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboard = async () => {
    try {
      console.log('Loading dashboard data...');
      const result = await adminAPI.getDashboard();
      console.log('Dashboard data loaded:', result);
      setDashboardData(result);
    } catch (error) {
      console.error('Dashboard loading error:', error);
      const errorInfo = handleAPIError(error);
      enqueueSnackbar(`Dashboard error: ${errorInfo.message}`, { variant: 'error' });
    }
  };

  const fetchAdminData = async () => {
    setRefreshing(true);
    try {
      console.log('Fetching admin data...');
      
      // First, always fetch full project details
      const projectsResponse = await fetch('http://localhost:8002/api/projects');
      const projectsData = await projectsResponse.json();
      const allProjects = projectsData.projects || [];
      
      // Try to fetch admin dashboard data (includes verification scores)
      let adminData = null;
      try {
        const adminResponse = await fetch('http://localhost:8002/api/admin/dashboard');
        console.log('Admin response status:', adminResponse.status);
        if (adminResponse.ok) {
          adminData = await adminResponse.json();
          console.log('Admin data:', adminData);
        }
      } catch (error) {
        console.log('Admin dashboard endpoint not available, using projects data directly');
      }
      
      // If admin dashboard is available, merge admin data with full project details
      if (adminData && adminData.recent_projects) {
        const projectsWithScores = adminData.recent_projects.map(adminProject => {
          const fullProject = allProjects.find(p => p.id === adminProject.id) || {};
          return {
            id: adminProject.id,
            project_name: adminProject.project_name,
            status: adminProject.status,
            verification_score: adminProject.verification_score || 0,
            ecosystem_type: fullProject.ecosystem_type || adminProject.ecosystem_type || 'unknown',
            area_hectares: fullProject.area_hectares || adminProject.area_hectares || 0,
            carbon_credits: adminProject.carbon_credits || fullProject.carbon_credits || 0,
            created_at: fullProject.created_at || adminProject.created_at || new Date().toISOString(),
            created_by: adminProject.created_by || fullProject.created_by || 'Unknown',
            ai_verification: fullProject.ai_verification || adminProject.ai_verification || null,
            enhanced_ai_verification: fullProject.enhanced_ai_verification || adminProject.enhanced_ai_verification || null,
            location: fullProject.location || null,
            field_measurements: fullProject.field_measurements || null,
            // Include enhanced fields from admin dashboard
            created_at_formatted: adminProject.created_at_formatted,
            contact_info: adminProject.contact_info,
            phone_number: adminProject.phone_number,
            organization: adminProject.organization,
            user_email: adminProject.user_email,
            reviewer_comments: adminProject.reviewer_comments || fullProject.reviewer_comments,
            reviewed_at: adminProject.reviewed_at || fullProject.reviewed_at,
            reviewed_by: adminProject.reviewed_by || fullProject.reviewed_by,
            // Include blockchain fields
            blockchain_tx_hash: fullProject.blockchain_tx || fullProject.blockchain_tx_hash,
            blockchain_tx: fullProject.blockchain_tx || fullProject.blockchain_tx_hash, 
            blockchain_id: fullProject.blockchain_id,
            blockchain_registered: Boolean(fullProject.blockchain_tx || fullProject.blockchain_tx_hash)
          };
        });
        setProjects(projectsWithScores);
        setDashboardData(adminData);
      } else {
        // Fallback: use projects data directly if admin dashboard is not available
        const enrichedProjects = allProjects.map(project => ({
          ...project,
          verification_score: project.verification_score || 0,
          created_by: project.created_by || 'Unknown',
          contact_info: project.contact_info || 'Contact information not available',
          // Include blockchain fields
          blockchain_tx_hash: project.blockchain_tx || project.blockchain_tx_hash,
          blockchain_tx: project.blockchain_tx || project.blockchain_tx_hash,
          blockchain_id: project.blockchain_id,
          blockchain_registered: Boolean(project.blockchain_tx || project.blockchain_tx_hash)
        }));
        setProjects(enrichedProjects);
        setDashboardData({
          recent_projects: enrichedProjects,
          pending_projects: enrichedProjects.filter(p => p.status === 'pending_verification' || p.status === 'requires_review'),
          statistics: {
            total_projects: enrichedProjects.length,
            pending_review: enrichedProjects.filter(p => p.status === 'pending_verification' || p.status === 'requires_review').length,
            approved_projects: enrichedProjects.filter(p => p.status === 'approved').length,
            rejected_projects: enrichedProjects.filter(p => p.status === 'rejected').length
          }
        });
      }
      
      setAdminStats(adminData?.statistics || {});
      console.log('Admin data fetch completed');
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      enqueueSnackbar(`Admin data fetch failed: ${error.message}`, { variant: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  const fetchVerificationData = async (projectId) => {
    try {
      console.log('Fetching verification data for project:', projectId);
      const response = await fetch(`http://localhost:8002/api/projects/${projectId}/verification`);
      console.log('Verification response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Verification data received:', data);
        console.log('Enhanced AI verification:', data.enhanced_ai_verification);
        setVerificationData(data);
        return data;
      } else {
        const errorText = await response.text();
        console.warn('No verification data available for project:', projectId, 'Error:', errorText);
        setVerificationData(null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching verification data:', error);
      setVerificationData(null);
      return null;
    }
  };

  const enrichProjectWithAdminData = (project) => {
    // Try to find enhanced data from admin dashboard
    const adminProject = dashboardData?.recent_projects?.find(p => p.id === project.id);
    if (adminProject) {
      return {
        ...project,
        created_at_formatted: adminProject.created_at_formatted,
        contact_info: adminProject.contact_info,
        created_by: adminProject.created_by || project.created_by,
        phone_number: adminProject.phone_number,
        organization: adminProject.organization,
        user_email: adminProject.user_email
      };
    }
    return project;
  };

  const formatContactInfo = (contactInfo) => {
    if (!contactInfo || contactInfo === 'No contact info available') {
      return contactInfo;
    }
    
    // Replace pipe separators with bullet points for better readability
    return contactInfo.replace(/\s*\|\s*/g, ' • ');
  };

  const openProjectDetails = async (project) => {
    const enrichedProject = enrichProjectWithAdminData(project);
    setSelectedProject(enrichedProject);
    setDetailsDialog(true);
    // Fetch verification data when opening project details
    await fetchVerificationData(project.id);
  };

  const viewBlockchainTransaction = async (project) => {
    try {
      if (!project.blockchain_tx_hash && !project.blockchain_tx) {
        enqueueSnackbar('No blockchain transaction found for this project', { variant: 'warning' });
        return;
      }

      const txHash = project.blockchain_tx_hash || project.blockchain_tx;
      
      // Show transaction details in a dialog
      const blockchainInfo = {
        txHash: txHash,
        blockchainId: project.blockchain_id,
        explorerUrl: `https://amoy.polygonscan.com/tx/${txHash}`,
        network: 'Polygon Amoy Testnet',
        projectName: project.project_name || project.title
      };

      // Create confirmation dialog with transaction details
      const confirmed = window.confirm(
        `🔗 Blockchain Transaction Details\n\n` +
        `Project: ${blockchainInfo.projectName}\n` +
        `Network: ${blockchainInfo.network}\n` +
        `Transaction Hash: ${blockchainInfo.txHash}\n` +
        `${blockchainInfo.blockchainId ? `Blockchain ID: ${blockchainInfo.blockchainId}\n` : ''}` +
        `\nClick OK to view on PolygonScan (Amoy Testnet)`
      );
      
      if (confirmed) {
        // Open PolygonScan with the transaction
        window.open(blockchainInfo.explorerUrl, '_blank', 'noopener,noreferrer');
        
        // Show success message
        enqueueSnackbar(`Opening transaction ${txHash.substring(0, 10)}... on PolygonScan`, { 
          variant: 'success',
          autoHideDuration: 4000 
        });
      }

    } catch (error) {
      console.error('Error viewing blockchain transaction:', error);
      enqueueSnackbar('Failed to open blockchain transaction', { variant: 'error' });
    }
  };

  const calculateSuggestedCredits = (project) => {
    if (!project) return 0;
    
    const area = project.area_hectares || 0;
    const ecosystem = project.ecosystem_type || 'unknown';
    
    // Carbon sequestration rates per hectare per year (tCO2/ha/year)
    const carbonRates = {
      'mangrove': 10.5, // High carbon sequestration
      'salt_marsh': 8.2,
      'seagrass': 6.8,
      'coastal_wetland': 7.5,
      'unknown': 5.0
    };
    
    const rate = carbonRates[ecosystem] || carbonRates['unknown'];
    const suggestedCredits = Math.round(area * rate);
    
    return suggestedCredits;
  };

  const getUnitForMeasurement = (key) => {
    const units = {
      'ph_level': '',
      'temperature': '°C',
      'salinity_ppt': 'ppt',
      'dissolved_oxygen': 'mg/L',
      'turbidity': 'NTU',
      'carbon_content': '%',
      'organic_matter': '%',
      'nitrogen_content': '%',
      'species_count': ' species',
      'vegetation_cover': '%',
      'average_plant_height': 'cm',
      'canopy_cover': '%',
      'root_depth': 'cm'
    };
    return units[key] || '';
  };

  const handleReview = async (action) => {
    try {
      await adminAPI.reviewProject(selectedProject.id, action, reviewComments);
      enqueueSnackbar(`Project ${action}d successfully`, { variant: 'success' });
      setReviewDialog(false);
      setReviewComments('');
      loadDashboard();
      fetchAdminData();
    } catch (error) {
      const errorInfo = handleAPIError(error);
      enqueueSnackbar(errorInfo.message, { variant: 'error' });
    }
  };

  // Helper function to check if a project can be reviewed
  const canReviewProject = (project) => {
    const status = project.status?.toLowerCase();
    return status === 'submitted' || status === 'pending' || status === 'pending_verification' || status === 'requires_review';
  };

  const handleProjectReview = async (projectId, decision) => {
    // Check if project can still be reviewed
    const project = projects.find(p => p.id === projectId);
    if (project && !canReviewProject(project)) {
      enqueueSnackbar('This project has already been reviewed and cannot be reviewed again', { variant: 'error' });
      setReviewDialog(false);
      return;
    }

    setLoading(true);
    try {
      const creditsToAward = decision === 'approved' ? (parseFloat(reviewData.credits_awarded) || 0) : 0;
      
      console.log('🔍 DEBUG: Review submission data:', {
        decision,
        reviewData,
        credits_awarded_raw: reviewData.credits_awarded,
        credits_awarded_parsed: creditsToAward
      });
      
      if (decision === 'approved' && creditsToAward <= 0) {
        enqueueSnackbar('Please enter a valid number of carbon credits to award', { variant: 'error' });
        setLoading(false);
        return;
      }
      
      const payload = {
        decision,
        comments: reviewData.comments || '',
        compliance_notes: reviewData.compliance_notes || '',
        credits_awarded: creditsToAward,
        reviewer_id: 'admin_user',
        review_timestamp: new Date().toISOString(),
      };
      
      console.log('🔍 DEBUG: Final payload being sent:', payload);
      
      const response = await fetch(`http://localhost:8002/api/admin/projects/${projectId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        await response.json();
        const creditsMsg = creditsToAward > 0 ? ` and awarded ${creditsToAward} tCO₂ credits` : '';
        enqueueSnackbar(`Project ${decision} successfully${creditsMsg}`, { variant: 'success' });
        fetchAdminData(); // Refresh data
        setReviewDialog(false);
        setReviewData({ decision: '', comments: '', credits_awarded: '', compliance_notes: '' });
      } else {
        throw new Error('Review submission failed');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      enqueueSnackbar('Failed to submit review', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('userInfo');
    localStorage.removeItem('auth_token');
    
    // Navigate to login
    navigate('/login');
  };

  // PDF Export Functions
  const downloadAllProjectsPDF = async () => {
    try {
      setLoading(true);
      enqueueSnackbar('Generating all projects PDF report...', { variant: 'info' });
      
      const response = await fetch('http://localhost:8002/api/admin/export-all-projects');
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `all_projects_report_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        enqueueSnackbar('All projects PDF downloaded successfully!', { variant: 'success' });
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      enqueueSnackbar('Failed to download PDF report', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const downloadProjectDetailedPDF = async (projectId) => {
    try {
      setLoading(true);
      enqueueSnackbar('Generating detailed project report...', { variant: 'info' });
      
      const response = await fetch(`http://localhost:8002/api/admin/export-project/${projectId}/pdf`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `project_${projectId}_detailed_report_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        enqueueSnackbar('Project detailed PDF downloaded successfully!', { variant: 'success' });
      } else {
        throw new Error('Failed to generate detailed PDF');
      }
    } catch (error) {
      console.error('Error downloading detailed PDF:', error);
      enqueueSnackbar('Failed to download detailed PDF report', { variant: 'error' });
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
      case 'under_review': return 'primary';
      case 'submitted': return 'warning';  // Orange color for submitted
      case 'pending_review': return 'warning';  // Orange color for pending review
      default: return 'primary';  // Blue as default instead of gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <ApprovedIcon />;
      case 'rejected': return <RejectedIcon />;
      case 'pending_verification': return <PendingIcon />;
      case 'requires_review': return <WarningIcon />;
      case 'under_review': return <VerifiedIcon />;
      default: return <PendingIcon />;
    }
  };

  const renderDashboardTab = () => (
    <Box>
      {/* Hero Section with Enhanced Design */}
      <Card 
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.35) 0%, rgba(74, 144, 226, 0.3) 50%, rgba(52, 211, 153, 0.25) 100%)',
          border: '3px solid rgba(138, 43, 226, 0.6)',
          borderRadius: '28px',
          overflow: 'hidden',
          position: 'relative',
          minHeight: '220px',
          backdropFilter: 'blur(25px)',
          boxShadow: '0 25px 80px rgba(138, 43, 226, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mr: 3,
                    background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
                    fontSize: '2.5rem',
                    boxShadow: '0 12px 40px rgba(138, 43, 226, 0.6)',
                  }}
                >
                  🏛️
                </Avatar>
                <Box>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 900,
                      background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 50%, #34D399 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      mb: 1,
                      lineHeight: 1.2,
                    }}
                  >
                    NCCR Admin Portal
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.9) !important',
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    National Centre for Coastal Research
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7) !important',
                      fontSize: '1.1rem',
                      fontWeight: 400,
                    }}
                  >
                    🌊 Blue Carbon MRV System Administration Dashboard
                  </Typography>
                </Box>
              </Box>
              
              {/* Quick Stats Row */}
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Typography variant="h3" sx={{ color: '#34D399 !important', fontWeight: 800 }}>
                      {dashboardData?.statistics?.total_projects || projects.length || 0}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8) !important', fontSize: '0.9rem' }}>Projects</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Typography variant="h3" sx={{ color: '#FF9800 !important', fontWeight: 800 }}>
                      {projects.filter(p => p.status !== 'approved' && p.status !== 'rejected').length || 0}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8) !important', fontSize: '0.9rem' }}>Pending Review</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Typography variant="h3" sx={{ color: '#4CAF50 !important', fontWeight: 800 }}>
                      {dashboardData?.statistics?.approved || projects.filter(p => p.status === 'approved').length || 0}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8) !important', fontSize: '0.9rem' }}>Approved</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Typography variant="h3" sx={{ color: '#F44336 !important', fontWeight: 800 }}>
                      {projects.filter(p => p.verification_score < 60).length || 0}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8) !important', fontSize: '0.9rem' }}>AI Flagged</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'right' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<RefreshIcon />}
                    onClick={() => { loadDashboard(); fetchAdminData(); }}
                    disabled={refreshing}
                    sx={{
                      background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                      boxShadow: '0 8px 25px rgba(52, 211, 153, 0.4)',
                      borderRadius: '16px',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 700,
                      minWidth: 180,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        boxShadow: '0 12px 35px rgba(52, 211, 153, 0.6)',
                        transform: 'translateY(-3px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                      background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                      boxShadow: '0 8px 25px rgba(220, 38, 38, 0.4)',
                      borderRadius: '16px',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 700,
                      minWidth: 180,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
                        boxShadow: '0 12px 35px rgba(220, 38, 38, 0.6)',
                        transform: 'translateY(-3px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Admin Logout
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
        
        {/* Enhanced Background decorations */}
        <Box 
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(138, 43, 226, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box 
          sx={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74, 144, 226, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      </Card>
      
      {/* Main Statistics Grid */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{
              background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(138, 43, 226, 0.4) 100%)',
              border: '3px solid rgba(138, 43, 226, 0.6)',
              height: '180px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(138, 43, 226, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              '&:hover': {
                transform: 'translateY(-12px) scale(1.05)',
                boxShadow: '0 30px 70px rgba(138, 43, 226, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                borderColor: 'rgba(138, 43, 226, 0.8)',
              },
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8) !important', fontSize: '0.95rem', fontWeight: 600, mb: 1 }}>
                    📊 Total Projects
                  </Typography>
                  <Typography variant="h1" sx={{ color: '#FFFFFF !important', fontWeight: 900, fontSize: '3rem', lineHeight: 1 }}>
                    {dashboardData?.statistics?.total_projects || projects.length || 0}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(138, 43, 226, 0.8)',
                    width: 70,
                    height: 70,
                    boxShadow: '0 8px 25px rgba(138, 43, 226, 0.6)',
                  }}
                >
                  <DashboardIcon sx={{ fontSize: 36 }} />
                </Avatar>
              </Box>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7) !important', fontSize: '0.9rem', fontWeight: 500 }}>
                Active Submissions in System
              </Typography>
            </CardContent>
            <Box 
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(138, 43, 226, 0.3) 0%, transparent 70%)',
              }}
            />
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 152, 0, 0.3) 100%)',
              border: '2px solid rgba(255, 152, 0, 0.4)',
              height: '160px',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 20px 50px rgba(255, 152, 0, 0.5)',
              },
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8) !important', fontSize: '0.95rem', fontWeight: 600, mb: 1 }}>
                    ⏳ Pending Review
                  </Typography>
                  <Typography variant="h1" sx={{ color: '#FFFFFF !important', fontWeight: 900, fontSize: '3rem', lineHeight: 1 }}>
                    {projects.filter(p => p.status !== 'approved' && p.status !== 'rejected').length || 0}
                  </Typography>
                </Box>
                <Badge badgeContent={projects.filter(p => p.status !== 'approved' && p.status !== 'rejected').length} color="error">
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255, 152, 0, 0.8)',
                      width: 70,
                      height: 70,
                      boxShadow: '0 8px 25px rgba(255, 152, 0, 0.6)',
                    }}
                  >
                    <PendingIcon sx={{ fontSize: 36 }} />
                  </Avatar>
                </Badge>
              </Box>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7) !important', fontSize: '0.9rem', fontWeight: 500 }}>
                Awaiting Admin Approval
              </Typography>
            </CardContent>
            <Box 
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 152, 0, 0.3) 0%, transparent 70%)',
              }}
            />
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.3) 100%)',
              border: '2px solid rgba(76, 175, 80, 0.4)',
              height: '160px',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 20px 50px rgba(76, 175, 80, 0.5)',
              },
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8) !important', fontSize: '0.95rem', fontWeight: 600, mb: 1 }}>
                    ✅ Approved Projects
                  </Typography>
                  <Typography variant="h1" sx={{ color: '#FFFFFF !important', fontWeight: 900, fontSize: '3rem', lineHeight: 1 }}>
                    {dashboardData?.statistics?.approved || projects.filter(p => p.status === 'approved').length || 0}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(76, 175, 80, 0.8)',
                    width: 70,
                    height: 70,
                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.6)',
                  }}
                >
                  <ApprovedIcon sx={{ fontSize: 36 }} />
                </Avatar>
              </Box>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7) !important', fontSize: '0.9rem', fontWeight: 500 }}>
                Successfully Verified Projects
              </Typography>
            </CardContent>
            <Box 
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(76, 175, 80, 0.3) 0%, transparent 70%)',
              }}
            />
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(244, 67, 54, 0.3) 100%)',
              border: '2px solid rgba(244, 67, 54, 0.4)',
              height: '160px',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 20px 50px rgba(244, 67, 54, 0.5)',
              },
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8) !important', fontSize: '0.95rem', fontWeight: 600, mb: 1 }}>
                    🚨 AI Flagged
                  </Typography>
                  <Typography variant="h1" sx={{ color: '#FFFFFF !important', fontWeight: 900, fontSize: '3rem', lineHeight: 1 }}>
                    {projects.filter(p => (p.verification_score || 0) < 70).length || 0}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(244, 67, 54, 0.8)',
                    width: 70,
                    height: 70,
                    boxShadow: '0 8px 25px rgba(244, 67, 54, 0.6)',
                  }}
                >
                  <WarningIcon sx={{ fontSize: 36 }} />
                </Avatar>
              </Box>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7) !important', fontSize: '0.9rem', fontWeight: 500 }}>
                Requires Immediate Attention
              </Typography>
            </CardContent>
            <Box 
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(244, 67, 54, 0.3) 0%, transparent 70%)',
              }}
            />
          </Card>
        </Grid>
      </Grid>

      {/* Action Center */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(138, 43, 226, 0.15) 100%)',
            border: '2px solid rgba(244, 67, 54, 0.4)',
            boxShadow: '0 12px 40px rgba(244, 67, 54, 0.3)',
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #F44336 0%, #8A2BE2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  textShadow: '0 2px 8px rgba(244, 67, 54, 0.5)',
                }}
              >
                🚨 AI Verification Alerts
                <Chip 
                  label="Real-time" 
                  size="small" 
                  sx={{ 
                    background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                  }} 
                />
              </Typography>
              
              {projects.filter(p => p.verification_score < 70).length > 0 ? (
                <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {projects
                    .filter(p => p.verification_score < 70)
                    .slice(0, 5)
                    .map((project) => (
                      <ListItem 
                        key={project.id} 
                        sx={{
                          mb: 1,
                          borderRadius: '12px',
                          border: '1px solid rgba(244, 67, 54, 0.3)',
                          backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        }}
                      >
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: '#F44336', width: 40, height: 40 }}>
                            <WarningIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#FFFFFF !important' }}>
                              {project.project_name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8) !important' }}>
                                AI Score: {project.verification_score || 0}/100
                              </Typography>
                              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6) !important', fontSize: '0.85rem' }}>
                                Flagged: {project.ai_verification?.flags?.join(', ') || 'Low verification score'}
                              </Typography>
                            </Box>
                          }
                        />
                        <Button
                          variant="contained"
                          size="medium"
                          onClick={() => openProjectDetails(project)}
                          sx={{
                            background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
                            borderRadius: '10px',
                            fontWeight: 600,
                            px: 3,
                          }}
                        >
                          Review Now
                        </Button>
                      </ListItem>
                    ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Avatar sx={{ bgcolor: '#4CAF50', width: 80, height: 80, mx: 'auto', mb: 2 }}>
                    <CheckCircle sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ color: '#4CAF50 !important', mb: 1 }}>All Clear!</Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7) !important' }}>No AI verification alerts at this time</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderProjectsTab = () => (
    <Box>
      {/* Header Section with Actions */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.25) 0%, rgba(74, 144, 226, 0.25) 100%)',
        border: '2px solid rgba(138, 43, 226, 0.4)',
        boxShadow: '0 12px 40px rgba(138, 43, 226, 0.3)',
      }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 1,
                }}
              >
                🔍 Project Management & Review
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8) !important' }}>
                Comprehensive project oversight and verification workflow
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={() => { loadDashboard(); fetchAdminData(); }}
                  disabled={refreshing}
                  sx={{
                    background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                    boxShadow: '0 8px 25px rgba(52, 211, 153, 0.4)',
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={downloadAllProjectsPDF}
                  disabled={loading}
                  sx={{
                    borderColor: '#8A2BE2',
                    color: '#8A2BE2 !important',
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#FFFFFF',
                      color: '#FFFFFF !important',
                      backgroundColor: 'rgba(138, 43, 226, 0.1)',
                    },
                  }}
                >
                  {loading ? 'Generating...' : 'Export Data'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Enhanced Projects Table */}
      <Card sx={{ 
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(28, 28, 40, 0.9) 0%, rgba(138, 43, 226, 0.1) 100%)',
        border: '2px solid rgba(138, 43, 226, 0.4)',
        boxShadow: '0 15px 50px rgba(138, 43, 226, 0.3)',
      }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer 
            component={Paper} 
            sx={{ 
              backgroundColor: 'transparent',
              maxHeight: '600px',
              '& .MuiTableHead-root': {
                position: 'sticky',
                top: 0,
                zIndex: 1,
                backgroundColor: 'rgba(138, 43, 226, 0.3)',
                backdropFilter: 'blur(10px)',
              }
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    fontSize: '1rem',
                    color: '#FFFFFF !important',
                    background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    textShadow: '0 2px 4px rgba(138, 43, 226, 0.3)',
                  }}>Project Info</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    fontSize: '1rem',
                    color: '#FFFFFF !important',
                    background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    textShadow: '0 2px 4px rgba(138, 43, 226, 0.3)',
                  }}>Ecosystem & Area</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    fontSize: '1rem',
                    color: '#FFFFFF !important',
                    background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    textShadow: '0 2px 4px rgba(138, 43, 226, 0.3)',
                  }}>AI Verification</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    fontSize: '1rem',
                    color: '#FFFFFF !important',
                    background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    textShadow: '0 2px 4px rgba(138, 43, 226, 0.3)',
                  }}>Status</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    fontSize: '1rem',
                    color: '#FFFFFF !important',
                    background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    textShadow: '0 2px 4px rgba(138, 43, 226, 0.3)',
                  }}>Submitted</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    fontSize: '1rem', 
                    textAlign: 'center',
                    color: '#FFFFFF !important',
                    background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    textShadow: '0 2px 4px rgba(138, 43, 226, 0.3)',
                  }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(projects.length > 0 ? projects : dashboardData?.pending_projects || []).map((project) => (
                  <TableRow 
                    key={project.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(138, 43, 226, 0.2)',
                        transform: 'scale(1.02)',
                        boxShadow: '0 8px 30px rgba(138, 43, 226, 0.5)',
                        borderLeft: `6px solid ${getMarkerColor(project.status)}`,
                      },
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      borderLeft: `4px solid ${getMarkerColor(project.status)}`,
                      backgroundColor: 'rgba(28, 28, 40, 0.5)',
                    }}
                  >
                    <TableCell sx={{ minWidth: 200 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#FFFFFF !important', mb: 0.5 }}>
                          {project.project_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7) !important' }}>
                          ID: {project.id}
                        </Typography>
                        <br />
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6) !important' }}>
                          by {project.created_by}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Chip
                          label={project.ecosystem_type?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #4A90E2 0%, #8A2BE2 100%)',
                            color: '#FFFFFF',
                            fontWeight: 600,
                            borderRadius: '8px',
                          }}
                        />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8) !important', fontWeight: 600 }}>
                          {project.area_hectares} hectares
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Typography variant="body2" fontWeight={700} sx={{ color: '#FFFFFF !important' }}>
                            {project.verification_score || 0}/100
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={project.verification_score || 0}
                            sx={{ 
                              flexGrow: 1, 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: project.verification_score >= 80 
                                  ? 'linear-gradient(90deg, #4CAF50 0%, #34D399 100%)'
                                  : project.verification_score >= 60 
                                    ? 'linear-gradient(90deg, #FF9800 0%, #FFC107 100%)'
                                    : 'linear-gradient(90deg, #F44336 0%, #EF5350 100%)',
                              },
                            }}
                          />
                        </Box>
                        {project.verification_score < 70 && (
                          <Chip
                            icon={<WarningIcon />}
                            label="AI Flagged"
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(244, 67, 54, 0.2)',
                              color: '#F44336 !important',
                              border: '1px solid rgba(244, 67, 54, 0.4)',
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(project.status)}
                        label={project.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                        sx={{
                          background: project.status === 'approved' 
                            ? 'linear-gradient(135deg, #4CAF50 0%, #34D399 100%)'
                            : project.status === 'rejected'
                              ? 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)'
                              : project.status === 'pending_verification'
                                ? 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)'
                                : 'linear-gradient(135deg, #2196F3 0%, #4A90E2 100%)',
                          color: '#FFFFFF',
                          fontWeight: 600,
                          borderRadius: '8px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8) !important' }}>
                        {project.created_at_formatted || new Date(project.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Tooltip title="View Complete Details" arrow>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => openProjectDetails(project)}
                            sx={{
                              background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
                              minWidth: 'auto',
                              borderRadius: '8px',
                              px: 2,
                              '&:hover': {
                                background: 'linear-gradient(135deg, #9333EA 0%, #4A90E2 100%)',
                              },
                            }}
                          >
                            <ViewIcon sx={{ fontSize: 18 }} />
                          </Button>
                        </Tooltip>
                        
                        {(project.blockchain_tx_hash || project.blockchain_tx) && (
                          <Tooltip title="View on Blockchain" arrow>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => viewBlockchainTransaction(project)}
                              sx={{
                                borderColor: '#FF6B35',
                                color: '#FF6B35 !important',
                                minWidth: 'auto',
                                borderRadius: '8px',
                                px: 2,
                                '&:hover': {
                                  borderColor: '#FFFFFF',
                                  color: '#FFFFFF !important',
                                  backgroundColor: 'rgba(255, 107, 53, 0.1)',
                                },
                              }}
                            >
                              <BlockchainIcon sx={{ fontSize: 18 }} />
                            </Button>
                          </Tooltip>
                        )}
                        
                        {project.location && project.location.lat && project.location.lng && (
                          <Tooltip title="Show Location on Map" arrow>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => {
                                const enrichedProject = enrichProjectWithAdminData(project);
                                setSelectedProject(enrichedProject);
                                setProjectMapDialog(true);
                              }}
                              sx={{
                                background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                                minWidth: 'auto',
                                borderRadius: '8px',
                                px: 2,
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                },
                              }}
                            >
                              <MapIcon sx={{ fontSize: 18 }} />
                            </Button>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="View IPFS Media" arrow>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              const enrichedProject = enrichProjectWithAdminData(project);
                              setSelectedProject(enrichedProject);
                              setIpfsMediaDialog(true);
                            }}
                            sx={{
                              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                              minWidth: 'auto',
                              borderRadius: '8px',
                              px: 2,
                              '&:hover': {
                                background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)',
                              },
                            }}
                          >
                            <MediaIcon sx={{ fontSize: 18 }} />
                          </Button>
                        </Tooltip>
                      </Box>
                      
                      {/* Dedicated Review Action Row */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          disabled={!canReviewProject(project)}
                          onClick={() => {
                            if (!canReviewProject(project)) {
                              enqueueSnackbar('This project has already been reviewed', { variant: 'warning' });
                              return;
                            }
                            const enrichedProject = enrichProjectWithAdminData(project);
                            setSelectedProject(enrichedProject);
                            setReviewDialog(true);
                          }}
                          sx={{
                            background: !canReviewProject(project) 
                              ? 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)'
                              : 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
                            borderRadius: '8px',
                            fontWeight: 600,
                            maxWidth: '120px',
                            '&:hover': {
                              background: !canReviewProject(project)
                                ? 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)'
                                : 'linear-gradient(135deg, #9333EA 0%, #4A90E2 100%)',
                              transform: canReviewProject(project) ? 'translateY(-1px)' : 'none',
                            },
                            '&:disabled': {
                              color: 'white',
                              opacity: 0.6
                            }
                          }}
                        >
                          {canReviewProject(project) ? 'Review Project' : 'Already Reviewed'}
                        </Button>
                      </Box>
                      
                      {(project.status === 'pending_verification' || project.status === 'requires_review' || !project.status) && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                          <Tooltip title="Review & Approve Project" arrow>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => {
                                const enrichedProject = enrichProjectWithAdminData(project);
                                setSelectedProject(enrichedProject);
                                setReviewDialog(true);
                              }}
                              sx={{
                                background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                                minWidth: 'auto',
                                borderRadius: '8px',
                                px: 2,
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
                                },
                              }}
                            >
                              <EditIcon sx={{ fontSize: 18 }} />
                            </Button>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* No Projects State */}
          {projects.length === 0 && !dashboardData?.pending_projects?.length && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Avatar sx={{ bgcolor: '#8A2BE2', width: 80, height: 80, mx: 'auto', mb: 2 }}>
                <DashboardIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" sx={{ color: '#FFFFFF !important', mb: 1 }}>No Projects Found</Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7) !important' }}>Projects will appear here once submitted for review</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Legacy Project Cards - Enhanced Design */}
      {dashboardData?.pending_projects?.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 3,
            }}
          >
            📄 Legacy Projects Pending Review
          </Typography>
          <Grid container spacing={3}>
            {dashboardData.pending_projects.map((project) => (
              <Grid item xs={12} key={project.id}>
                <Card 
                  sx={{
                    background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(74, 144, 226, 0.1) 100%)',
                    border: '2px solid rgba(138, 43, 226, 0.3)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(138, 43, 226, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} md={8}>
                        <Box>
                          <Typography variant="h5" sx={{ color: '#FFFFFF !important', fontWeight: 700, mb: 1 }}>
                            {project.project_name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                            <Chip 
                              label={project.ecosystem_type?.replace('_', ' ').toUpperCase() || 'UNKNOWN'} 
                              sx={{
                                background: 'linear-gradient(135deg, #4A90E2 0%, #8A2BE2 100%)',
                                color: '#FFFFFF',
                                fontWeight: 600,
                              }}
                            />
                            <Chip 
                              label={`${project.area_hectares} hectares`} 
                              sx={{
                                background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                                color: '#FFFFFF',
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8) !important' }}>
                            Created: {project.created_at_formatted || new Date(project.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <Button
                            variant="outlined"
                            startIcon={<ViewIcon />}
                            onClick={() => openProjectDetails(project)}
                            sx={{
                              borderColor: '#4A90E2',
                              color: '#4A90E2 !important',
                              borderRadius: '12px',
                              px: 3,
                              py: 1,
                              fontWeight: 600,
                              '&:hover': {
                                borderColor: '#FFFFFF',
                                color: '#FFFFFF !important',
                                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                              },
                            }}
                          >    
                            View Details
                          </Button>
                          {(project.blockchain_tx_hash || project.blockchain_tx) && (
                            <Button
                              variant="outlined"
                              startIcon={<BlockchainIcon />}
                              onClick={() => viewBlockchainTransaction(project)}
                              sx={{
                                borderColor: '#FF6B35',
                                color: '#FF6B35 !important',
                                borderRadius: '12px',
                                px: 3,
                                py: 1,
                                fontWeight: 600,
                                '&:hover': {
                                  borderColor: '#FFFFFF',
                                  color: '#FFFFFF !important',
                                  backgroundColor: 'rgba(255, 107, 53, 0.1)',
                                },
                              }}
                            >
                              View on Blockchain
                            </Button>
                          )}
                          <Button
                            variant="contained"
                            startIcon={<CheckCircle />}
                            disabled={!canReviewProject(project)}
                            onClick={() => {
                              if (!canReviewProject(project)) {
                                enqueueSnackbar('This project has already been reviewed', { variant: 'warning' });
                                return;
                              }
                              const enrichedProject = enrichProjectWithAdminData(project);
                              setSelectedProject(enrichedProject);
                              setReviewDialog(true);
                            }}
                            sx={{
                              background: !canReviewProject(project)
                                ? 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)'
                                : 'linear-gradient(135deg, #4CAF50 0%, #34D399 100%)',
                              boxShadow: canReviewProject(project) ? '0 8px 25px rgba(76, 175, 80, 0.4)' : 'none',
                              borderRadius: '12px',
                              px: 3,
                              py: 1,
                              fontWeight: 600,
                              '&:hover': {
                                background: !canReviewProject(project)
                                  ? 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)'
                                  : 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                                transform: canReviewProject(project) ? 'translateY(-2px)' : 'none',
                              },
                              '&:disabled': {
                                color: 'white',
                                opacity: 0.6
                              }
                            }}
                          >
                            {canReviewProject(project) ? 'Review Project' : 'Already Reviewed'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );

  const renderAnalyticsTab = () => {
    console.log('Analytics Debug - Projects:', projects.length, projects.map(p => ({id: p.id, status: p.status, ecosystem: p.ecosystem_type, credits: p.carbon_credits})));
    return (
    <Box>
      <Typography variant="h5" gutterBottom>📊 Analytics & Reports</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Carbon Credits Overview
              </Typography>
              <Typography variant="h3" color="primary">
                {projects.reduce((sum, p) => {
                  const credits = p.carbon_credits || p.carbon_impact || p.carbon_estimate || p.credits_awarded || 0;
                  return sum + (typeof credits === 'number' ? credits : parseFloat(credits) || 0);
                }, 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total tCO₂ Credits Issued
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🌿 Ecosystem Breakdown
              </Typography>
              {['mangrove', 'seagrass', 'salt_marsh', 'coastal_wetland'].map((ecosystem) => {
                const count = projects.filter(p => {
                  const projectEcosystem = p.ecosystem_type || p.ecosystem || '';
                  return projectEcosystem.toLowerCase() === ecosystem.toLowerCase();
                }).length;
                const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0;
                return (
                  <Box key={ecosystem} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">
                        {ecosystem.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Typography variant="body2">{count}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Project Status Distribution
              </Typography>
              <Grid container spacing={2}>
                {[
                  { status: 'total', label: 'TOTAL PROJECTS', color: 'primary' },
                  { status: 'approved', label: 'APPROVED', color: 'success' },
                  { status: 'pending', label: 'PENDING REVIEW', color: 'warning' },
                  { status: 'rejected', label: 'REJECTED', color: 'error' },
                  { status: 'ai_flagged', label: 'AI FLAGGED', color: 'error' }
                ].map(({ status, label, color }) => {
                  let count = 0;
                  if (status === 'total') {
                    count = projects.length;
                  } else if (status === 'pending') {
                    count = projects.filter(p => p.status !== 'approved' && p.status !== 'rejected').length;
                  } else if (status === 'ai_flagged') {
                    count = projects.filter(p => (p.verification_score || 0) < 70).length;
                  } else {
                    count = projects.filter(p => p.status === status).length;
                  }
                  return (
                    <Grid item xs={6} sm={3} md={2.4} key={status}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color={color + '.main'}>
                            {count}
                          </Typography>
                          <Typography variant="body2">
                            {label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
    );
  };

  const renderReviewProjectsTab = () => (
    <Box>
      {/* Header Section */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.25) 0%, rgba(74, 144, 226, 0.25) 100%)',
        border: '2px solid rgba(138, 43, 226, 0.4)',
        boxShadow: '0 12px 40px rgba(138, 43, 226, 0.3)',
      }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 1,
                }}
              >
                ✅ Project Review Center
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8) !important' }}>
                Comprehensive project review and approval workflow
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={() => { loadDashboard(); fetchAdminData(); }}
                  disabled={refreshing}
                  sx={{
                    background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                    boxShadow: '0 8px 25px rgba(52, 211, 153, 0.4)',
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={downloadAllProjectsPDF}
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
                    boxShadow: '0 8px 25px rgba(138, 43, 226, 0.4)',
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #9333EA 0%, #4A90E2 100%)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)',
                      transform: 'none',
                    },
                  }}
                >
                  {loading ? 'Generating...' : 'Export Report'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Project Review Cards */}
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card 
              sx={{
                background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(74, 144, 226, 0.1) 100%)',
                border: '2px solid rgba(138, 43, 226, 0.3)',
                borderRadius: '16px',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(138, 43, 226, 0.4)',
                  borderColor: 'rgba(138, 43, 226, 0.6)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                {/* Project Header */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#FFFFFF !important', fontWeight: 700, mb: 1 }}>
                    {project.project_name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      icon={getStatusIcon(project.status)}
                      label={project.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                      sx={{
                        background: project.status === 'approved' 
                          ? 'linear-gradient(135deg, #4CAF50 0%, #34D399 100%)'
                          : project.status === 'rejected'
                            ? 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)'
                            : 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
                        color: '#FFFFFF',
                        fontWeight: 600,
                      }}
                    />
                    <Chip 
                      label={project.ecosystem_type?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                      sx={{
                        background: 'linear-gradient(135deg, #4A90E2 0%, #8A2BE2 100%)',
                        color: '#FFFFFF',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>

                {/* Project Details */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8) !important', mb: 1 }}>
                    <strong>ID:</strong> {project.id}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8) !important', mb: 1 }}>
                    <strong>Area:</strong> {project.area_hectares} hectares
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8) !important', mb: 1 }}>
                    <strong>Created:</strong> {project.created_at_formatted || new Date(project.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8) !important', mb: 1 }}>
                    <strong>Created by:</strong> {project.created_by}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8) !important', mb: 1 }}>
                    <strong>Carbon Credits:</strong> {project.carbon_credits || project.carbon_impact || project.credits_awarded || 0} tCO₂
                  </Typography>
                </Box>

                {/* AI Verification Score */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8) !important', mb: 1 }}>
                    <strong>AI Verification Score:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={project.verification_score || 0}
                      sx={{ 
                        flexGrow: 1, 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: (project.verification_score || 0) >= 80 
                            ? 'linear-gradient(90deg, #4CAF50 0%, #34D399 100%)'
                            : (project.verification_score || 0) >= 60 
                              ? 'linear-gradient(90deg, #FF9800 0%, #FFC107 100%)'
                              : 'linear-gradient(90deg, #F44336 0%, #EF5350 100%)',
                        },
                      }}
                    />
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#FFFFFF !important' }}>
                      {project.verification_score || 0}/100
                    </Typography>
                  </Box>
                  {(project.verification_score || 0) < 70 && (
                    <Chip
                      icon={<WarningIcon />}
                      label="AI Flagged"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(244, 67, 54, 0.2)',
                        color: '#F44336 !important',
                        border: '1px solid rgba(244, 67, 54, 0.4)',
                        mt: 1
                      }}
                    />
                  )}
                </Box>
              </CardContent>

              {/* Action Buttons */}
              <Box sx={{ p: 3, pt: 0 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<ViewIcon />}
                      onClick={() => openProjectDetails(project)}
                      sx={{
                        borderColor: '#4A90E2',
                        color: '#4A90E2 !important',
                        borderRadius: '12px',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#FFFFFF',
                          color: '#FFFFFF !important',
                          backgroundColor: 'rgba(74, 144, 226, 0.1)',
                        },
                      }}
                    >
                      Details
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<EditIcon />}
                      disabled={!canReviewProject(project)}
                      onClick={() => {
                        if (!canReviewProject(project)) {
                          enqueueSnackbar('This project has already been reviewed', { variant: 'warning' });
                          return;
                        }
                        const enrichedProject = enrichProjectWithAdminData(project);
                        setSelectedProject(enrichedProject);
                        setReviewDialog(true);
                      }}
                      sx={{
                        background: !canReviewProject(project)
                          ? 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)'
                          : 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
                        boxShadow: canReviewProject(project) ? '0 8px 25px rgba(138, 43, 226, 0.4)' : 'none',
                        borderRadius: '12px',
                        fontWeight: 600,
                        '&:hover': {
                          background: !canReviewProject(project)
                            ? 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)'
                            : 'linear-gradient(135deg, #9333EA 0%, #4A90E2 100%)',
                          transform: canReviewProject(project) ? 'translateY(-2px)' : 'none',
                        },
                        '&:disabled': {
                          color: 'white',
                          opacity: 0.6
                        }
                      }}
                    >
                      {canReviewProject(project) ? 'Review' : 'Reviewed'}
                    </Button>
                  </Grid>
                  {project.location && project.location.lat && project.location.lng && (
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<MapIcon />}
                        onClick={() => {
                          const enrichedProject = enrichProjectWithAdminData(project);
                          setSelectedProject(enrichedProject);
                          setProjectMapDialog(true);
                        }}
                        sx={{
                          borderColor: '#34D399',
                          color: '#34D399 !important',
                          borderRadius: '12px',
                          fontWeight: 600,
                          mt: 1,
                          '&:hover': {
                            borderColor: '#FFFFFF',
                            color: '#FFFFFF !important',
                            backgroundColor: 'rgba(52, 211, 153, 0.1)',
                          },
                        }}
                      >
                        View on Map
                      </Button>
                    </Grid>
                  )}
                  {(project.blockchain_tx_hash || project.blockchain_tx) && (
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<BlockchainIcon />}
                        onClick={() => viewBlockchainTransaction(project)}
                        sx={{
                          borderColor: '#FF6B35',
                          color: '#FF6B35 !important',
                          borderRadius: '12px',
                          fontWeight: 600,
                          mt: 1,
                          '&:hover': {
                            borderColor: '#FFFFFF',
                            color: '#FFFFFF !important',
                            backgroundColor: 'rgba(255, 107, 53, 0.1)',
                          },
                        }}
                      >
                        View on Blockchain
                      </Button>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadProjectDetailedPDF(project.id)}
                      disabled={loading}
                      sx={{
                        borderColor: '#9C27B0',
                        color: '#9C27B0 !important',
                        borderRadius: '12px',
                        fontWeight: 600,
                        mt: 1,
                        '&:hover': {
                          borderColor: '#FFFFFF',
                          color: '#FFFFFF !important',
                          backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        },
                        '&:disabled': {
                          borderColor: '#9E9E9E',
                          color: '#9E9E9E !important',
                          opacity: 0.6
                        }
                      }}
                    >
                      Detailed Report
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Projects State */}
      {projects.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Avatar sx={{ bgcolor: '#8A2BE2', width: 80, height: 80, mx: 'auto', mb: 2 }}>
            <EditIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h6" sx={{ color: '#FFFFFF !important', mb: 1 }}>No Projects to Review</Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7) !important' }}>Projects will appear here once submitted for review</Typography>
        </Box>
      )}
    </Box>
  );

  const renderMapTab = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🗺️ Project Locations Map
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                View all blue carbon restoration projects on an interactive map
              </Typography>
              
              {/* Map Legend */}
              <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: '#4caf50', borderRadius: '50%' }}></Box>
                  <Typography variant="caption">Approved</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: '#f44336', borderRadius: '50%' }}></Box>
                  <Typography variant="caption">Requires Review</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: '#ff9800', borderRadius: '50%' }}></Box>
                  <Typography variant="caption">Pending Verification</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: '#2196f3', borderRadius: '50%' }}></Box>
                  <Typography variant="caption">Submitted</Typography>
                </Box>
              </Box>

              {/* Map Container */}
              <Box sx={{ height: '600px', width: '100%', border: '1px solid #ddd', borderRadius: 1 }}>
                <MapContainer
                  center={[20.5937, 78.9629]} // Center of India
                  zoom={5}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Render markers for each project */}
                  {projects.map((project) => {
                    if (project.location && project.location.lat && project.location.lng) {
                      return (
                        <Marker
                          key={project.id}
                          position={[project.location.lat, project.location.lng]}
                          icon={createCustomIcon(project.status)}
                        >
                          <Popup>
                            <Box sx={{ minWidth: 280, maxWidth: 350 }}>
                              <Typography variant="h6" gutterBottom sx={{ 
                                color: '#000000ff', 
                                fontWeight: 'bold',
                                backgroundColor: '#000000ff',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                marginBottom: 2,
                                fontSize: '1.2rem',
                                textAlign: 'center'
                              }}>
                                {project.project_name}
                              </Typography>
                              <Typography variant="body2" gutterBottom sx={{ fontSize: '0.85em', color: '#000', fontWeight: '600' }}>
                                <strong style={{ color: '#1976d2' }}>ID:</strong> <span style={{ color: '#000', fontWeight: '700' }}>{project.id}</span>
                              </Typography>
                              <Typography variant="body2" gutterBottom sx={{ color: '#000', fontWeight: '600' }}>
                                <strong style={{ color: '#1976d2' }}>Type:</strong> <span style={{ color: '#000', fontWeight: '700' }}>{project.ecosystem_type?.replace('_', ' ') || 'N/A'}</span>
                              </Typography>
                              <Typography variant="body2" gutterBottom sx={{ color: '#000', fontWeight: '600' }}>
                                <strong style={{ color: '#1976d2' }}>Area:</strong> <span style={{ color: '#000', fontWeight: '700' }}>{project.area_hectares} hectares</span>
                              </Typography>
                              <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: '#333', fontWeight: '500' }}>
                                <strong style={{ color: '#000' }}>Status:</strong> 
                                <Chip 
                                  label={project.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'} 
                                  color={getStatusColor(project.status)}
                                  size="small"
                                  sx={{ ml: 1, fontWeight: 'bold' }}
                                />
                              </Typography>
                              {(project.created_at_formatted || project.created_at) && (
                                <Typography variant="body2" gutterBottom sx={{ 
                                  color: '#000',
                                  fontSize: '0.85em',
                                  fontWeight: '400'
                                }}>
                                  <strong style={{ color: '#1976d2' }}>Created:</strong> <span style={{ color: '#000', fontWeight: '400' }}>{project.created_at_formatted || new Date(project.created_at).toLocaleString()}</span>
                                </Typography>
                              )}
                              {project.created_by && project.created_by !== 'Unknown' && (
                                <Typography variant="body2" gutterBottom sx={{ color: '#000', fontWeight: '600' }}>
                                  <strong style={{ color: '#1976d2' }}>Created by:</strong> <span style={{ color: '#000', fontWeight: '700' }}>{project.created_by}</span>
                                </Typography>
                              )}
                              {project.contact_info && project.contact_info !== 'No contact info' && project.contact_info !== 'Contact information not available' && (
                                <Typography variant="body2" gutterBottom sx={{ 
                                  backgroundColor: '#ffffff', 
                                  padding: '8px 12px', 
                                  borderRadius: '6px',
                                  fontSize: '0.85em',
                                  border: '2px solid #1976d2',
                                  color: '#000',
                                  fontWeight: '600'
                                }}>
                                  <strong style={{ color: '#1976d2', fontSize: '0.9em' }}>Contact:</strong><br/>
                                  <span style={{ color: '#000', fontWeight: '600' }}>
                                    {formatContactInfo(project.contact_info)}
                                  </span>
                                </Typography>
                              )}
                              {project.location.address && (
                                <Typography variant="body2" gutterBottom sx={{ color: '#000', fontWeight: '500' }}>
                                  <strong style={{ color: '#1976d2' }}>Location:</strong> <span style={{ color: '#000', fontWeight: '700' }}>{project.location.address}</span>
                                </Typography>
                              )}
                              <Typography variant="body2" gutterBottom sx={{ color: '#000', fontWeight: '500' }}>
                                <strong style={{ color: '#1976d2' }}>Coordinates:</strong> <span style={{ color: '#000', fontWeight: '700' }}>{project.location.lat.toFixed(4)}, {project.location.lng.toFixed(4)}</span>
                              </Typography>
                              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => openProjectDetails(project)}
                                >
                                  View Details
                                </Button>
                                {(project.blockchain_tx_hash || project.blockchain_tx) && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<BlockchainIcon />}
                                    onClick={() => viewBlockchainTransaction(project)}
                                    sx={{
                                      borderColor: '#FF6B35',
                                      color: '#FF6B35 !important',
                                      '&:hover': {
                                        borderColor: '#FFFFFF',
                                        color: '#FFFFFF !important',
                                        backgroundColor: 'rgba(255, 107, 53, 0.1)',
                                      },
                                    }}
                                  >
                                    Blockchain
                                  </Button>
                                )}
                                {(project.status === 'requires_review' || project.status === 'pending_verification') && canReviewProject(project) && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    disabled={!canReviewProject(project)}
                                    onClick={() => {
                                      if (!canReviewProject(project)) {
                                        enqueueSnackbar('This project has already been reviewed', { variant: 'warning' });
                                        return;
                                      }
                                      const enrichedProject = enrichProjectWithAdminData(project);
                                      setSelectedProject(enrichedProject);
                                      setReviewDialog(true);
                                    }}
                                    sx={{
                                      '&:disabled': {
                                        opacity: 0.6
                                      }
                                    }}
                                  >
                                    Review
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          </Popup>
                        </Marker>
                      );
                    }
                    return null;
                  })}
                </MapContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Map Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📍 Location Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main">
                      {projects.filter(p => p.location && p.location.lat && p.location.lng).length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Mapped Projects
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {projects.filter(p => !p.location || !p.location.lat || !p.location.lng).length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Missing Location
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🌊 Ecosystem Distribution
              </Typography>
              <List dense>
                {Object.entries(
                  projects.reduce((acc, project) => {
                    const ecosystem = project.ecosystem_type || 'unknown';
                    acc[ecosystem] = (acc[ecosystem] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([ecosystem, count]) => (
                  <ListItem key={ecosystem}>
                    <ListItemText
                      primary={ecosystem.replace('_', ' ').toUpperCase()}
                      secondary={`${count} project${count > 1 ? 's' : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box 
      sx={{ 
        backgroundColor: '#0A0A0F',
        minHeight: '100vh',
        color: '#FFFFFF',
        p: 3,
        background: 'linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 30%, #16213E 70%, #0F1419 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at center, rgba(138, 43, 226, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        },
        '& .MuiContainer-root': { maxWidth: 'xl', mx: 'auto', position: 'relative', zIndex: 1 },
        '& .MuiPaper-root': {
          backgroundColor: 'rgba(28, 28, 40, 0.95)',
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(138, 43, 226, 0.3)',
          borderRadius: '20px',
          color: '#FFFFFF',
          boxShadow: '0 8px 40px rgba(138, 43, 226, 0.2)',
        },
        '& .MuiCard-root': {
          backgroundColor: 'rgba(28, 28, 40, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(138, 43, 226, 0.25)',
          borderRadius: '16px',
          color: '#FFFFFF',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          '&:hover': {
            backgroundColor: 'rgba(28, 28, 40, 0.95)',
            borderColor: 'rgba(138, 43, 226, 0.5)',
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: '0 20px 60px rgba(138, 43, 226, 0.4)',
          },
        },
        '& .MuiTypography-root': { color: '#FFFFFF !important' },
        '& .MuiTableContainer-root': {
          backgroundColor: 'rgba(28, 28, 40, 0.9)',
          border: '2px solid rgba(138, 43, 226, 0.3)',
          borderRadius: '16px',
          backdropFilter: 'blur(20px)',
        },
        '& .MuiTable-root': {
          '& .MuiTableHead-root': {
            background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.4) 0%, rgba(74, 144, 226, 0.3) 100%)',
            '& .MuiTableCell-root': {
              color: '#FFFFFF !important',
              fontWeight: 700,
              fontSize: '1rem',
              borderBottom: '2px solid rgba(138, 43, 226, 0.4)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            },
          },
          '& .MuiTableBody-root .MuiTableCell-root': {
            color: '#FFFFFF !important',
            borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
            fontSize: '0.95rem',
          },
        },
        '& .MuiButton-contained': {
          background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
          boxShadow: '0 6px 20px rgba(138, 43, 226, 0.5)',
          border: '1px solid rgba(138, 43, 226, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #9333EA 0%, #4A90E2 100%)',
            boxShadow: '0 12px 35px rgba(138, 43, 226, 0.7)',
            borderColor: 'rgba(138, 43, 226, 0.6)',
          },
        },
        '& .MuiTabs-root': {
          '& .MuiTab-root': {
            color: 'rgba(255, 255, 255, 0.6) !important',
            fontWeight: 600,
            fontSize: '1rem',
            textTransform: 'none',
            '&.Mui-selected': {
              color: '#FFFFFF !important',
              textShadow: '0 2px 8px rgba(138, 43, 226, 0.8)',
            },
          },
          '& .MuiTabs-indicator': {
            background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 100%)',
            height: '4px',
            borderRadius: '2px',
            boxShadow: '0 2px 8px rgba(138, 43, 226, 0.6)',
          },
        },
      }}
    >
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        {/* Loading state */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress size={60} sx={{ color: '#8A2BE2' }} />
            <Typography variant="h6" sx={{ ml: 2, color: '#FFFFFF !important' }}>Loading Admin Dashboard...</Typography>
          </Box>
        )}
      
      {/* Error state */}
      {!loading && (!dashboardData && !projects.length) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Unable to load dashboard data. Please check your connection and try again.
          <Button variant="outlined" onClick={() => { loadDashboard(); fetchAdminData(); }} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}
      
        {/* Main dashboard content */}
        {!loading && (
          <>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                variant="h2" 
                gutterBottom
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #8A2BE2 0%, #4A90E2 50%, #34D399 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  textShadow: '0 4px 8px rgba(0,0,0,0.5)',
                  mb: 2,
                }}
              >
                🏛️ NCCR Admin Portal
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#B3B3B3 !important',
                  fontWeight: 400,
                  mb: 3,
                }}
              >
                National Centre for Coastal Research - Blue Carbon MRV System Administration
              </Typography>
              
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 4, 
                  backgroundColor: 'rgba(138, 43, 226, 0.15)',
                  border: '1px solid rgba(138, 43, 226, 0.3)',
                  color: '#FFFFFF !important',
                  borderRadius: '12px',
                  '& .MuiAlert-icon': {
                    color: '#8A2BE2 !important',
                  },
                }}
              >
                Review and approve blue carbon restoration projects for MRV workflow
              </Alert>
            </Box>          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab
                icon={<DashboardIcon />}
                label="Dashboard"
                iconPosition="start"
              />
              <Tab
                icon={<Badge badgeContent={projects.filter(p => p.status !== 'approved' && p.status !== 'rejected').length} color="error">
                  <VerifiedIcon />
                </Badge>}
                label="Project Review"
                iconPosition="start"
              />
              <Tab
                icon={<EditIcon />}
                label="Review Projects"
                iconPosition="start"
              />
              <Tab
                icon={<AnalyticsIcon />}
                label="Analytics"
                iconPosition="start"
              />
              <Tab
                icon={<MapIcon />}
                label="Location Map"
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {activeTab === 0 && renderDashboardTab()}
          {activeTab === 1 && renderProjectsTab()}
          {activeTab === 2 && renderReviewProjectsTab()}
          {activeTab === 3 && renderAnalyticsTab()}
          {activeTab === 4 && renderMapTab()}
        </>
      )}

      {/* Project Map Dialog */}
      <Dialog
        open={projectMapDialog}
        onClose={() => setProjectMapDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          📍 Project Location: {selectedProject?.project_name}
        </DialogTitle>
        <DialogContent>
          {selectedProject && selectedProject.location && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  {/* Project Map */}
                  <Box sx={{ height: '500px', width: '100%', border: '1px solid #ddd', borderRadius: 1 }}>
                    <MapContainer
                      center={selectedProject.location ? [selectedProject.location.lat, selectedProject.location.lng] : [0, 0]}
                      zoom={selectedProject.location ? 13 : 2}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      
                      {/* Project marker */}
                      {selectedProject.location && (
                        <Marker
                          position={[selectedProject.location.lat, selectedProject.location.lng]}
                          icon={createCustomIcon(selectedProject.status)}
                        >
                        <Popup>
                          <Box sx={{ minWidth: 250, maxWidth: 320 }}>
                            <Typography variant="h6" gutterBottom sx={{ 
                              color: '#ffffff', 
                              fontWeight: 'bold',
                              backgroundColor: '#1976d2',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              marginBottom: 2,
                              fontSize: '1.2rem',
                              textAlign: 'center'
                            }}>
                              {selectedProject.project_name}
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ color: '#000', fontWeight: '600' }}>
                              <strong style={{ color: '#1976d2' }}>Area:</strong> <span style={{ color: '#000', fontWeight: '700' }}>{selectedProject.area_hectares} hectares</span>
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ color: '#000', fontWeight: '600' }}>
                              <strong style={{ color: '#1976d2' }}>Type:</strong> <span style={{ color: '#000', fontWeight: '700' }}>{selectedProject.ecosystem_type?.replace('_', ' ') || 'N/A'}</span>
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: '#000', fontWeight: '600' }}>
                              <strong style={{ color: '#1976d2' }}>Status:</strong> 
                              <Chip 
                                label={selectedProject.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'} 
                                color={getStatusColor(selectedProject.status)}
                                size="small"
                                sx={{ ml: 1, fontWeight: 'bold' }}
                              />
                            </Typography>
                            {(selectedProject.created_at_formatted || selectedProject.created_at) && (
                              <Typography variant="body2" gutterBottom sx={{ 
                                color: '#000',
                                fontSize: '0.85em',
                                fontWeight: '400'
                              }}>
                                <strong style={{ color: '#1976d2' }}>Created:</strong> <span style={{ color: '#000', fontWeight: '400' }}>{selectedProject.created_at_formatted || new Date(selectedProject.created_at).toLocaleString()}</span>
                              </Typography>
                            )}
                            {selectedProject.contact_info && selectedProject.contact_info !== 'No contact info' && selectedProject.contact_info !== 'Contact information not available' && (
                              <Typography variant="body2" sx={{ 
                                backgroundColor: '#ffffff', 
                                padding: '8px 12px', 
                                borderRadius: '6px',
                                fontSize: '0.85em',
                                mt: 1,
                                border: '2px solid #1976d2',
                                color: '#000',
                                fontWeight: '600'
                              }}>
                                <strong style={{ color: '#1976d2', fontSize: '0.9em' }}>Contact:</strong><br/>
                                <span style={{ color: '#000', fontWeight: '600' }}>
                                  {formatContactInfo(selectedProject.contact_info)}
                                </span>
                              </Typography>
                            )}
                          </Box>
                        </Popup>
                      </Marker>
                      )}

                      {/* Area circle if area data is available */}
                      {selectedProject.area_hectares && selectedProject.location && (
                        <Circle
                          center={[selectedProject.location.lat, selectedProject.location.lng]}
                          radius={Math.sqrt(selectedProject.area_hectares * 10000) / 2} // Convert hectares to approximate radius in meters
                          pathOptions={{
                            color: getMarkerColor(selectedProject.status),
                            fillColor: getMarkerColor(selectedProject.status),
                            fillOpacity: 0.2,
                            weight: 2
                          }}
                        />
                      )}
                    </MapContainer>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  {/* Project Information */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Project Information
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          <strong>ID:</strong> {selectedProject.id}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Status:</strong> 
                          <Chip 
                            label={selectedProject.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'} 
                            color={getStatusColor(selectedProject.status)}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Ecosystem:</strong> {selectedProject.ecosystem_type?.replace('_', ' ') || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Area:</strong> {selectedProject.area_hectares} hectares
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Restoration Method:</strong> {selectedProject.restoration_method || 'N/A'}
                        </Typography>
                      </Box>

                      <Typography variant="h6" gutterBottom>
                        Location Details
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        {selectedProject.location ? (
                          <>
                            <Typography variant="body2" color="textSecondary">
                              <strong>Latitude:</strong> {selectedProject.location.lat.toFixed(6)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              <strong>Longitude:</strong> {selectedProject.location.lng.toFixed(6)}
                            </Typography>
                            {selectedProject.location.address && (
                              <Typography variant="body2" color="textSecondary">
                                <strong>Address:</strong> {selectedProject.location.address}
                              </Typography>
                            )}
                          </>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            Location information not available
                          </Typography>
                        )}
                      </Box>

                      {selectedProject.field_measurements && (
                        <>
                          <Typography variant="h6" gutterBottom>
                            Field Measurements
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            {selectedProject.field_measurements.water_quality && (
                              <Typography variant="body2" color="textSecondary">
                                <strong>Water pH:</strong> {selectedProject.field_measurements.water_quality.ph_level}
                              </Typography>
                            )}
                            {selectedProject.field_measurements.soil_analysis && (
                              <Typography variant="body2" color="textSecondary">
                                <strong>Soil Carbon:</strong> {selectedProject.field_measurements.soil_analysis.carbon_content}%
                              </Typography>
                            )}
                            {selectedProject.field_measurements.biodiversity && (
                              <Typography variant="body2" color="textSecondary">
                                <strong>Species Count:</strong> {selectedProject.field_measurements.biodiversity.species_count}
                              </Typography>
                            )}
                          </Box>
                        </>
                      )}

                      {selectedProject.carbon_credits > 0 && (
                        <>
                          <Typography variant="h6" gutterBottom>
                            Carbon Credits
                          </Typography>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                            <Typography variant="h4" color="success.main">
                              {selectedProject.carbon_credits}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Credits Awarded
                            </Typography>
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjectMapDialog(false)}>
            Close
          </Button>
          {selectedProject && (
            <Button 
              variant="contained"
              onClick={() => {
                setProjectMapDialog(false);
                openProjectDetails(selectedProject);
              }}
            >
              View Full Details
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Enhanced Review Dialog */}
      <Dialog
        open={reviewDialog}
        onClose={() => setReviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Review Project: {selectedProject?.project_name}
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box sx={{ mt: 2 }}>
              {/* Warning for already reviewed projects */}
              {selectedProject && !canReviewProject(selectedProject) && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <strong>⚠️ Project Already Reviewed</strong><br/>
                  This project has already been {selectedProject.status} and cannot be reviewed again.
                  {selectedProject.reviewed_by && (
                    <span> Reviewed by: {selectedProject.reviewed_by}</span>
                  )}
                  {selectedProject.reviewed_at && (
                    <span> on {new Date(selectedProject.reviewed_at).toLocaleDateString()}</span>
                  )}
                </Alert>
              )}
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Project Details</Typography>
                  <Typography><strong>ID:</strong> {selectedProject.id}</Typography>
                  <Typography><strong>Ecosystem:</strong> {selectedProject.ecosystem_type}</Typography>
                  <Typography><strong>Area:</strong> {selectedProject.area_hectares} hectares</Typography>
                  <Typography><strong>AI Score:</strong> {selectedProject.verification_score || 0}/100</Typography>
                  <Typography><strong>Status:</strong> {selectedProject.status}</Typography>
                  <Typography><strong>Current Credits:</strong> {selectedProject.carbon_credits || selectedProject.credits_awarded || 0} tCO₂</Typography>
                  <Typography><strong>Suggested Credits:</strong> {calculateSuggestedCredits(selectedProject)} tCO₂</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Media Evidence</Typography>
                  <Typography>📷 Photos: {selectedProject.media_count?.photos || 0}</Typography>
                  <Typography>🎥 Videos: {selectedProject.media_count?.videos || 0}</Typography>
                  <Typography>🎙️ Audio: {selectedProject.media_count?.audio || 0}</Typography>
                  <Typography>📄 Documents: {selectedProject.media_count?.documents || 0}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Decision</InputLabel>
                    <Select
                      value={reviewData.decision}
                      onChange={(e) => {
                        const decision = e.target.value;
                        const suggestedCredits = decision === 'approved' ? calculateSuggestedCredits(selectedProject) : '';
                        setReviewData({
                          ...reviewData, 
                          decision: decision,
                          credits_awarded: suggestedCredits
                        });
                      }}
                    >
                      <MenuItem value="approved">Approve</MenuItem>
                      <MenuItem value="rejected">Reject</MenuItem>
                      <MenuItem value="requires_revision">Requires Revision</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Review Comments"
                    value={reviewData.comments || reviewComments}
                    onChange={(e) => {
                      setReviewData({...reviewData, comments: e.target.value});
                      setReviewComments(e.target.value);
                    }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Carbon Credits to Award (tCO₂)"
                    value={reviewData.credits_awarded || ''}
                    onChange={(e) => setReviewData({...reviewData, credits_awarded: e.target.value})}
                    helperText={`Suggested: ${calculateSuggestedCredits(selectedProject)} tCO₂ (based on ${selectedProject?.area_hectares || 0} hectares of ${selectedProject?.ecosystem_type?.replace('_', ' ') || 'ecosystem'})`}
                    InputProps={{
                      endAdornment: (
                        <Button
                          size="small"
                          onClick={() => setReviewData({...reviewData, credits_awarded: calculateSuggestedCredits(selectedProject)})}
                          sx={{ ml: 1 }}
                        >
                          Use Suggested
                        </Button>
                      )
                    }}
                    sx={{ mb: 2 }}
                  />
                  {reviewData.decision === 'approved' && (
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Compliance Notes (Optional)"
                      value={reviewData.compliance_notes || ''}
                      onChange={(e) => setReviewData({...reviewData, compliance_notes: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
          <Button
            color="error"
            startIcon={<Cancel />}
            disabled={selectedProject && !canReviewProject(selectedProject)}
            onClick={() => handleProjectReview(selectedProject?.id, 'rejected')}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            disabled={(selectedProject && !canReviewProject(selectedProject)) || loading || (reviewData.decision === 'approved' && (!reviewData.credits_awarded || parseFloat(reviewData.credits_awarded) <= 0))}
            onClick={() => handleProjectReview(selectedProject?.id, 'approved')}
            sx={{
              background: reviewData.decision === 'approved' && reviewData.credits_awarded && parseFloat(reviewData.credits_awarded) > 0
                ? 'linear-gradient(135deg, #4CAF50 0%, #34D399 100%)'
                : undefined
            }}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              reviewData.decision === 'approved' 
                ? `Approve & Award ${reviewData.credits_awarded || 0} tCO₂ Credits`
                : 'Approve'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => {
          setDetailsDialog(false);
          setVerificationData(null);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Project Details: {selectedProject?.project_name}
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box sx={{ mt: 2 }}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Basic Information</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography><strong>Project ID:</strong> {selectedProject.id}</Typography>
                      <Typography><strong>Name:</strong> {selectedProject.project_name}</Typography>
                      <Typography><strong>Ecosystem:</strong> {selectedProject.ecosystem_type}</Typography>
                      <Typography><strong>Area:</strong> {selectedProject.area_hectares} hectares</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography><strong>Status:</strong> {selectedProject.status}</Typography>
                      <Typography><strong>Created:</strong> {selectedProject.created_at_formatted || new Date(selectedProject.created_at).toLocaleString()}</Typography>
                      <Typography><strong>Created by:</strong> {selectedProject.created_by}</Typography>
                      <Typography>
                        <strong>Contact:</strong>{' '}
                        <span style={{ 
                          display: 'inline-block',
                          backgroundColor: '#f5f5f5',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.9em',
                          color: '#666'
                        }}>
                          {formatContactInfo(selectedProject.contact_info || selectedProject.contact_email || 'No contact info available')}
                        </span>
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">AI Verification Results</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography><strong>Overall Score:</strong> {verificationData?.verification_score || selectedProject.verification_score || 0}/100</Typography>
                  {(verificationData?.ai_verification || selectedProject.ai_verification) && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">
                        Confidence Level: {verificationData?.ai_verification?.confidence_level || selectedProject.ai_verification?.confidence_level}
                      </Typography>
                      <Typography variant="subtitle2">
                        Status: {verificationData?.ai_verification?.status || selectedProject.ai_verification?.status}
                      </Typography>
                      {(verificationData?.ai_verification?.flags || selectedProject.ai_verification?.flags) && 
                       (verificationData?.ai_verification?.flags || selectedProject.ai_verification?.flags).length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="subtitle2">Flags:</Typography>
                          {(verificationData?.ai_verification?.flags || selectedProject.ai_verification?.flags).map((flag, index) => (
                            <Chip key={index} label={flag} color="warning" size="small" sx={{ mr: 1, mt: 1 }} />
                          ))}
                        </Box>
                      )}
                      {verificationData?.enhanced_ai_verification && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2"><strong>Enhanced AI Analysis:</strong></Typography>
                          <Typography variant="body2">
                            Score: {verificationData.enhanced_ai_verification.overall_score || 0}/100
                          </Typography>
                          <Typography variant="body2">
                            Category: {verificationData.enhanced_ai_verification.category || 'Not specified'}
                          </Typography>
                          <Typography variant="body2">
                            Status: {verificationData.enhanced_ai_verification.status || 'Not specified'}
                          </Typography>
                          {verificationData.enhanced_ai_verification.warnings && verificationData.enhanced_ai_verification.warnings.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="subtitle2">Warnings:</Typography>
                              {verificationData.enhanced_ai_verification.warnings.map((warning, index) => (
                                <Chip key={index} label={warning} color="error" size="small" sx={{ mr: 1, mt: 1 }} />
                              ))}
                            </Box>
                          )}
                          {verificationData.enhanced_ai_verification.recommendations && verificationData.enhanced_ai_verification.recommendations.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="subtitle2">Recommendations:</Typography>
                              {verificationData.enhanced_ai_verification.recommendations.map((rec, index) => (
                                <Chip key={index} label={rec} color="info" size="small" sx={{ mr: 1, mt: 1 }} />
                              ))}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                  {verificationData === null && !selectedProject.ai_verification && (
                    <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                      Loading verification data...
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Field Measurements</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {(verificationData?.field_measurements || selectedProject.field_measurements) && (
                    <Grid container spacing={2}>
                      {Object.entries(verificationData?.field_measurements || selectedProject.field_measurements || {}).map(([category, data]) => (
                        <Grid item xs={6} key={category}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {category.replace('_', ' ').toUpperCase()}
                          </Typography>
                          {Object.entries(data || {}).map(([key, value]) => (
                            value && (
                              <Typography key={key} variant="body2">
                                {key.replace('_', ' ')}: {value} {getUnitForMeasurement(key)}
                              </Typography>
                            )
                          ))}
                        </Grid>
                      ))}
                    </Grid>
                  )}
                  {!verificationData?.field_measurements && !selectedProject.field_measurements && verificationData !== null && (
                    <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                      No field measurements data available for this project.
                    </Typography>
                  )}
                  {verificationData === null && (
                    <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                      Loading field measurements data...
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDetailsDialog(false);
            setVerificationData(null);
          }}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => downloadProjectDetailedPDF(selectedProject?.id)}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8E24AA 0%, #5E35B1 100%)',
              },
            }}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* IPFS Media Viewer Dialog */}
      <IPFSMediaViewer
        open={ipfsMediaDialog}
        onClose={() => setIpfsMediaDialog(false)}
        projectId={selectedProject?.id}
        projectName={selectedProject?.project_name}
      />
      </Container>
    </Box>
  );
};

export default AdminDashboard;
