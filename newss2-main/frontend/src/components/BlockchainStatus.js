import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Grid,
  CircularProgress,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  AccountBalanceWallet,
  Link as LinkIcon,
  LinkOff,
  Refresh,
  Info,
  ContentCopy,
  OpenInNew,
  CheckCircle,
  Pending,
  Error,
  Analytics,
  Storage,
  Speed,
  EmojiEvents,
  Warning,
  Nature
} from '@mui/icons-material';
import { useBlockchain } from '../contexts/BlockchainContext';

const BlockchainStatus = ({ projectData, aiAnalysis, blockchainData }) => {
  const {
    isConnected,
    account,
    networkInfo,
    carbonBalance,
    contractAddresses,
    hasMetaMask,
    loading,
    error,
    canConnect,
    needsMetaMask,
    initializeBlockchain,
    disconnect,
    refreshUserData,
    formatAddress
  } = useBlockchain();

  const [showDetails, setShowDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Handle connect button click
  const handleConnect = async () => {
    await initializeBlockchain();
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Open in block explorer
  const openInExplorer = (address) => {
    window.open(`https://amoy.polygonscan.com/address/${address}`, '_blank');
  };

  const getStatusColor = (score) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'warning';
    if (score >= 55) return 'info';
    return 'error';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle color="success" />;
      case 'requires_review':
        return <Pending color="warning" />;
      case 'needs_improvement':
        return <Error color="error" />;
      default:
        return <Pending color="info" />;
    }
  };

  const getCategoryDescription = (category) => {
    switch (category) {
      case 'excellent':
        return 'Outstanding project quality with comprehensive data';
      case 'good':
        return 'Good project quality meeting all requirements';
      case 'acceptable':
        return 'Acceptable project quality with minor improvements needed';
      case 'poor':
        return 'Project quality needs significant improvement';
      default:
        return 'Project quality assessment pending';
    }
  };

  // Render MetaMask installation prompt
  if (needsMetaMask) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              🦊 MetaMask Required
            </Typography>
            <Typography variant="body2">
              MetaMask is required for blockchain features. Please install MetaMask browser extension.
            </Typography>
          </Alert>
          <Button
            variant="contained"
            color="primary"
            href="https://metamask.io/download/"
            target="_blank"
            startIcon={<OpenInNew />}
          >
            Install MetaMask
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Wallet Connection Status */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Box display="flex" alignItems="center" gap={2}>
                <AccountBalanceWallet color={isConnected ? "success" : "disabled"} />
                <Box>
                  <Typography variant="h6" component="div">
                    Blockchain Wallet
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {loading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Chip
                        label={isConnected ? "Connected" : "Disconnected"}
                        color={isConnected ? "success" : "default"}
                        size="small"
                        icon={isConnected ? <LinkIcon /> : <LinkOff />}
                      />
                    )}
                    {isConnected && account && (
                      <Chip
                        label={formatAddress(account)}
                        size="small"
                        variant="outlined"
                        onClick={() => copyToClipboard(account)}
                        clickable
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box display="flex" gap={1} justifyContent="flex-end" flexWrap="wrap">
                {canConnect && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConnect}
                    disabled={loading}
                    size="small"
                  >
                    Connect Wallet
                  </Button>
                )}
                
                {isConnected && (
                  <>
                    <Tooltip title="Refresh Data">
                      <IconButton
                        onClick={handleRefresh}
                        disabled={refreshing}
                        size="small"
                      >
                        {refreshing ? <CircularProgress size={20} /> : <Refresh />}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="View Details">
                      <IconButton
                        onClick={() => setShowDetails(true)}
                        size="small"
                      >
                        <Info />
                      </IconButton>
                    </Tooltip>
                    
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={disconnect}
                      size="small"
                    >
                      Disconnect
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {isConnected && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {carbonBalance}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Carbon Credits
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="secondary">
                    {networkInfo?.chainId || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Chain ID
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h6">
                    {networkInfo?.blockNumber || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Block Number
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h6">
                    {networkInfo?.gasPrice || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Gas Price
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Project Status & Analysis (only show if project data is provided) */}
      {projectData && (
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔗 Project Blockchain Status
            </Typography>
            
            {/* Overall Project Status */}
            <Box mb={3}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  {getStatusIcon(projectData.current_status)}
                </Grid>
                <Grid item xs>
                  <Typography variant="h6">
                    Project ID: {projectData.project_id}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Status: {projectData.current_status.replace('_', ' ').toUpperCase()}
                  </Typography>
                </Grid>
                <Grid item>
                  <Chip
                    label={`${projectData.verification_score}/100`}
                    color={getStatusColor(projectData.verification_score)}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* AI Analysis Results */}
            {aiAnalysis && (
              <Box mt={3} mb={3}>
                <Typography variant="h6" gutterBottom>
                  🤖 AI Verification Analysis
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Analytics color="primary" />
                          <Typography variant="subtitle1" ml={1}>
                            Overall Score
                          </Typography>
                        </Box>
                        <Typography variant="h4" color={getStatusColor(aiAnalysis.overall_score)}>
                          {aiAnalysis.overall_score}/100
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Category: {aiAnalysis.category || 'Unknown'}
                        </Typography>
                        <Typography variant="caption">
                          {getCategoryDescription(aiAnalysis.category)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Detailed Scores
                        </Typography>
                        {aiAnalysis.detailed_scores && Object.entries(aiAnalysis.detailed_scores).map(([key, scoreData]) => (
                          <Box key={key} mb={1}>
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">
                                {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {typeof scoreData === 'object' ? scoreData.score : scoreData}/100
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={typeof scoreData === 'object' ? scoreData.score : scoreData}
                              color={getStatusColor(typeof scoreData === 'object' ? scoreData.score : scoreData)}
                            />
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Ecosystem Assessment */}
                {aiAnalysis.ecosystem_assessment && (
                  <Box mt={2}>
                    <Alert severity="info" icon={<Nature />}>
                      <Typography variant="subtitle2" gutterBottom>
                        Ecosystem Assessment: {aiAnalysis.ecosystem_assessment.ecosystem_type}
                      </Typography>
                      <Typography variant="body2">
                        Location Suitable: {aiAnalysis.ecosystem_assessment.location_suitable ? 'Yes' : 'No'} | 
                        Expected Carbon Range: {aiAnalysis.ecosystem_assessment.expected_carbon_range?.join('-')} tCO2/ha/year
                      </Typography>
                    </Alert>
                  </Box>
                )}

                {/* Recommendations */}
                {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                  <Box mt={2}>
                    <Alert severity="info" icon={<Info />}>
                      <Typography variant="subtitle2" gutterBottom>
                        Recommendations:
                      </Typography>
                      <List dense>
                        {aiAnalysis.recommendations.map((rec, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={rec} />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  </Box>
                )}

                {/* Warnings */}
                {aiAnalysis.warnings && aiAnalysis.warnings.length > 0 && (
                  <Box mt={2}>
                    <Alert severity="warning" icon={<Warning />}>
                      <Typography variant="subtitle2" gutterBottom>
                        Warnings:
                      </Typography>
                      <List dense>
                        {aiAnalysis.warnings.map((warning, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={warning} />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  </Box>
                )}
              </Box>
            )}

            <Divider />

            {/* Blockchain Registration Status */}
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                ⛓️ Blockchain Registration
              </Typography>
              
              {blockchainData && blockchainData.registered ? (
                <Alert severity="success" icon={<CheckCircle />}>
                  <Typography variant="subtitle2" gutterBottom>
                    Successfully Registered on Polygon Amoy Testnet
                  </Typography>
                  <Box mt={1}>
                    <Typography variant="body2">
                      <strong>Blockchain ID:</strong> {blockchainData.blockchain_id}
                    </Typography>
                    {blockchainData.tx_hash && (
                      <Typography variant="body2">
                        <strong>Transaction Hash:</strong>
                        <Box component="span" sx={{ wordBreak: 'break-all', ml: 1 }}>
                          {blockchainData.tx_hash}
                        </Box>
                      </Typography>
                    )}
                    <Typography variant="caption" color="textSecondary">
                      Your project data is now permanently stored on the blockchain
                    </Typography>
                  </Box>
                </Alert>
              ) : (
                <Alert severity="warning" icon={<Pending />}>
                  <Typography variant="subtitle2">
                    Blockchain Registration Pending
                  </Typography>
                  <Typography variant="body2">
                    Projects with scores ≥70 are automatically registered on blockchain. 
                    {projectData.verification_score < 70 && 
                      ' Improve your project quality to enable blockchain registration.'
                    }
                  </Typography>
                </Alert>
              )}
            </Box>

            {/* Performance Metrics */}
            <Box mt={3}>
              <Alert severity="info">
                <Typography variant="subtitle2" gutterBottom>
                  🎯 Performance Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Storage color="primary" />
                      <Typography variant="caption" display="block">
                        IPFS Storage
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {projectData.blockchain?.registered ? 'Active' : 'Pending'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <AccountBalanceWallet color="primary" />
                      <Typography variant="caption" display="block">
                        Blockchain
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {blockchainData?.registered ? 'Registered' : 'Pending'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Analytics color="primary" />
                      <Typography variant="caption" display="block">
                        AI Score
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {aiAnalysis?.category || 'Pending'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <EmojiEvents color="primary" />
                      <Typography variant="caption" display="block">
                        Status
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {projectData.current_status.replace('_', ' ')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Alert>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Details Dialog */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>🔗 Blockchain Connection Details</DialogTitle>
        <DialogContent>
          {isConnected ? (
            <List>
              <ListItem>
                <ListItemText
                  primary="Wallet Address"
                  secondary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {account}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(account)}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openInExplorer(account)}
                      >
                        <OpenInNew fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Network"
                  secondary={`Polygon Amoy Testnet (Chain ID: ${networkInfo?.chainId})`}
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Carbon Credit Balance"
                  secondary={`${carbonBalance} Credits`}
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Contract Addresses"
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      {Object.entries(contractAddresses).map(([name, address]) => (
                        <Box key={name} display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                          <Typography variant="caption" sx={{ minWidth: 120 }}>
                            {name}:
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                            {address}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(address)}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openInExplorer(address)}
                          >
                            <OpenInNew fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  }
                />
              </ListItem>
            </List>
          ) : (
            <Alert severity="info">
              Connect your wallet to view blockchain details.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BlockchainStatus;