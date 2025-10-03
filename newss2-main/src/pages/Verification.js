import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import { Verified } from '@mui/icons-material';

const Verification = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Multi-Source Verification
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Verify MRV data using satellite imagery, IoT sensors, and field data
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Satellite Data
              </Typography>
              <Typography color="textSecondary" sx={{ mb: 2 }}>
                Remote sensing verification of restoration progress
              </Typography>
              <Button variant="outlined" fullWidth>
                View Satellite Images
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Field Data
              </Typography>
              <Typography color="textSecondary" sx={{ mb: 2 }}>
                Ground-truth data from MRV collection
              </Typography>
              <Button variant="outlined" fullWidth>
                Analyze Field Data
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                IoT Sensors
              </Typography>
              <Typography color="textSecondary" sx={{ mb: 2 }}>
                Continuous environmental monitoring
              </Typography>
              <Button variant="outlined" fullWidth>
                View Sensor Data
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Verification Results
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Verified />}
                sx={{ mt: 2 }}
              >
                Complete Verification
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Verification;
