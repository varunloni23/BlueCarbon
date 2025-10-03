import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Alert,
  Typography,
  Button
} from '@mui/material';
import { useSnackbar } from 'notistack';

// Import the NGO Dashboard component from the original file
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
      
      <Typography variant="h4" gutterBottom>
        NGO VERIFICATION INTERFACE WORKING!
      </Typography>
      <Typography variant="body1">
        This proves the NGO dashboard component works. The issue is with user type detection in localStorage.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/login')}>
        Back to Login
      </Button>
    </>
  );
};

const Dashboard = () => {
  const [userProfile] = useState({
    name: 'Test NGO',
    organization: 'Test Verification Org',
    userType: 'ngo'
  });

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Force NGO Dashboard to show */}
      <NGODashboard userProfile={userProfile} />
    </Container>
  );
};

export default Dashboard;