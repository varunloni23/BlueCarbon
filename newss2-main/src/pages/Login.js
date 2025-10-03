import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link,
  Chip
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:8002';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        // Store user info and token
        const userInfo = {
          ...response.data.user,
          name: response.data.user.full_name
        };
        
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        localStorage.setItem('auth_token', response.data.token);
        
        // Redirect based on role
        if (userInfo.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (userInfo.role === 'buyer') {
          navigate('/marketplace/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (err) {
      if (err.response?.status === 404 || err.code === 'ERR_NETWORK') {
        // Fallback to mock authentication if backend is not available
        console.warn('Backend not available, using mock authentication');
        const userInfo = {
          email: email,
          role: email.includes('admin') ? 'admin' : email.includes('buyer') ? 'buyer' : 'user',
          name: email.split('@')[0],
          user_id: 'MOCK_USER_' + Date.now(),
          full_name: email.split('@')[0],
          userType: email.includes('admin') ? 'admin' : email.includes('buyer') ? 'buyer' : 'user'
        };
        
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        localStorage.setItem('auth_token', 'mock_token_' + Date.now());
        
        if (userInfo.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (userInfo.role === 'buyer') {
          navigate('/marketplace/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (email, password) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            🌊 Blue Carbon MRV
          </Typography>
          <Typography variant="h6" align="center" gutterBottom>
            Sign In
          </Typography>

          {/* Demo Credentials */}
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
            <Typography variant="subtitle2" color="primary" gutterBottom align="center" sx={{ fontSize: '0.875rem' }}>
              🎯 Demo Credentials
            </Typography>
            
            {/* Stack vertically for better visibility */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Admin */}
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  label="Admin"
                  color="warning"
                  size="medium"
                  sx={{ mb: 1, minWidth: '120px', fontSize: '0.8rem', cursor: 'pointer' }}
                  onClick={() => handleDemoLogin('admin@bluecarbon.com', 'admin123')}
                />
                <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                  admin@bluecarbon.com • admin123
                </Typography>
              </Box>
              
              {/* Buyer */}
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  label="Buyer"
                  color="primary"
                  size="medium"
                  sx={{ mb: 1, minWidth: '120px', fontSize: '0.8rem', cursor: 'pointer' }}
                  onClick={() => handleDemoLogin('carbonbuyer@bluecarbon.com', 'buyer123')}
                />
                <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                  carbonbuyer@bluecarbon.com • buyer123
                </Typography>
              </Box>
              
              {/* User */}
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  label="User"
                  color="success"
                  size="medium"
                  sx={{ mb: 1, minWidth: '120px', fontSize: '0.8rem', cursor: 'pointer' }}
                  onClick={() => handleDemoLogin('user@bluecarbon.com', 'user123')}
                />
                <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                  user@bluecarbon.com • user123
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="caption" display="block" color="text.secondary" align="center" sx={{ mt: 2, fontSize: '0.7rem' }}>
              Click on any role chip to auto-fill credentials
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/forgot-password');
                }}
                sx={{ cursor: 'pointer' }}
                type="button"
              >
                Forgot Password?
              </Link>
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 4, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/register')}
                sx={{ cursor: 'pointer' }}
              >
                Register here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
