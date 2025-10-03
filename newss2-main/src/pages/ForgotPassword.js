import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8002';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const steps = ['Enter Email', 'Verify OTP', 'Reset Password'];

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    setError('');
  };

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/send-otp`, {
        email: formData.email,
        purpose: 'reset'
      });

      if (response.data.success) {
        setSuccess('Password reset code sent to your email!');
        setActiveStep(1);
      } else {
        setError(response.data.error || 'Failed to send reset code');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: formData.email,
        otp: formData.otp,
        purpose: 'reset'
      });

      if (response.data.success) {
        setSuccess('Code verified! Now set your new password.');
        setActiveStep(2);
      } else {
        setError(response.data.error || 'Invalid verification code');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        email: formData.email,
        new_password: formData.newPassword
      });

      if (response.data.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.error || 'Password reset failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            🔐 Reset Password
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
            Blue Carbon MRV System
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

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

          {activeStep === 0 && (
            <Box>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleSendOTP}
                disabled={loading}
                sx={{ mt: 2, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Reset Code'}
              </Button>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                A 6-digit verification code has been sent to <strong>{formData.email}</strong>
              </Alert>

              <TextField
                fullWidth
                label="Enter 6-Digit Code"
                value={formData.otp}
                onChange={handleChange('otp')}
                margin="normal"
                inputProps={{ maxLength: 6 }}
                placeholder="123456"
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleVerifyOTP}
                disabled={loading}
                sx={{ mt: 2, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify Code'}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setActiveStep(0);
                }}
                sx={{ mt: 1 }}
              >
                Change Email
              </Button>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <TextField
                fullWidth
                label="New Password *"
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleChange('newPassword')}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText="Min 8 characters, uppercase, lowercase, and digit"
              />

              <TextField
                fullWidth
                label="Confirm New Password *"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleResetPassword}
                disabled={loading}
                sx={{ mt: 3, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Remember your password?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/login')}
                sx={{ cursor: 'pointer' }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
