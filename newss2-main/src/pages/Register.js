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
  Link,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Person, 
  Business, 
  Phone, 
  Lock,
  Nature,
  Store
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8002';

const Register = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    organization: '',
    phone: '',
    role: 'user' // Default to user, can be changed to buyer
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const steps = ['Verify Email', 'Create Account'];

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
        purpose: 'registration'
      });

      if (response.data.success) {
        setSuccess('OTP sent to your email! Please check your email (or console in development mode).');
        setOtpSent(true);
      } else {
        setError(response.data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: formData.email,
        otp: formData.otp,
        purpose: 'registration'
      });

      if (response.data.success) {
        setSuccess('Email verified successfully!');
        setActiveStep(1);
      } else {
        setError(response.data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Register User
  const handleRegister = async () => {
    // Validation
    if (!formData.full_name || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        organization: formData.organization,
        phone: formData.phone,
        role: formData.role // Use selected role instead of hardcoded 'user'
      });

      if (response.data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            🌊 Blue Carbon MRV
          </Typography>
          <Typography variant="h6" align="center" gutterBottom>
            Create Account
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
                disabled={otpSent}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />

              {!otpSent ? (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSendOTP}
                  disabled={loading}
                  sx={{ mt: 2, py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Send OTP'}
                </Button>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="Enter 6-Digit OTP"
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
                    {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setOtpSent(false)}
                    sx={{ mt: 1 }}
                  >
                    Change Email
                  </Button>
                </>
              )}
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              {/* Role Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Account Type
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" sx={{ mb: 2 }}>
                    Choose your role in the platform
                  </FormLabel>
                  <RadioGroup
                    name="role"
                    value={formData.role}
                    onChange={handleChange('role')}
                    sx={{ gap: 1 }}
                  >
                    <Card variant="outlined" sx={{ 
                      border: formData.role === 'user' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      backgroundColor: formData.role === 'user' ? '#f3f8ff' : 'transparent'
                    }}>
                      <CardContent sx={{ py: 2 }}>
                        <FormControlLabel
                          value="user"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Nature color="success" />
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  Project Creator
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Create and manage blue carbon restoration projects
                                </Typography>
                              </Box>
                            </Box>
                          }
                          sx={{ m: 0, width: '100%' }}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card variant="outlined" sx={{ 
                      border: formData.role === 'buyer' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      backgroundColor: formData.role === 'buyer' ? '#f3f8ff' : 'transparent'
                    }}>
                      <CardContent sx={{ py: 2 }}>
                        <FormControlLabel
                          value="buyer"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Store color="primary" />
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  Carbon Credit Buyer
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Purchase carbon credits from verified projects
                                </Typography>
                              </Box>
                            </Box>
                          }
                          sx={{ m: 0, width: '100%' }}
                        />
                      </CardContent>
                    </Card>
                  </RadioGroup>
                </FormControl>
              </Box>

              {/* Personal Information */}
              <Typography variant="h6" gutterBottom color="primary">
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TextField
                fullWidth
                label="Full Name *"
                value={formData.full_name}
                onChange={handleChange('full_name')}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Organization"
                value={formData.organization}
                onChange={handleChange('organization')}
                margin="normal"
                helperText={formData.role === 'buyer' ? 'Company or organization purchasing credits' : 'Your organization or company name'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange('phone')}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password *"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
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
                label="Confirm Password *"
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
                onClick={handleRegister}
                disabled={loading}
                sx={{ mt: 3, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 
                  `Create ${formData.role === 'buyer' ? 'Buyer' : 'Creator'} Account`}
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
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

export default Register;
