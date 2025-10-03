import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Photo as PhotoIcon,
  VideoFile as VideoIcon,
  Description as DocumentIcon,
  AudioFile as AudioIcon,
  Download as DownloadIcon,
  Launch as LaunchIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const IPFSMediaViewer = ({ open, onClose, projectId, projectName }) => {
  const [mediaData, setMediaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaDetailDialog, setMediaDetailDialog] = useState(false);

  useEffect(() => {
    if (open && projectId) {
      fetchMediaData();
    }
  }, [open, projectId]);

  const fetchMediaData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8002/api/ipfs/files/${projectId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setMediaData(data.media);
      } else {
        setError('Failed to load media data');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'photos': return <PhotoIcon />;
      case 'videos': return <VideoIcon />;
      case 'documents': return <DocumentIcon />;
      case 'audio': return <AudioIcon />;
      default: return <DocumentIcon />;
    }
  };

  const getMediaColor = (type) => {
    switch (type) {
      case 'photos': return '#4caf50';
      case 'videos': return '#2196f3';
      case 'documents': return '#ff9800';
      case 'audio': return '#9c27b0';
      default: return '#757575';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const handleMediaClick = (media, type) => {
    setSelectedMedia({ ...media, type });
    setMediaDetailDialog(true);
  };

  const renderMediaGrid = (mediaArray, type) => {
    if (!mediaArray || mediaArray.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="textSecondary">
            No {type} available
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {mediaArray.map((media, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)' }
              }}
              onClick={() => handleMediaClick(media, type)}
            >
              {type === 'photos' && (
                <CardMedia
                  component="img"
                  height={140}
                  image={media.gateway_url}
                  alt={media.filename}
                  sx={{ objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDNIMy4xOCNBMjAhMiAwMC0tMiAydjEuODJMMjEgMjF6IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                  }}
                />
              )}
              
              {type === 'videos' && (
                <Box 
                  sx={{ 
                    height: 140, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5'
                  }}
                >
                  <VideoIcon sx={{ fontSize: 48, color: getMediaColor(type) }} />
                </Box>
              )}
              
              {(type === 'documents' || type === 'audio') && (
                <Box 
                  sx={{ 
                    height: 140, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5'
                  }}
                >
                  {getMediaIcon(type)}
                  <Box sx={{ fontSize: 48, color: getMediaColor(type) }} />
                </Box>
              )}
              
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" noWrap>
                  {media.filename}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  {formatDate(media.uploaded_at)}
                </Typography>
                {media.size && (
                  <Typography variant="caption" color="textSecondary" display="block">
                    {formatFileSize(media.size)}
                  </Typography>
                )}
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={`IPFS: ${media.ipfs_hash.substring(0, 8)}...`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const mediaTypes = [
    { key: 'photos', label: 'Photos', icon: <PhotoIcon /> },
    { key: 'videos', label: 'Videos', icon: <VideoIcon /> },
    { key: 'documents', label: 'Documents', icon: <DocumentIcon /> },
    { key: 'audio', label: 'Audio', icon: <AudioIcon /> }
  ];

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhotoIcon color="primary" />
            <Typography variant="h6">
              IPFS Media - {projectName}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {mediaData && !loading && (
            <Box>
              <Paper sx={{ mb: 2 }}>
                <Tabs 
                  value={selectedTab} 
                  onChange={(e, newValue) => setSelectedTab(newValue)}
                  variant="fullWidth"
                >
                  {mediaTypes.map((type, index) => {
                    const count = mediaData[type.key]?.length || 0;
                    return (
                      <Tab
                        key={type.key}
                        icon={type.icon}
                        label={`${type.label} (${count})`}
                        iconPosition="start"
                      />
                    );
                  })}
                </Tabs>
              </Paper>
              
              {mediaTypes.map((type, index) => (
                <Box key={type.key} hidden={selectedTab !== index}>
                  {renderMediaGrid(mediaData[type.key], type.key)}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Media Detail Dialog */}
      <Dialog
        open={mediaDetailDialog}
        onClose={() => setMediaDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Media Details</Typography>
            <Box>
              <Tooltip title="Open in IPFS Gateway">
                <IconButton 
                  href={selectedMedia?.gateway_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LaunchIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton 
                  href={selectedMedia?.gateway_url} 
                  download={selectedMedia?.filename}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedMedia && (
            <Box>
              {selectedMedia.type === 'photos' && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <img 
                    src={selectedMedia.gateway_url}
                    alt={selectedMedia.filename}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '400px',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              )}
              
              {selectedMedia.type === 'videos' && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <video 
                    controls
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '400px'
                    }}
                  >
                    <source src={selectedMedia.gateway_url} />
                    Your browser does not support video playback.
                  </video>
                </Box>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedMedia.filename}
                </Typography>
                
                {selectedMedia.description && (
                  <Typography variant="body2" paragraph>
                    <strong>Description:</strong> {selectedMedia.description}
                  </Typography>
                )}
                
                <Typography variant="body2" paragraph>
                  <strong>IPFS Hash:</strong> {selectedMedia.ipfs_hash}
                </Typography>
                
                <Typography variant="body2" paragraph>
                  <strong>Uploaded:</strong> {formatDate(selectedMedia.uploaded_at)}
                </Typography>
                
                {selectedMedia.size && (
                  <Typography variant="body2" paragraph>
                    <strong>File Size:</strong> {formatFileSize(selectedMedia.size)}
                  </Typography>
                )}
                
                <Typography variant="body2" paragraph>
                  <strong>Gateway URL:</strong>{' '}
                  <a 
                    href={selectedMedia.gateway_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ wordBreak: 'break-all' }}
                  >
                    {selectedMedia.gateway_url}
                  </a>
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setMediaDetailDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IPFSMediaViewer;