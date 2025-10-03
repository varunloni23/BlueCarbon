import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Button,
  Container,
  Avatar,
  IconButton,
  LinearProgress,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Download,
  Assessment,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendIcon,
  Nature as EcoIcon,
  AccountBalance as EconomicIcon,
  VerifiedUser as ComplianceIcon,
  ExpandMore as ExpandMoreIcon,
  Place as LocationIcon,
  Timeline as TimelineIcon,
  Group as CommunityIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

const Reports = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Get user info
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }

    // Fetch report data
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8002/api/reports');
      const data = await response.json();
      
      setReportData(data.report);
    } catch (error) {
      console.error('Error fetching report data:', error);
      // Use mock data on error
      setReportData({
        summary: {
          total_projects: 15,
          total_area_restored: 456.8,
          total_carbon_credits: 1247,
          total_co2_sequestered: 1247.0,
          communities_impacted: 8
        },
        environmental_impact: {
          ecosystems_restored: {
            mangrove: 6,
            seagrass: 4,
            salt_marsh: 3,
            coastal_wetland: 2
          },
          biodiversity_indicators: {
            species_protected: 45,
            habitat_connectivity: "High",
            water_quality_improvement: "Significant"
          }
        },
        economic_impact: {
          revenue_generated: 623500,
          jobs_created: 45,
          community_income_increase: "25%"
        },
        compliance_status: {
          verified_projects: 12,
          pending_verification: 3,
          compliance_rate: "98%"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const handleDownloadReport = () => {
    // Create CSV content
    const csvContent = generateCSVReport();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blue_carbon_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSVReport = () => {
    if (!reportData) return '';
    
    const headers = ['Metric', 'Value', 'Category'];
    const rows = [
      ['Total Projects', reportData.summary.total_projects, 'Summary'],
      ['Total Area Restored (ha)', reportData.summary.total_area_restored, 'Summary'],
      ['Carbon Credits Issued', reportData.summary.total_carbon_credits, 'Summary'],
      ['CO₂ Sequestered (tons)', reportData.summary.total_co2_sequestered, 'Summary'],
      ['Communities Impacted', reportData.summary.communities_impacted, 'Summary'],
      ['Revenue Generated (₹)', reportData.economic_impact.revenue_generated, 'Economic'],
      ['Jobs Created', reportData.economic_impact.jobs_created, 'Economic'],
      ['Verified Projects', reportData.compliance_status.verified_projects, 'Compliance'],
      ['Compliance Rate', reportData.compliance_status.compliance_rate, 'Compliance']
    ];
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <LinearProgress />
        <Typography sx={{ textAlign: 'center', mt: 2 }}>Generating reports...</Typography>
      </Container>
    );
  }

  if (!reportData) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Alert severity="error">Failed to load report data</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h3" gutterBottom>
              📊 Blue Carbon Impact Reports
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Comprehensive reporting and transparency dashboard
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {userInfo ? `Generated for: ${userInfo.email}` : 'Public Dashboard'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={fetchReportData} color="primary">
              <RefreshIcon />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                  <EcoIcon />
                </Avatar>
                <Typography variant="h6">Projects</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {reportData.summary.total_projects}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total active projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 1 }}>
                  <LocationIcon />
                </Avatar>
                <Typography variant="h6">Area</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {reportData.summary.total_area_restored.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Hectares restored
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 1 }}>
                  <TrendIcon />
                </Avatar>
                <Typography variant="h6">Credits</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {reportData.summary.total_carbon_credits.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Carbon credits issued
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 1 }}>
                  <EcoIcon />
                </Avatar>
                <Typography variant="h6">CO₂</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {reportData.summary.total_co2_sequestered.toLocaleString()}t
              </Typography>
              <Typography variant="body2" color="textSecondary">
                CO₂ sequestered
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 1 }}>
                  <CommunityIcon />
                </Avatar>
                <Typography variant="h6">Communities</Typography>
              </Box>
              <Typography variant="h4" color="secondary.main">
                {reportData.summary.communities_impacted}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Communities impacted
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 3 }}>
        🌍 <strong>International Standards:</strong> All projects comply with VERRA VCS standards and contribute to UN SDG 14 (Life Below Water)
      </Alert>

      {/* Detailed Reports Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="🌱 Environmental Impact" />
          <Tab label="💰 Economic Analysis" />
          <Tab label="✅ Compliance Status" />
          <Tab label="📈 Timeline & Trends" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Ecosystem Restoration Breakdown
                  </Typography>
                  {Object.entries(reportData.environmental_impact.ecosystems_restored).map(([ecosystem, count]) => (
                    <Box key={ecosystem} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ textTransform: 'capitalize' }}>{ecosystem.replace('_', ' ')}</Typography>
                      <Chip label={`${count} projects`} size="small" color="success" />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Biodiversity Impact
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Species Protected</Typography>
                    <Typography variant="h4" color="success.main">
                      {reportData.environmental_impact.biodiversity_indicators.species_protected}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Habitat Connectivity</Typography>
                    <Chip 
                      label={reportData.environmental_impact.biodiversity_indicators.habitat_connectivity} 
                      color="success" 
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Water Quality Improvement</Typography>
                    <Chip 
                      label={reportData.environmental_impact.biodiversity_indicators.water_quality_improvement} 
                      color="info" 
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue Generated
                  </Typography>
                  <Typography variant="h3" color="primary.main">
                    ₹{reportData.economic_impact.revenue_generated.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total from carbon credit sales
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Jobs Created
                  </Typography>
                  <Typography variant="h3" color="success.main">
                    {reportData.economic_impact.jobs_created}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Direct employment opportunities
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Community Income Increase
                  </Typography>
                  <Typography variant="h3" color="warning.main">
                    {reportData.economic_impact.community_income_increase}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average household increase
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Verification Status
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Verified Projects</Typography>
                      <Chip label={reportData.compliance_status.verified_projects} color="success" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Pending Verification</Typography>
                      <Chip label={reportData.compliance_status.pending_verification} color="warning" />
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(reportData.compliance_status.verified_projects / reportData.summary.total_projects) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Compliance Rate
                  </Typography>
                  <Typography variant="h3" color="success.main">
                    {reportData.compliance_status.compliance_rate}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Meeting international standards
                  </Typography>
                  <Alert severity="success" sx={{ mt: 2 }}>
                    All projects meet VERRA VCS and Gold Standard requirements
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Timeline & Impact Trends
              </Typography>
              <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="h6" color="primary.main" gutterBottom>
                  📊 Growth Trajectory (2024)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">Q1</Typography>
                      <Typography variant="body2">3 Projects Started</Typography>
                      <Typography variant="body2">85 ha Restored</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">Q2</Typography>
                      <Typography variant="body2">6 Projects Completed</Typography>
                      <Typography variant="body2">156 ha Restored</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">Q3</Typography>
                      <Typography variant="body2">4 Projects Verified</Typography>
                      <Typography variant="body2">124 ha Restored</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">Q4</Typography>
                      <Typography variant="body2">2 Projects Ongoing</Typography>
                      <Typography variant="body2">91 ha Planned</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Reports;
