import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  MenuItem,
} from '@mui/material';
import { PhotoCamera, GpsFixed as GPS } from '@mui/icons-material';

const DataCollection = () => {
  const [selectedProject, setSelectedProject] = useState('');
  const [photos, setPhotos] = useState([]);
  const [gpsData, setGpsData] = useState({ lat: '', lng: '' });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        MRV Data Collection
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Collect field data for approved blue carbon restoration projects
      </Alert>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Select Project"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <MenuItem value="project1">Coastal Mangrove Project</MenuItem>
                <MenuItem value="project2">Seagrass Restoration</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GPS />}
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                      setGpsData({
                        lat: position.coords.latitude.toFixed(6),
                        lng: position.coords.longitude.toFixed(6),
                      });
                    });
                  }
                }}
              >
                Get Current GPS Location
              </Button>
              {gpsData.lat && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Location: {gpsData.lat}, {gpsData.lng}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                fullWidth
              >
                Upload Photos
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  onChange={(e) => setPhotos(Array.from(e.target.files))}
                />
              </Button>
              {photos.length > 0 && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {photos.length} photos selected
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Soil pH"
                type="number"
                inputProps={{ step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Water Temperature (°C)"
                type="number"
                inputProps={{ step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Field Notes"
                placeholder="Record any observations, measurements, or notes about the restoration site..."
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" size="large" fullWidth>
                Submit MRV Data
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DataCollection;
