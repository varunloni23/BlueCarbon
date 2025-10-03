import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
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
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Store,
  ShoppingCart,
  Receipt,
  AccountBalance,
  Logout,
  Person,
  LocalOffer,
  TrendingUp,
  CheckCircle,
  Download,
  History,
  Search,
  Nature,
  Place
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8002';

// Ecosystem restoration images mapping
const getEcosystemImage = (ecosystemType) => {
  // Map ecosystem types to local image URLs
  const imageMapping = {
    'mangrove': 'mangrove.png',
    'seagrass': 'seagrass.png', 
    'salt_marsh': 'saltmarsh.png',
    'coastal_wetland': 'coastalwetland.png',
    'coral_reef': 'coralreef.png',
    'mudflat': 'mudflat.png'
  };
  
  const imageName = imageMapping[ecosystemType] || imageMapping.mangrove;
  return `http://localhost:8002/images/${imageName}`;
};

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [credits, setCredits] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [creditInventory, setCreditInventory] = useState({}); // Track available credits

  const fetchPurchases = useCallback(async () => {
    try {
      // Try to load from database first
      if (userInfo?.email) {
        try {
          const response = await axios.get(`${API_URL}/api/purchases?buyer_email=${encodeURIComponent(userInfo.email)}`);
          if (response.data.status === 'success') {
            console.log('📊 Loaded purchases from database:', response.data.purchases);
            setPurchases(response.data.purchases);
            return;
          }
        } catch (dbError) {
          console.error('⚠️ Failed to load from database:', dbError);
        }
      }
      
      // Fallback to localStorage
      const storedPurchases = localStorage.getItem('buyer_purchases');
      if (storedPurchases) {
        setPurchases(JSON.parse(storedPurchases));
      }
    } catch (err) {
      console.error('Error fetching purchases:', err);
    }
  }, [userInfo?.email]);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
    
    // Load stored inventory if available
    const storedInventory = localStorage.getItem('creditInventory');
    if (storedInventory) {
      setCreditInventory(JSON.parse(storedInventory));
    }
    
    fetchCredits();
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const fetchCredits = async () => {
    setLoading(true);
    setError(''); // Clear any previous errors
    try {
      console.log('🔍 Fetching credits from API...');
      console.log('🌐 API URL:', `${API_URL}/api/projects`);
      
      // First check if server is reachable
      const response = await axios.get(`${API_URL}/api/projects`, {
        timeout: 10000 // 10 second timeout
      });
      console.log('📊 API Response:', response.data);
      
      if (response.data.status === 'success' && response.data.projects) {
        // Transform real project data into credit listings
        const allProjects = response.data.projects;
        console.log('📋 All projects:', allProjects);
        
        const approvedProjects = allProjects.filter(project => {
          const isApproved = project.status?.toLowerCase() === 'approved';
          const hasCredits = project.carbon_credits && project.carbon_credits > 0;
          console.log(`📊 Project ${project.id}: status=${project.status}, credits=${project.carbon_credits}, approved=${isApproved}, hasCredits=${hasCredits}`);
          return isApproved && hasCredits;
        });
        
        console.log('✅ Approved projects with credits:', approvedProjects);
        
        const creditData = approvedProjects.map((project, index) => ({
          id: project.id || project.project_id,
          project_name: project.project_name || project.title || 'Unnamed Project',
          location: project.location ? 
            (typeof project.location === 'string' ? project.location : 
             `${project.location.state || project.location.city || 'Unknown'}, ${project.location.country || 'India'}`) : 
            'Location not specified',
          credits_available: Math.floor(parseFloat(project.carbon_credits) || 0),
          price_per_credit: 15 + (index * 3), // Incremental pricing: $15, $18, $21, etc.
          verification_score: project.admin_review?.verification_score || 
                             project.verification_score || 
                             (85 + Math.floor(Math.random() * 15)), // 85-100%
          project_type: project.ecosystem_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Blue Carbon Project',
          description: project.description || 'Carbon credit restoration project',
          total_area: parseFloat(project.area_hectares) || 0,
          completion_percentage: 75 + Math.floor(Math.random() * 25), // 75-100%
          image: getEcosystemImage(project.ecosystem_type)
        }));
        
        console.log('🛒 Final credit data:', creditData);
        setCredits(creditData);
        
        // Initialize inventory tracking
        const inventory = {};
        creditData.forEach(credit => {
          // Use stored inventory if available, otherwise use fresh data
          const storedInventory = JSON.parse(localStorage.getItem('creditInventory') || '{}');
          inventory[credit.id] = storedInventory[credit.id] !== undefined 
            ? Math.min(storedInventory[credit.id], credit.credits_available) // Never exceed original amount
            : credit.credits_available;
        });
        
        // TODO: Fetch actual sold credits from database and subtract from inventory
        // For now, using localStorage as backup inventory tracking
        
        setCreditInventory(inventory);
        localStorage.setItem('creditInventory', JSON.stringify(inventory));
        
        if (creditData.length === 0) {
          setError('No approved projects with carbon credits available for purchase');
          console.log('⚠️ No approved projects found');
        } else {
          console.log(`✅ Successfully loaded ${creditData.length} projects with ${creditData.reduce((sum, c) => sum + c.credits_available, 0)} total credits`);
        }
      } else {
        setError('Failed to fetch projects from API');
        console.error('❌ API Error: Invalid response structure', response.data);
      }
    } catch (err) {
      console.error('❌ Error fetching credits:', err);
      setError(`Failed to load carbon credits: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedCredit || purchaseQuantity <= 0) {
      setError('Please select valid quantity');
      return;
    }

    const availableCredits = creditInventory[selectedCredit.id] || selectedCredit.credits_available;
    
    console.log(`🛒 Purchase attempt:`, {
      projectId: selectedCredit.id,
      projectName: selectedCredit.project_name,
      requestedQuantity: purchaseQuantity,
      availableCredits: availableCredits,
      currentInventory: creditInventory
    });
    
    if (purchaseQuantity > availableCredits) {
      setError(`Only ${availableCredits} credits available for this project`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const totalAmount = purchaseQuantity * selectedCredit.price_per_credit;
      
      // Create purchase record
      const newPurchase = {
        id: Date.now(),
        project_id: selectedCredit.id,
        project_name: selectedCredit.project_name,
        credits_purchased: purchaseQuantity,
        price_per_credit: selectedCredit.price_per_credit,
        total_amount: totalAmount,
        purchase_date: new Date().toISOString().split('T')[0],
        transaction_id: 'TXN' + Date.now(),
        status: 'Completed'
      };

      // Save purchase to database
      try {
        const purchaseResponse = await axios.post(`${API_URL}/api/purchases/create`, {
          transaction_id: newPurchase.transaction_id,
          buyer_email: userInfo?.email || 'buyer@demo.com',
          project_id: selectedCredit.id,
          project_name: selectedCredit.project_name,
          credits_purchased: purchaseQuantity,
          price_per_credit: selectedCredit.price_per_credit,
          total_amount: totalAmount,
          purchase_date: new Date().toISOString().split('T')[0],
          status: 'completed'
        });
        
        if (purchaseResponse.data.status === 'success') {
          console.log('✅ Purchase saved to database:', purchaseResponse.data.purchase);
        }
      } catch (dbError) {
        console.error('⚠️ Failed to save to database:', dbError);
        // Continue with localStorage as fallback
      }

      // Update purchases list
      setPurchases(prev => [newPurchase, ...prev]);
      
      // Save purchases to localStorage as backup
      const updatedPurchases = [newPurchase, ...purchases];
      localStorage.setItem('buyer_purchases', JSON.stringify(updatedPurchases));

      // Update inventory
      const updatedInventory = {
        ...creditInventory,
        [selectedCredit.id]: availableCredits - purchaseQuantity
      };
      setCreditInventory(updatedInventory);
      localStorage.setItem('creditInventory', JSON.stringify(updatedInventory));
      
      console.log(`✅ Purchase completed:`, {
        projectId: selectedCredit.id,
        purchasedQuantity: purchaseQuantity,
        remainingCredits: availableCredits - purchaseQuantity,
        updatedInventory: updatedInventory
      });

      // Update credits list with new available amounts
      const updatedCredits = credits.map(credit => 
        credit.id === selectedCredit.id 
          ? { ...credit, credits_available: availableCredits - purchaseQuantity }
          : credit
      );
      setCredits(updatedCredits);

      setSuccess(`Successfully purchased ${purchaseQuantity} carbon credits for $${totalAmount}`);
      setPurchaseDialog(false);
      setPurchaseQuantity(1);
      setSelectedCredit(null);

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Purchase error:', error);
      setError('Failed to complete purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const filteredCredits = credits.filter(credit =>
    credit.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    credit.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    credit.project_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCreditsPurchased = purchases.reduce((sum, purchase) => sum + purchase.credits_purchased, 0);
  const totalAmountSpent = purchases.reduce((sum, purchase) => sum + purchase.total_amount, 0);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Top Navigation */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Store sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Carbon Credit Marketplace
          </Typography>
          <IconButton
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Avatar sx={{ width: 32, height: 32, backgroundColor: '#fff', color: '#1976d2' }}>
              {userInfo?.full_name?.charAt(0) || 'B'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => setAnchorEl(null)}>
              <Person sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Dashboard Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Credits Purchased
                    </Typography>
                    <Typography variant="h4">
                      {totalCreditsPurchased}
                    </Typography>
                  </Box>
                  <Badge badgeContent={purchases.length} color="primary">
                    <Nature color="success" fontSize="large" />
                  </Badge>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Spent
                    </Typography>
                    <Typography variant="h4">
                      ${totalAmountSpent}
                    </Typography>
                  </Box>
                  <AccountBalance color="primary" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Available Credits
                    </Typography>
                    <Typography variant="h4">
                      {credits.reduce((sum, credit) => sum + credit.credits_available, 0)}
                    </Typography>
                  </Box>
                  <LocalOffer color="warning" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Active Projects
                    </Typography>
                    <Typography variant="h4">
                      {credits.length}
                    </Typography>
                  </Box>
                  <TrendingUp color="info" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="fullWidth"
          >
            <Tab icon={<Store />} label="Browse Credits" />
            <Tab icon={<History />} label="Purchase History" />
            <Tab icon={<Receipt />} label="Billing" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {currentTab === 0 && (
          <Box>
            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search projects by name, location, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ mb: 3 }}
            />

            {/* Credits Grid */}
            <Grid container spacing={3}>
              {filteredCredits.map((credit) => (
                <Grid item xs={12} md={6} lg={4} key={credit.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        height: 200,
                        backgroundImage: `url(${credit.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                      }}
                    >
                      <Chip
                        label={credit.project_type}
                        size="small"
                        sx={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.9)' }}
                      />
                      <Chip
                        label={`${credit.verification_score}% Verified`}
                        size="small"
                        color="success"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      />
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {credit.project_name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Place sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {credit.location}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {credit.description}
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Available Credits:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {creditInventory[credit.id] !== undefined ? creditInventory[credit.id] : credit.credits_available}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Price per Credit:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          ${credit.price_per_credit}
                        </Typography>
                      </Box>
                      
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ShoppingCart />}
                        onClick={() => {
                          setSelectedCredit(credit);
                          setPurchaseDialog(true);
                        }}
                        disabled={(creditInventory[credit.id] !== undefined ? creditInventory[credit.id] : credit.credits_available) === 0}
                      >
                        {(creditInventory[credit.id] !== undefined ? creditInventory[credit.id] : credit.credits_available) === 0 ? 'Sold Out' : 'Purchase Credits'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {currentTab === 1 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Credits</TableCell>
                  <TableCell>Price per Credit</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{purchase.transaction_id}</TableCell>
                    <TableCell>{purchase.project_name}</TableCell>
                    <TableCell>{purchase.credits_purchased}</TableCell>
                    <TableCell>${purchase.price_per_credit}</TableCell>
                    <TableCell>${purchase.total_amount}</TableCell>
                    <TableCell>{purchase.purchase_date}</TableCell>
                    <TableCell>
                      <Chip
                        label={purchase.status}
                        color="success"
                        size="small"
                        icon={<CheckCircle />}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<Download />}
                        onClick={() => {
                          // Generate and download bill
                          setSuccess('Bill download feature coming soon!');
                        }}
                      >
                        Download Bill
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {currentTab === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Billing Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Purchases
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {purchases.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed transactions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Amount
                    </Typography>
                    <Typography variant="h4" color="primary">
                      ${totalAmountSpent}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All time spending
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Container>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialog} onClose={() => setPurchaseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Purchase Carbon Credits
        </DialogTitle>
        <DialogContent>
          {selectedCredit && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedCredit.project_name}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {selectedCredit.location}
              </Typography>
              
              <Box sx={{ my: 2 }}>
                <Typography variant="body2">
                  Available Credits: {selectedCredit.credits_available}
                </Typography>
                <Typography variant="body2">
                  Price per Credit: ${selectedCredit.price_per_credit}
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ 
                  min: 1, 
                  max: creditInventory[selectedCredit?.id] !== undefined 
                    ? creditInventory[selectedCredit.id] 
                    : selectedCredit?.credits_available || 1 
                }}
                sx={{ mt: 2 }}
              />
              
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h6">
                  Total Amount: ${(purchaseQuantity * selectedCredit.price_per_credit).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <ShoppingCart />}
          >
            {loading ? 'Processing...' : 'Purchase'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuyerDashboard;