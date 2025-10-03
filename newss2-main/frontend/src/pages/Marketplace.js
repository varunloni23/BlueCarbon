import React, { useState, useEffect, useCallback } from 'react';
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
  Avatar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  ShoppingCart,
  Store as MarketIcon,
  AccountBalance as CreditIcon,
  TrendingUp as TrendIcon,
  Verified as VerifiedIcon,
  Nature as EcoIcon,
  LocationOn as LocationIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const Marketplace = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Get user info
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
    loadListings();
  }, []);

    const loadListings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8002/api/marketplace');
      const result = await response.json();
      
      // Add mock data if empty
      const mockListings = [
        {
          id: 'LIST_001',
          project_id: 'BC_PROD001',
          project_name: 'Sundarbans Mangrove Restoration',
          ecosystem_type: 'mangrove',
          credits_available: 245,
          price_per_credit: 500,
          seller: 'Sundarbans Community Collective',
          location: 'West Bengal Coast',
          verification_status: 'verified',
          description: 'High-quality carbon credits from community-led mangrove restoration',
          created_at: '2024-01-15T10:00:00Z',
          status: 'active'
        },
        {
          id: 'LIST_002',
          project_id: 'BC_PROD002',
          project_name: 'Tamil Nadu Seagrass Revival',
          ecosystem_type: 'seagrass',
          credits_available: 180,
          price_per_credit: 450,
          seller: 'Tamil Nadu Coastal Conservation',
          location: 'Tamil Nadu Coast',
          verification_status: 'verified',
          description: 'Premium seagrass restoration carbon credits with biodiversity co-benefits',
          created_at: '2024-01-18T14:30:00Z',
          status: 'active'
        },
        {
          id: 'LIST_003',
          project_id: 'BC_PROD003',
          project_name: 'Odisha Salt Marsh Conservation',
          ecosystem_type: 'salt_marsh',
          credits_available: 120,
          price_per_credit: 400,
          seller: 'Odisha Wetland Foundation',
          location: 'Odisha Coast',
          verification_status: 'verified',
          description: 'Salt marsh conservation credits supporting coastal resilience',
          created_at: '2024-01-20T09:15:00Z',
          status: 'active'
        }
      ];

      setListings(result.listings?.length > 0 ? result.listings : mockListings);
    } catch (error) {
      console.error('Error loading listings:', error);
      enqueueSnackbar('Failed to load marketplace listings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const handlePurchase = async () => {
    try {
      const purchaseData = {
        listing_id: selectedListing.id,
        credits: parseInt(quantity),
        total_amount: parseInt(quantity) * selectedListing.price_per_credit,
        buyer_email: userInfo?.email
      };

      const response = await fetch('http://localhost:8002/api/marketplace/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData)
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        enqueueSnackbar(`Successfully purchased ${quantity} carbon credits!`, { variant: 'success' });
        setPurchaseDialog(false);
        setQuantity('');
        loadListings(); // Refresh listings
      } else {
        throw new Error(result.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      enqueueSnackbar('Failed to complete purchase', { variant: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const getEcosystemIcon = (type) => {
    switch (type) {
      case 'mangrove':
        return '🌿';
      case 'seagrass':
        return '🌱';
      case 'salt_marsh':
        return '🌾';
      case 'coastal_wetland':
        return '💧';
      default:
        return '🌊';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h3" gutterBottom>
              🏪 Carbon Credit Marketplace
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Trade verified blue carbon credits from coastal restoration projects
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {userInfo ? `Welcome, ${userInfo.email}` : 'Marketplace Dashboard'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={loadListings} color="primary">
              <RefreshIcon />
            </IconButton>
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

      {/* Market Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                  <CreditIcon />
                </Avatar>
                <Typography variant="h6">Total Credits</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {listings.reduce((sum, l) => sum + (l.credits_available || l.credit_amount || 0), 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Available for purchase
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 1 }}>
                  <TrendIcon />
                </Avatar>
                <Typography variant="h6">Avg Price</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                ₹{Math.round(listings.reduce((sum, l) => sum + (l.price_per_credit || l.price || 0), 0) / (listings.length || 1))}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Per carbon credit
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 1 }}>
                  <MarketIcon />
                </Avatar>
                <Typography variant="h6">Active Listings</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {listings.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Projects selling credits
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 1 }}>
                  <EcoIcon />
                </Avatar>
                <Typography variant="h6">CO₂ Offset</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {(listings.reduce((sum, l) => sum + (l.credits_available || l.credit_amount || 0), 0) * 1.0).toLocaleString()}t
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total CO₂ equivalent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="success" sx={{ mb: 3 }}>
        🌊 Trade verified blue carbon credits from restoration projects | All credits are blockchain-verified
      </Alert>

      <Grid container spacing={3}>
        {listings.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No carbon credits available
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Check back later for verified carbon credits from blue carbon projects
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          listings.map((listing) => (
            <Grid item xs={12} md={6} lg={4} key={listing.listing_id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6">
                      {listing.credit_amount} Credits
                    </Typography>
                    <Chip
                      label={listing.status}
                      color="primary"
                      size="small"
                    />
                  </Box>

                  <Typography variant="h4" color="primary" gutterBottom>
                    {listing.price_per_credit} MATIC
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block">
                    per credit
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
                    <strong>Project:</strong> {listing.project_id}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Total Value:</strong> {listing.total_value} MATIC
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Certification:</strong> {listing.certification_level || 'Verified'}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 3 }}>
                    {listing.description}
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    onClick={() => {
                      setSelectedListing(listing);
                      setPurchaseDialog(true);
                    }}
                  >
                    Purchase Credits
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialog} onClose={() => setPurchaseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Purchase Carbon Credits</DialogTitle>
        <DialogContent>
          {selectedListing && (
            <Box>
              <Typography gutterBottom>
                <strong>Available Credits:</strong> {selectedListing.credit_amount}
              </Typography>
              <Typography gutterBottom>
                <strong>Price per Credit:</strong> {selectedListing.price_per_credit} MATIC
              </Typography>
              
              <TextField
                fullWidth
                type="number"
                label="Quantity to Purchase"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                sx={{ mt: 2, mb: 2 }}
                inputProps={{ 
                  min: 0.1, 
                  max: selectedListing.credit_amount,
                  step: 0.1 
                }}
              />
              
              {quantity && (
                <Typography variant="h6" color="primary">
                  Total: {(parseFloat(quantity) * selectedListing.price_per_credit).toFixed(2)} MATIC
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePurchase}
            disabled={!quantity || parseFloat(quantity) <= 0}
          >
            Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Marketplace;
