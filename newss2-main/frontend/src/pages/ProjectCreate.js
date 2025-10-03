import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  LinearProgress,
} from '@mui/material';
import {
  PhotoCamera,
  VideoCall,

  GpsFixed,
  CloudUpload,
  Delete,
  Preview,
  Nature,
  Water,
  Thermostat,
  Speed,
  Analytics,
  Storage,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { projectAPI, handleAPIError } from '../services/api';
import { useSnackbar } from 'notistack';
import BlockchainStatus from '../components/BlockchainStatus';

const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
};

const ProjectCreate = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewDialog, setPreviewDialog] = useState({ open: false, file: null });
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showBlockchainStatus, setShowBlockchainStatus] = useState(false);
  
  // Generate a unique project ID that will be used consistently
  const [projectId] = useState(() => {
    return 'BC_' + Math.random().toString(36).substr(2, 8).toUpperCase();
  });
  
  // File input refs
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const documentInputRef = useRef(null);

  const [formData, setFormData] = useState({
    // Basic project info
    project_name: '',
    location: { lat: 19.0760, lng: 72.8777 }, // Default to Mumbai
    area_hectares: '',
    ecosystem_type: '',
    restoration_method: '',
    community_details: '',
    contact_email: '',
    phone_number: '',
    
    // Media files with geo-tagging
    media_files: {
      photos: [],
      videos: [],
      documents: [],
    },
    
    // Field measurements
    field_measurements: {
      water_quality: {
        ph_level: '',
        salinity: '',
        temperature: '',
        dissolved_oxygen: '',
      },
      soil_analysis: {
        carbon_content: '',
        nitrogen_level: '',
        phosphorus_level: '',
        moisture_content: '',
      },
      biodiversity: {
        species_count: '',
        vegetation_density: '',
        wildlife_observations: '',
      },
      environmental: {
        tide_level: '',
        weather_conditions: '',
        visibility: '',
      }
    },
    
    // GPS tracking
    gps_data: {
      waypoints: [],
      track_log: [],
      boundary_coordinates: [],
    },
    
    // IPFS and blockchain
    ipfs_hashes: [],
    blockchain_tx_hash: '',
  });

  const ecosystemTypes = [
    'mangrove',
    'seagrass',
    'salt_marsh',
    'coastal_wetland',
    'coral_reef',
    'mudflat',
  ];

  const restorationMethods = [
    'Natural regeneration',
    'Assisted regeneration',
    'Active restoration',
    'Hybrid approach',
    'Community-based restoration',
    'Scientific intervention',
  ];

  const steps = [
    'Project Details', 
    'Location & GPS', 
    'Media Upload', 
    'Field Measurements', 
    'Community Info', 
    'Blockchain & IPFS',
    'Review & Submit'
  ];

  // Get current GPS location
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setFormData(prev => ({ ...prev, location: newLocation }));
          enqueueSnackbar('Location updated successfully!', { variant: 'success' });
        },
        (error) => {
          enqueueSnackbar('Unable to get current location', { variant: 'warning' });
        },
        { enableHighAccuracy: true }
      );
    } else {
      enqueueSnackbar('Geolocation is not supported by this browser', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  // Add GPS waypoint
  const addWaypoint = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const waypoint = {
            id: Date.now(),
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString(),
            accuracy: position.coords.accuracy,
          };
          setFormData(prev => ({
            ...prev,
            gps_data: {
              ...prev.gps_data,
              waypoints: [...prev.gps_data.waypoints, waypoint]
            }
          }));
          enqueueSnackbar('Waypoint added successfully!', { variant: 'success' });
        },
        (error) => {
          enqueueSnackbar('Unable to get GPS location for waypoint', { variant: 'warning' });
        },
        { enableHighAccuracy: true }
      );
    }
  }, [enqueueSnackbar]);

  // Handle file upload with geo-tagging and real IPFS upload
  const handleFileUpload = async (files, type) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const uploadedFiles = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Get current location for geo-tagging
      const location = await new Promise((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
            }),
            () => resolve(formData.location) // Fallback to manual location
          );
        } else {
          resolve(formData.location);
        }
      });

      try {
        // Upload file to IPFS immediately
        const ipfsResult = await uploadToIPFS(file, type, location);
        
        const fileData = {
          id: Date.now() + i,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          location,
          timestamp: new Date().toISOString(),
          ipfs_hash: ipfsResult.ipfs_hash,
          gateway_url: ipfsResult.gateway_url,
          description: `${type} uploaded from project creation`,
        };

        uploadedFiles.push(fileData);
        setUploadProgress(((i + 1) / files.length) * 100);
        
      } catch (error) {
        console.error('IPFS upload failed for file:', file.name, error);
        enqueueSnackbar(`Failed to upload ${file.name} to IPFS`, { variant: 'error' });
      }
    }

    if (uploadedFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        media_files: {
          ...prev.media_files,
          [type]: [...prev.media_files[type], ...uploadedFiles]
        }
      }));

      enqueueSnackbar(`${uploadedFiles.length} ${type} uploaded to IPFS successfully!`, { variant: 'success' });
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  // Upload to IPFS using our backend API
  const uploadToIPFS = async (file, fileType, location) => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('file_type', fileType);
    uploadFormData.append('project_id', projectId); // Include the project ID
    uploadFormData.append('description', `${fileType} uploaded from project creation`);
    
    // Add location metadata if available
    if (location) {
      uploadFormData.append('metadata', JSON.stringify({
        location,
        ecosystem_type: formData.ecosystem_type,
        uploaded_from: 'project_creation'
      }));
    }

    const response = await fetch('http://localhost:8002/api/ipfs/upload', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'IPFS upload failed');
    }

    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(result.message || 'IPFS upload failed');
    }

    return {
      ipfs_hash: result.ipfs_hash,
      gateway_url: result.gateway_url,
      size: result.size
    };
  };

  // Remove uploaded file
  const removeFile = (type, fileId) => {
    setFormData(prev => ({
      ...prev,
      media_files: {
        ...prev.media_files,
        [type]: prev.media_files[type].filter(file => file.id !== fileId)
      }
    }));
    enqueueSnackbar('File removed successfully', { variant: 'info' });
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleNestedInputChange = (section, field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: event.target.value,
      }
    }));
  };

  const handleDeepNestedInputChange = (section, subsection, field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: event.target.value,
        }
      }
    }));
  };

  const handleLocationChange = (newPosition) => {
    setFormData(prev => ({
      ...prev,
      location: newPosition,
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Project Details
        return formData.project_name && formData.ecosystem_type && formData.restoration_method;
      case 1: // Location & GPS
        return formData.area_hectares && formData.location.lat && formData.location.lng;
      case 2: // Media Upload
        return (formData.media_files.photos.length > 0 || 
                formData.media_files.videos.length > 0 || 
                formData.media_files.documents.length > 0);
      case 3: // Field Measurements
        return (formData.field_measurements.water_quality.ph_level || 
                formData.field_measurements.soil_analysis.carbon_content ||
                formData.field_measurements.biodiversity.species_count);
      case 4: // Community Info
        return formData.community_details && formData.contact_email && formData.phone_number;
      case 5: // Blockchain & IPFS
        return true; // Optional step
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    } else {
      enqueueSnackbar('Please fill in required fields or add necessary data', { variant: 'warning' });
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Collect IPFS hashes from already uploaded files
      const ipfsHashes = [];
      for (const type in formData.media_files) {
        for (const fileData of formData.media_files[type]) {
          if (fileData.ipfs_hash) {
            ipfsHashes.push({
              hash: fileData.ipfs_hash,
              type,
              filename: fileData.name,
              location: fileData.location,
              timestamp: fileData.timestamp,
              gateway_url: fileData.gateway_url,
              size: fileData.size,
              description: fileData.description
            });
          }
        }
      }

      const projectData = {
        id: projectId, // Include the project ID
        ...formData,
        area_hectares: parseFloat(formData.area_hectares),
        ipfs_hashes: ipfsHashes,
        submission_timestamp: new Date().toISOString(),
        status: 'pending_verification',
        verification_score: 0,
      };

      const response = await projectAPI.create(projectData);
      
      // Store the enhanced response data
      setSubmissionResult(response);
      setShowBlockchainStatus(true);
      
      enqueueSnackbar(
        `Project submitted successfully! Your project is now under review.`, 
        { 
          variant: 'success',
          autoHideDuration: 6000
        }
      );
      
      // Navigate to dashboard after a short delay to show confirmation
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      const errorInfo = handleAPIError(error);
      enqueueSnackbar(errorInfo.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Project Details
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={formData.project_name}
                onChange={handleInputChange('project_name')}
                required
                placeholder="e.g., Coastal Mangrove Restoration Project"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Ecosystem Type"
                value={formData.ecosystem_type}
                onChange={handleInputChange('ecosystem_type')}
                required
              >
                {ecosystemTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Restoration Method"
                value={formData.restoration_method}
                onChange={handleInputChange('restoration_method')}
                required
              >
                {restorationMethods.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Blue Carbon MRV System:</strong> Your project will undergo AI/ML verification, 
                  NCCR review, and blockchain tokenization for carbon credit generation.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        );

      case 1: // Location & GPS
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Area (Hectares)"
                value={formData.area_hectares}
                onChange={handleInputChange('area_hectares')}
                required
                inputProps={{ min: 0, step: 0.1 }}
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  📍 Current Location: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                </Typography>
                <Button
                  startIcon={<GpsFixed />}
                  onClick={getCurrentLocation}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Use Current GPS Location
                </Button>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>GPS Waypoints</Typography>
              <Button
                startIcon={<GpsFixed />}
                onClick={addWaypoint}
                variant="contained"
                size="small"
                sx={{ mb: 2 }}
              >
                Add Current Waypoint
              </Button>
              
              <List dense>
                {formData.gps_data.waypoints.map((waypoint, index) => (
                  <ListItem key={waypoint.id}>
                    <ListItemIcon>
                      <GpsFixed color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Waypoint ${index + 1}`}
                      secondary={`${waypoint.lat.toFixed(6)}, ${waypoint.lng.toFixed(6)} (±${waypoint.accuracy}m)`}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 400, border: '1px solid #ccc', borderRadius: 1 }}>
                <MapContainer
                  center={[formData.location.lat, formData.location.lng]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationPicker 
                    position={formData.location} 
                    setPosition={handleLocationChange}
                  />
                  {formData.gps_data.waypoints.map((waypoint) => (
                    <Marker 
                      key={waypoint.id} 
                      position={[waypoint.lat, waypoint.lng]} 
                    />
                  ))}
                </MapContainer>
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Click on the map to set project location. Add GPS waypoints for area boundaries.
              </Typography>
            </Grid>
          </Grid>
        );

      case 2: // Media Upload
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                📸 Upload Geo-Tagged Media Evidence
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                All uploaded files will be automatically geo-tagged with GPS coordinates and timestamped for verification.
              </Alert>
            </Grid>

            {/* Photo Upload */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  📷 Photos
                </Typography>
                <input
                  ref={photoInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e.target.files, 'photos')}
                />
                <Button
                  startIcon={<PhotoCamera />}
                  onClick={() => photoInputRef.current?.click()}
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Add Photos
                </Button>
                {formData.media_files.photos.map((photo) => (
                  <Chip
                    key={photo.id}
                    label={photo.name}
                    onDelete={() => removeFile('photos', photo.id)}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Paper>
            </Grid>

            {/* Video Upload */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  🎥 Videos
                </Typography>
                <input
                  ref={videoInputRef}
                  type="file"
                  multiple
                  accept="video/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e.target.files, 'videos')}
                />
                <Button
                  startIcon={<VideoCall />}
                  onClick={() => videoInputRef.current?.click()}
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Add Videos
                </Button>
                {formData.media_files.videos.map((video) => (
                  <Chip
                    key={video.id}
                    label={video.name}
                    onDelete={() => removeFile('videos', video.id)}
                    color="secondary"
                    variant="outlined"
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Paper>
            </Grid>

            {/* Documents Upload */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  📄 Documents
                </Typography>
                <input
                  ref={documentInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e.target.files, 'documents')}
                />
                <Button
                  startIcon={<CloudUpload />}
                  onClick={() => documentInputRef.current?.click()}
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Add Documents
                </Button>
                {formData.media_files.documents.map((doc) => (
                  <Chip
                    key={doc.id}
                    label={doc.name}
                    onDelete={() => removeFile('documents', doc.id)}
                    color="warning"
                    variant="outlined"
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Paper>
            </Grid>

            {isUploading && (
              <Grid item xs={12}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" color="textSecondary">
                    Uploading files... {uploadProgress.toFixed(0)}%
                  </Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
              </Grid>
            )}
          </Grid>
        );

      case 3: // Field Measurements
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                🧪 Scientific Field Measurements
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Enter available field measurements. These will be verified against satellite data and used for carbon credit calculations.
              </Alert>
            </Grid>

            {/* Water Quality */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom startIcon={<Water />}>
                  💧 Water Quality
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="pH Level"
                      value={formData.field_measurements.water_quality.ph_level}
                      onChange={handleDeepNestedInputChange('field_measurements', 'water_quality', 'ph_level')}
                      inputProps={{ min: 0, max: 14, step: 0.1 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">pH</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Salinity"
                      value={formData.field_measurements.water_quality.salinity}
                      onChange={handleDeepNestedInputChange('field_measurements', 'water_quality', 'salinity')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">ppt</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Temperature"
                      value={formData.field_measurements.water_quality.temperature}
                      onChange={handleDeepNestedInputChange('field_measurements', 'water_quality', 'temperature')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">°C</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Dissolved Oxygen"
                      value={formData.field_measurements.water_quality.dissolved_oxygen}
                      onChange={handleDeepNestedInputChange('field_measurements', 'water_quality', 'dissolved_oxygen')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">mg/L</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Soil Analysis */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  🌱 Soil Analysis
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Carbon Content"
                      value={formData.field_measurements.soil_analysis.carbon_content}
                      onChange={handleDeepNestedInputChange('field_measurements', 'soil_analysis', 'carbon_content')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Nitrogen Level"
                      value={formData.field_measurements.soil_analysis.nitrogen_level}
                      onChange={handleDeepNestedInputChange('field_measurements', 'soil_analysis', 'nitrogen_level')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Phosphorus Level"
                      value={formData.field_measurements.soil_analysis.phosphorus_level}
                      onChange={handleDeepNestedInputChange('field_measurements', 'soil_analysis', 'phosphorus_level')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">ppm</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Moisture Content"
                      value={formData.field_measurements.soil_analysis.moisture_content}
                      onChange={handleDeepNestedInputChange('field_measurements', 'soil_analysis', 'moisture_content')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Biodiversity */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  🦋 Biodiversity Assessment
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Species Count"
                      value={formData.field_measurements.biodiversity.species_count}
                      onChange={handleDeepNestedInputChange('field_measurements', 'biodiversity', 'species_count')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">species</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Vegetation Density"
                      value={formData.field_measurements.biodiversity.vegetation_density}
                      onChange={handleDeepNestedInputChange('field_measurements', 'biodiversity', 'vegetation_density')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Wildlife Observations"
                      value={formData.field_measurements.biodiversity.wildlife_observations}
                      onChange={handleDeepNestedInputChange('field_measurements', 'biodiversity', 'wildlife_observations')}
                      placeholder="Describe observed wildlife..."
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Environmental Conditions */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  🌊 Environmental Conditions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Tide Level"
                      value={formData.field_measurements.environmental.tide_level}
                      onChange={handleDeepNestedInputChange('field_measurements', 'environmental', 'tide_level')}
                      select
                    >
                      <MenuItem value="low">Low Tide</MenuItem>
                      <MenuItem value="medium">Medium Tide</MenuItem>
                      <MenuItem value="high">High Tide</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Weather"
                      value={formData.field_measurements.environmental.weather_conditions}
                      onChange={handleDeepNestedInputChange('field_measurements', 'environmental', 'weather_conditions')}
                      select
                    >
                      <MenuItem value="sunny">Sunny</MenuItem>
                      <MenuItem value="cloudy">Cloudy</MenuItem>
                      <MenuItem value="rainy">Rainy</MenuItem>
                      <MenuItem value="stormy">Stormy</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Visibility"
                      value={formData.field_measurements.environmental.visibility}
                      onChange={handleDeepNestedInputChange('field_measurements', 'environmental', 'visibility')}
                      select
                    >
                      <MenuItem value="excellent">Excellent (&gt;10km)</MenuItem>
                      <MenuItem value="good">Good (5-10km)</MenuItem>
                      <MenuItem value="moderate">Moderate (2-5km)</MenuItem>
                      <MenuItem value="poor">Poor (&lt;2km)</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        );

      case 4: // Community Info
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                👥 Community Information
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Community Details"
                value={formData.community_details}
                onChange={handleInputChange('community_details')}
                required
                placeholder="Describe the local communities involved, their role, expected benefits, and how they will participate in the restoration project..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="email"
                label="Contact Email"
                value={formData.contact_email}
                onChange={handleInputChange('contact_email')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone_number}
                onChange={handleInputChange('phone_number')}
                required
                placeholder="+91 XXXXX XXXXX"
              />
            </Grid>
          </Grid>
        );

      case 5: // Blockchain & IPFS
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                ⛓️ Blockchain & IPFS Integration
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Your project data will be stored on IPFS for decentralized storage and recorded on the blockchain for immutable verification.
              </Alert>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Storage sx={{ mr: 1 }} />
                  IPFS Storage Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip label="Photos Ready" color="success" size="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {formData.media_files.photos.length} files
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip label="Videos Ready" color="success" size="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {formData.media_files.videos.length} files
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip label="Documents Ready" color="success" size="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {formData.media_files.documents.length} files
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Analytics sx={{ mr: 1 }} />
                  Blockchain Integration
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Network: Polygon Mumbai Testnet
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Contract: ProjectRegistry.sol
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Gas Estimate: ~0.05 MATIC
                  </Typography>
                </Box>
                <Alert severity="success">
                  Ready for blockchain submission
                </Alert>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                <strong>Next Steps After Submission:</strong><br />
                1. 🤖 AI/ML verification of uploaded media and measurements<br />
                2. 👩‍💼 NCCR admin review and validation<br />
                3. ✅ Project approval and registration<br />
                4. 🪙 Carbon credit tokenization<br />
                5. 💰 Revenue sharing with community
              </Typography>
            </Grid>
          </Grid>
        );

      case 6: // Review & Submit
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please review your project details before submission. Once submitted, the project will undergo AI verification, NCCR review, and blockchain registration.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>📋 Project Information</Typography>
                <Typography><strong>Name:</strong> {formData.project_name}</Typography>
                <Typography><strong>Ecosystem:</strong> {formData.ecosystem_type}</Typography>
                <Typography><strong>Method:</strong> {formData.restoration_method}</Typography>
                <Typography><strong>Area:</strong> {formData.area_hectares} hectares</Typography>
                <Typography><strong>Location:</strong> {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>📞 Contact Information</Typography>
                <Typography><strong>Email:</strong> {formData.contact_email}</Typography>
                <Typography><strong>Phone:</strong> {formData.phone_number}</Typography>
                <Typography><strong>GPS Waypoints:</strong> {formData.gps_data.waypoints.length}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>📱 Media Files</Typography>
                <Typography><strong>Photos:</strong> {formData.media_files.photos.length}</Typography>
                <Typography><strong>Videos:</strong> {formData.media_files.videos.length}</Typography>
                <Typography><strong>Documents:</strong> {formData.media_files.documents.length}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>🧪 Field Data</Typography>
                <Typography><strong>Water Quality:</strong> {formData.field_measurements.water_quality.ph_level ? '✅' : '❌'} pH Level</Typography>
                <Typography><strong>Soil Analysis:</strong> {formData.field_measurements.soil_analysis.carbon_content ? '✅' : '❌'} Carbon Content</Typography>
                <Typography><strong>Biodiversity:</strong> {formData.field_measurements.biodiversity.species_count ? '✅' : '❌'} Species Count</Typography>
                <Typography><strong>Environmental:</strong> {formData.field_measurements.environmental.weather_conditions ? '✅' : '❌'} Weather Data</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>👥 Community Details</Typography>
                <Typography>{formData.community_details}</Typography>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        🌊 Create New Blue Carbon Project
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
        Submit your coastal ecosystem restoration project for AI verification, NCCR review, and blockchain tokenization
      </Typography>

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent()}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>

            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
                  size="large"
                >
                  {loading ? 'Uploading to IPFS & Blockchain...' : 'Submit Project for Verification'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!validateStep(activeStep)}
                  size="large"
                >
                  Next: {steps[activeStep + 1]}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Blockchain Status Display */}
      {showBlockchainStatus && submissionResult && (
        <Box mt={3}>
          <BlockchainStatus
            projectData={submissionResult}
            aiAnalysis={submissionResult.ai_analysis}
            blockchainData={submissionResult.blockchain}
          />
          
          <Box mt={2} display="flex" justifyContent="center" gap={2}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setShowBlockchainStatus(false);
                setSubmissionResult(null);
                setActiveStep(0);
                setFormData({
                  project_name: '',
                  location: { lat: 19.0760, lng: 72.8777 },
                  area_hectares: '',
                  ecosystem_type: '',
                  restoration_method: '',
                  community_details: '',
                  contact_email: '',
                  phone_number: '',
                  media_files: {
                    photos: [],
                    videos: [],
                    documents: [],
                  },
                });
              }}
            >
              Create Another Project
            </Button>
          </Box>
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog 
        open={previewDialog.open} 
        onClose={() => setPreviewDialog({ open: false, file: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>File Preview</DialogTitle>
        <DialogContent>
          {previewDialog.file && (
            <Box>
              <Typography variant="body2" color="textSecondary">
                📍 Location: {previewDialog.file.location?.lat}, {previewDialog.file.location?.lng}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                🕒 Timestamp: {new Date(previewDialog.file.timestamp).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, file: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectCreate;
