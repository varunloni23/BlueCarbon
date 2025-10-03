import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Demo authentication - replace with real API call
      let userData;
      
      if (email === 'admin@nccr.gov.in' && password === 'admin123') {
        userData = {
          id: 'admin_001',
          email: 'admin@nccr.gov.in',
          name: 'NCCR Administrator',
          role: 'admin',
          organization: 'National Centre for Coastal Research',
          permissions: ['project_review', 'analytics', 'user_management', 'system_admin']
        };
      } else if (email === 'user@demo.com' && password === 'user123') {
        userData = {
          id: 'user_001',
          email: 'user@demo.com',
          name: 'Community Project Manager',
          role: 'user',
          organization: 'Coastal Community Group',
          permissions: ['project_create', 'project_view', 'data_upload']
        };
      } else {
        throw new Error('Invalid credentials');
      }

      const token = `demo_token_${userData.role}_${Date.now()}`;
      
      // Store authentication data
      localStorage.setItem('auth_user', JSON.stringify(userData));
      localStorage.setItem('auth_token', token);
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isUser = () => {
    return user?.role === 'user';
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    hasPermission,
    isAdmin,
    isUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
