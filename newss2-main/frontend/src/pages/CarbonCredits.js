import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  Tabs,
  Tab,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Token as TokenIcon,
  Verified as VerifiedIcon,
  History as HistoryIcon,
  Send as SendIcon,
  Receipt as ReceiptIcon,
  Link as BlockchainIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  QrCode as QrCodeIcon,
  ExpandMore as ExpandMoreIcon,
  Logout as LogoutIcon,
  Link as LinkIcon,
} from '@mui/icons-material';

const CarbonCredits = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // State for tokenization
  const [tokenizationDialog, setTokenizationDialog] = useState(false);
  const [tokenizeData, setTokenizeData] = useState({
    project_id: '',
    credits_amount: '',
    recipient: ''
  });
  
  // Data states
  const [carbonCredits, setCarbonCredits] = useState([]);
  const [blockchainStatus, setBlockchainStatus] = useState(null);
  const [userWallet, setUserWallet] = useState(null);
  const [tokenizationHistory, setTokenizationHistory] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [blockchainHistory, setBlockchainHistory] = useState([]);

  useEffect(() => {
    // Get user info
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }

    fetchCarbonCreditsData();
  }, []);

  const fetchCarbonCreditsData = async () => {
    setLoading(true);
    try {
      // Fetch blockchain status
      const blockchainResponse = await fetch('http://localhost:8002/api/blockchain/status');
      const blockchainData = await blockchainResponse.json();
      setBlockchainStatus(blockchainData.blockchain_status);

      // Fetch contract info
      const contractsResponse = await fetch('http://localhost:8002/api/contracts/info');
      const contractsData = await contractsResponse.json();

      // Fetch user projects for tokenization
      const projectsResponse = await fetch('http://localhost:8002/api/projects');
      const projectsData = await projectsResponse.json();

      // Mock carbon credits data
      const mockCredits = [
        {
          id: 'BCC-001-1732123456',
          project_name: 'Sundarbans Mangrove Restoration',
          credits_amount: 150.5,
          status: 'minted',
          token_contract: '0x1234567890abcdef1234567890abcdef12345678',
          issuance_date: '2024-01-15T10:30:00Z',
          expiry_date: '2029-01-15T10:30:00Z',
          verification_standards: ['VERRA_VCS', 'GOLD_STANDARD'],
          market_value: 4515.0,
          transaction_hash: '0xabc123def456ghi789jkl012mno345pqr678stu901'
        },
        {
          id: 'BCC-002-1732123789',
          project_name: 'Kerala Backwater Restoration',
          credits_amount: 89.3,
          status: 'pending',
          token_contract: '0x1234567890abcdef1234567890abcdef12345678',
          issuance_date: '2024-02-20T14:15:00Z',
          expiry_date: '2029-02-20T14:15:00Z',
          verification_standards: ['VERRA_VCS'],
          market_value: 2679.0,
          transaction_hash: null
        }
      ];

      setCarbonCredits(mockCredits);

      // Mock user wallet
      setUserWallet({
        address: '0x742d35Cc6634C0532925a3b8D5c65E1c3F1234AB',
        balance_bcc: 239.8,
        balance_matic: 15.67,
        total_value_inr: 7194.0
      });

      // Mock tokenization history
      setTokenizationHistory([
        {
          date: '2024-01-15',
          project: 'Sundarbans Mangrove Restoration',
          credits: 150.5,
          status: 'completed',
          tx_hash: '0xabc123def456ghi789jkl012mno345pqr678stu901'
        },
        {
          date: '2024-02-20',
          project: 'Kerala Backwater Restoration',
          credits: 89.3,
          status: 'processing',
          tx_hash: '0xdef456ghi789jkl012mno345pqr678stu901abc123'
        }
      ]);

    } catch (error) {
      console.error('Error fetching carbon credits data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenize = async () => {
    if (!tokenizeData.project_id || !tokenizeData.credits_amount) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8002/api/blockchain/project/${tokenizeData.project_id}/tokenize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          credits_amount: parseFloat(tokenizeData.credits_amount),
          recipient: tokenizeData.recipient || userWallet?.address
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Carbon credits tokenized successfully!');
        setTokenizationDialog(false);
        setTokenizeData({ project_id: '', credits_amount: '', recipient: '' });
        fetchCarbonCreditsData(); // Refresh data
      } else {
        alert('Failed to tokenize carbon credits');
      }
    } catch (error) {
      console.error('Error tokenizing credits:', error);
      alert('Error tokenizing carbon credits');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBlockchainHistory = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:8002/api/blockchain/project/${projectId}/history`);
      if (response.ok) {
        const historyData = await response.json();
        setBlockchainHistory(historyData.timeline || []);
        setSelectedProject(projectId);
      }
    } catch (error) {
      console.error('Error fetching blockchain history:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'minted': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'minted': return <CheckCircleIcon />;
      case 'pending': return <PendingIcon />;
      case 'failed': return <ErrorIcon />;
      default: return <PendingIcon />;
    }
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
        <Typography sx={{ textAlign: 'center', mt: 2 }}>Loading carbon credits data...</Typography>
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
              💰 Carbon Credits Management
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Tokenization, tracking, and management of blue carbon credits
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {userInfo ? `User: ${userInfo.email}` : 'Guest Access'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={fetchCarbonCreditsData} color="primary">
              <RefreshIcon />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<TokenIcon />}
              onClick={() => setTokenizationDialog(true)}
            >
              Tokenize Credits
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

      {/* Wallet Overview */}
      {userWallet && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🏦 Wallet Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                    <WalletIcon />
                  </Avatar>
                  <Typography variant="h5" color="primary.main">
                    {userWallet.balance_bcc}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    BCC Tokens
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 1 }}>
                    <BlockchainIcon />
                  </Avatar>
                  <Typography variant="h5" color="secondary.main">
                    {userWallet.balance_matic}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    MATIC
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Typography variant="h5" color="success.main">
                    ₹{userWallet.total_value_inr.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Value
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Wallet Address
                  </Typography>
                  <Chip 
                    label={`${userWallet.address.substring(0, 10)}...${userWallet.address.substring(userWallet.address.length - 8)}`}
                    size="small"
                    icon={<QrCodeIcon />}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Blockchain Status */}
      {blockchainStatus && (
        <Alert severity="success" sx={{ mb: 3 }}>
          🌐 <strong>Blockchain Status:</strong> Connected to {blockchainStatus.network} | 
          Latest Block: {blockchainStatus.last_block.toLocaleString()} | 
          Gas Price: {blockchainStatus.gas_price.standard} Gwei
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="💰 My Credits" />
          <Tab label="🏭 Tokenization" />
          <Tab label="📊 Analytics" />
          <Tab label="⛓️ Blockchain" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          {/* Carbon Credits Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Token ID</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Credits Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Market Value</TableCell>
                  <TableCell>Issuance Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {carbonCredits.map((credit) => (
                  <TableRow key={credit.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {credit.id}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {credit.verification_standards.join(', ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {credit.project_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" color="primary.main">
                        {credit.credits_amount} tCO₂
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(credit.status)}
                        label={credit.status.toUpperCase()}
                        color={getStatusColor(credit.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ₹{credit.market_value.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ~₹{(credit.market_value / credit.credits_amount).toFixed(0)}/tCO₂
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(credit.issuance_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Send Credits">
                        <IconButton size="small">
                          <SendIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View on Blockchain">
                        <IconButton 
                          size="small"
                          onClick={() => credit.transaction_hash && window.open(`https://mumbai.polygonscan.com/tx/${credit.transaction_hash}`, '_blank')}
                          disabled={!credit.transaction_hash}
                        >
                          <LinkIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Certificate">
                        <IconButton size="small">
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* Tokenization History */}
          <Box>
            <Typography variant="h6" gutterBottom>
              🏭 Tokenization History
            </Typography>
            <List>
              {tokenizationHistory.map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {item.status === 'completed' ? <CheckCircleIcon color="success" /> : <PendingIcon color="warning" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${item.project} - ${item.credits} tCO₂`}
                    secondary={`${item.date} | Status: ${item.status} | TX: ${item.tx_hash?.substring(0, 20)}...`}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewBlockchainHistory(item.project)}
                  >
                    View Details
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* Analytics */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📈 Portfolio Summary
                  </Typography>
                  <Typography variant="h3" color="primary.main">
                    {carbonCredits.reduce((sum, credit) => sum + credit.credits_amount, 0).toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Carbon Credits (tCO₂)
                  </Typography>
                  <Typography variant="h5" color="success.main" sx={{ mt: 1 }}>
                    ₹{carbonCredits.reduce((sum, credit) => sum + credit.market_value, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Portfolio Value
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🌿 Impact Metrics
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {carbonCredits.reduce((sum, credit) => sum + credit.credits_amount, 0).toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    tCO₂ Sequestered
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Equivalent to removing <strong>{Math.round(carbonCredits.reduce((sum, credit) => sum + credit.credits_amount, 0) / 4.6)}</strong> cars from roads for a year
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📊 Verification Standards Distribution
                  </Typography>
                  <Grid container spacing={2}>
                    {['VERRA_VCS', 'GOLD_STANDARD', 'CDM'].map((standard) => {
                      const count = carbonCredits.filter(credit => 
                        credit.verification_standards.includes(standard)
                      ).length;
                      return (
                        <Grid item xs={4} key={standard}>
                          <Card variant="outlined">
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="primary.main">
                                {count}
                              </Typography>
                              <Typography variant="body2">
                                {standard.replace('_', ' ')}
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
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {/* Blockchain Information */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ⛓️ Network Information
                  </Typography>
                  {blockchainStatus && (
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Network"
                          secondary={blockchainStatus.network}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Latest Block"
                          secondary={blockchainStatus.last_block?.toLocaleString()}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Gas Price"
                          secondary={`${blockchainStatus.gas_price?.standard} Gwei`}
                        />
                      </ListItem>
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📋 Smart Contracts
                  </Typography>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Carbon Credit Token (BCC)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2">
                        Contract: 0x1234567890abcdef1234567890abcdef12345678
                      </Typography>
                      <Typography variant="body2">
                        Total Supply: 1,247.5 BCC
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<LinkIcon />}
                        onClick={() => window.open('https://mumbai.polygonscan.com/address/0x1234567890abcdef1234567890abcdef12345678', '_blank')}
                      >
                        View on PolygonScan
                      </Button>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Project Registry</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2">
                        Contract: 0x742d35Cc6634C0532925a3b8D5c65E1c3F1234AB
                      </Typography>
                      <Typography variant="body2">
                        Registered Projects: 15
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<LinkIcon />}
                        onClick={() => window.open('https://mumbai.polygonscan.com/address/0x742d35Cc6634C0532925a3b8D5c65E1c3F1234AB', '_blank')}
                      >
                        View on PolygonScan
                      </Button>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Tokenization Dialog */}
      <Dialog
        open={tokenizationDialog}
        onClose={() => setTokenizationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          🏭 Tokenize Carbon Credits
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Project ID"
              value={tokenizeData.project_id}
              onChange={(e) => setTokenizeData({...tokenizeData, project_id: e.target.value})}
              sx={{ mb: 2 }}
              helperText="Enter the project ID that has been approved for tokenization"
            />
            <TextField
              fullWidth
              type="number"
              label="Credits Amount (tCO₂)"
              value={tokenizeData.credits_amount}
              onChange={(e) => setTokenizeData({...tokenizeData, credits_amount: e.target.value})}
              sx={{ mb: 2 }}
              helperText="Amount of carbon credits to tokenize"
            />
            <TextField
              fullWidth
              label="Recipient Address (Optional)"
              value={tokenizeData.recipient}
              onChange={(e) => setTokenizeData({...tokenizeData, recipient: e.target.value})}
              placeholder={userWallet?.address}
              helperText="Leave empty to use your wallet address"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTokenizationDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleTokenize}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <TokenIcon />}
          >
            {loading ? 'Tokenizing...' : 'Tokenize Credits'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CarbonCredits;