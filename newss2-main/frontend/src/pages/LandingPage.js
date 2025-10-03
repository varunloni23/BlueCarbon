import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  Chip,
  Paper
} from '@mui/material';
import {
  Nature as NatureIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  AccountBalance as GovIcon,
  People as CommunityIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <NatureIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
      title: 'Blue Carbon Restoration',
      description: 'Track and verify mangrove, seagrass, and salt marsh restoration projects'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
      title: 'AI-Powered Verification',
      description: 'Advanced machine learning models for automated project verification'
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: '#2196f3' }} />,
      title: 'Comprehensive Analytics',
      description: 'Real-time dashboards and reporting for project monitoring'
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
      title: 'Carbon Credit Tokenization',
      description: 'Blockchain-based carbon credit generation and trading'
    }
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #1976d2, #42a5f5)' }}>
        <Toolbar>
          <NatureIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Blue Carbon MRV System
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            🌊 Blue Carbon MRV System
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#666', mb: 4 }}>
            Monitoring, Reporting & Verification for India's Coastal Ecosystem Restoration
          </Typography>
          
          <Paper elevation={3} sx={{ p: 3, mb: 4, background: 'rgba(255,255,255,0.9)' }}>
            <Typography variant="h6" gutterBottom>
              🏛️ Powered by National Centre for Coastal Research (NCCR)
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Government of India's premier institute for coastal research and blue carbon initiatives
            </Typography>
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/login')}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Get Started
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => navigate('/login')}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
          System Features
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  textAlign: 'center',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* User Types Section */}
      <Box sx={{ background: '#f5f5f5', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
            User Access Levels
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', border: '2px solid #4caf50' }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <CommunityIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
                  <Typography variant="h4" component="h3" gutterBottom color="#4caf50">
                    Community Users
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Submit and track blue carbon restoration projects
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Chip label="Project Creation" sx={{ m: 0.5 }} />
                    <Chip label="Data Upload" sx={{ m: 0.5 }} />
                    <Chip label="Progress Tracking" sx={{ m: 0.5 }} />
                    <Chip label="Status Updates" sx={{ m: 0.5 }} />
                  </Box>
                  <Button 
                    variant="contained" 
                    color="success" 
                    size="large"
                    onClick={() => navigate('/login')}
                  >
                    Access User Portal
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', border: '2px solid #ff9800' }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <GovIcon sx={{ fontSize: 60, color: '#ff9800', mb: 2 }} />
                  <Typography variant="h4" component="h3" gutterBottom color="#ff9800">
                    NCCR Administrators
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Review, verify and manage the entire MRV system
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Chip label="Project Review" sx={{ m: 0.5 }} />
                    <Chip label="AI Verification" sx={{ m: 0.5 }} />
                    <Chip label="Analytics Dashboard" sx={{ m: 0.5 }} />
                    <Chip label="System Management" sx={{ m: 0.5 }} />
                  </Box>
                  <Button 
                    variant="contained" 
                    color="warning" 
                    size="large"
                    onClick={() => navigate('/login')}
                  >
                    Access Admin Portal
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
          System Impact
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h3" color="primary" gutterBottom>
                  2,060
                </Typography>
                <Typography variant="h6">
                  Carbon Credits Issued
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h3" color="success.main" gutterBottom>
                  270.7
                </Typography>
                <Typography variant="h6">
                  Hectares Restored
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h3" color="warning.main" gutterBottom>
                  3
                </Typography>
                <Typography variant="h6">
                  Active Projects
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h3" color="error.main" gutterBottom>
                  94.2%
                </Typography>
                <Typography variant="h6">
                  AI Verification Accuracy
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ background: '#1976d2', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Blue Carbon MRV System
              </Typography>
              <Typography variant="body2">
                Developed for the National Centre for Coastal Research (NCCR), 
                Government of India, to support blue carbon ecosystem restoration and monitoring.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Button 
                variant="outlined" 
                color="inherit" 
                size="large"
                onClick={() => navigate('/login')}
              >
                Access System
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
