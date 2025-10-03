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
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

// Import only necessary icons to avoid circular dependencies
import SendIcon from '@mui/icons-material/Send';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const PaymentDistribution = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Transfer dialog state
  const [transferDialog, setTransferDialog] = useState(false);
  const [transferData, setTransferData] = useState({
    recipient_address: '',
    amount: '',
    token_type: 'BCC',
    purpose: ''
  });

  // Data states
  const [wallet, setWallet] = useState(null);
  const [transferHistory, setTransferHistory] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);

  useEffect(() => {
    // Get user info
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }

    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      // Mock wallet data
      setWallet({
        address: '0x742d35Cc6634C0532925a3b8D5c65E1c3F1234AB',
        bcc_balance: 245.8,
        matic_balance: 15.67,
        inr_equivalent: 7374.0
      });

      // Mock transfer history
      setTransferHistory([
        {
          id: 'TXN_001',
          type: 'sent',
          amount: 50.0,
          token: 'BCC',
          recipient: '0x1234567890abcdef1234567890abcdef12345678',
          recipient_name: 'Sundarbans Community Group',
          purpose: 'Project revenue share',
          timestamp: '2024-03-15T10:30:00Z',
          status: 'completed',
          tx_hash: '0xabc123def456ghi789jkl012mno345pqr678stu901',
          gas_fee: 0.002
        },
        {
          id: 'TXN_002',
          type: 'received',
          amount: 89.3,
          token: 'BCC',
          sender: '0x9876543210fedcba9876543210fedcba98765432',
          sender_name: 'Carbon Credit Marketplace',
          purpose: 'Credit sale payment',
          timestamp: '2024-03-10T14:15:00Z',
          status: 'completed',
          tx_hash: '0xdef456ghi789jkl012mno345pqr678stu901abc123',
          gas_fee: 0.0015
        },
        {
          id: 'TXN_003',
          type: 'sent',
          amount: 25.5,
          token: 'BCC',
          recipient: '0xabcdef1234567890abcdef1234567890abcdef12',
          recipient_name: 'Kerala Fisherman Cooperative',
          purpose: 'Community benefit sharing',
          timestamp: '2024-03-08T09:45:00Z',
          status: 'pending',
          tx_hash: '0x123456789abcdef123456789abcdef123456789ab',
          gas_fee: 0.0018
        }
      ]);

      // Mock saved recipients
      setRecipients([
        {
          name: 'Sundarbans Community Group',
          address: '0x1234567890abcdef1234567890abcdef12345678',
          type: 'Community'
        },
        {
          name: 'Kerala Fisherman Cooperative',
          address: '0xabcdef1234567890abcdef1234567890abcdef12',
          type: 'Community'
        },
        {
          name: 'NCCR Research Fund',
          address: '0x742d35Cc6634C0532925a3b8D5c65E1c3F1234AB',
          type: 'Government'
        }
      ]);

      // Mock payment statistics
      setPaymentStats({
        total_sent: 125.5,
        total_received: 189.3,
        pending_payments: 1,
        completed_payments: 2,
        total_gas_fees: 0.0053
      });

    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferData.recipient_address || !transferData.amount) {
      alert('Please fill in recipient address and amount');
      return;
    }

    const amount = parseFloat(transferData.amount);
    if (amount <= 0 || amount > wallet.bcc_balance) {
      alert('Invalid amount or insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8002/api/payments/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from_address: wallet.address,
          to_address: transferData.recipient_address,
          amount: amount,
          token_type: transferData.token_type,
          purpose: transferData.purpose,
          user_id: userInfo?.email || 'user'
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Transfer initiated successfully! Transaction ID: ${result.transaction_id}`);
        setTransferDialog(false);
        setTransferData({ recipient_address: '', amount: '', token_type: 'BCC', purpose: '' });
        fetchPaymentData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Transfer failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error initiating transfer:', error);
      alert('Error initiating transfer');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRecipient = (recipient) => {
    setTransferData({
      ...transferData,
      recipient_address: recipient.address
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'pending': return <PendingIcon />;
      case 'failed': return <ErrorIcon />;
      default: return <PendingIcon />;
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h3" gutterBottom>
              💳 Payment Distribution
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Blockchain-based carbon credit transfers and payments
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {userInfo ? `User: ${userInfo.email}` : 'Guest Access'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={fetchPaymentData} color="primary">
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => setTransferDialog(true)}
            >
              New Transfer
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
      {wallet && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                    <AccountBalanceWalletIcon />
                  </Avatar>
                  <Typography variant="h6">BCC Balance</Typography>
                </Box>
                <Typography variant="h4" color="primary.main">
                  {wallet.bcc_balance.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Blue Carbon Credits
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 1 }}>
                    <PaymentIcon />
                  </Avatar>
                  <Typography variant="h6">MATIC Balance</Typography>
                </Box>
                <Typography variant="h4" color="secondary.main">
                  {wallet.matic_balance.toFixed(3)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  For gas fees
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 1 }}>
                    <AccountBalanceIcon />
                  </Avatar>
                  <Typography variant="h6">INR Value</Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  ₹{wallet.inr_equivalent.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Approximate value
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Wallet Address
                </Typography>
                <Chip 
                  label={formatAddress(wallet.address)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="textSecondary">
                  Click to copy full address
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Payment Statistics */}
      {paymentStats && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Payment Statistics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} md={2}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {paymentStats.total_received.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Received
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={2}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {paymentStats.total_sent.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Sent
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={2}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    {paymentStats.completed_payments}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Completed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={2}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {paymentStats.pending_payments}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={2}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {paymentStats.total_gas_fees.toFixed(4)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Gas Fees (MATIC)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Transfer History */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Recent Transfers
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Counterparty</TableCell>
                  <TableCell>Purpose</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Transaction</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transferHistory.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <Chip
                        icon={transfer.type === 'sent' ? <RemoveIcon /> : <AddIcon />}
                        label={transfer.type.toUpperCase()}
                        color={transfer.type === 'sent' ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {transfer.amount} {transfer.token}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Gas: {transfer.gas_fee} MATIC
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transfer.recipient_name || transfer.sender_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatAddress(transfer.recipient || transfer.sender)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transfer.purpose}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(transfer.status)}
                        label={transfer.status.toUpperCase()}
                        color={getStatusColor(transfer.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(transfer.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View on Blockchain">
                        <IconButton
                          size="small"
                          onClick={() => window.open(`https://mumbai.polygonscan.com/tx/${transfer.tx_hash}`, '_blank')}
                        >
                          <ReceiptIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Transfer Dialog */}
      <Dialog
        open={transferDialog}
        onClose={() => setTransferDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          💸 Send Carbon Credits
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Quick Recipients */}
            <Typography variant="h6" gutterBottom>
              Quick Recipients
            </Typography>
            <Grid container spacing={1} sx={{ mb: 3 }}>
              {recipients.map((recipient, index) => (
                <Grid item key={index}>
                  <Chip
                    label={recipient.name}
                    variant="outlined"
                    clickable
                    onClick={() => handleQuickRecipient(recipient)}
                    sx={{ mb: 1 }}
                  />
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ mb: 3 }} />

            {/* Transfer Form */}
            <TextField
              fullWidth
              label="Recipient Address"
              value={transferData.recipient_address}
              onChange={(e) => setTransferData({...transferData, recipient_address: e.target.value})}
              sx={{ mb: 2 }}
              helperText="Ethereum wallet address of the recipient"
            />
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  type="number"
                  label="Amount"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                  helperText={`Available: ${wallet?.bcc_balance || 0} BCC`}
                  inputProps={{ min: 0, max: wallet?.bcc_balance || 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Token</InputLabel>
                  <Select
                    value={transferData.token_type}
                    label="Token"
                    onChange={(e) => setTransferData({...transferData, token_type: e.target.value})}
                  >
                    <MenuItem value="BCC">BCC (Blue Carbon Credits)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Purpose (Optional)"
              value={transferData.purpose}
              onChange={(e) => setTransferData({...transferData, purpose: e.target.value})}
              placeholder="e.g., Project revenue share, Community benefit payment"
              helperText="Description of the transfer purpose"
            />

            {/* Transfer Preview */}
            {transferData.amount && transferData.recipient_address && (
              <Card variant="outlined" sx={{ mt: 3, p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  Transfer Preview
                </Typography>
                <Typography variant="body2">
                  <strong>Amount:</strong> {transferData.amount} {transferData.token_type}
                </Typography>
                <Typography variant="body2">
                  <strong>To:</strong> {formatAddress(transferData.recipient_address)}
                </Typography>
                <Typography variant="body2">
                  <strong>Estimated Gas:</strong> ~0.002 MATIC
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Network:</strong> Polygon Mumbai Testnet
                </Typography>
              </Card>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleTransfer}
            disabled={loading || !transferData.recipient_address || !transferData.amount}
            startIcon={loading ? <CircularProgress size={20} /> : <SwapHorizIcon />}
          >
            {loading ? 'Processing...' : 'Send Transfer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Alert severity="info" sx={{ mt: 3 }}>
        🔐 <strong>Secure Transfers:</strong> All transactions are recorded on the Polygon blockchain for transparency and immutability. 
        Gas fees are automatically calculated and deducted from your MATIC balance.
      </Alert>
    </Container>
  );
};

export default PaymentDistribution;