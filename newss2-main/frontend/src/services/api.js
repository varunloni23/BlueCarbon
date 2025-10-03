import axios from 'axios';
import blockchainService from './blockchain';

const API_BASE_URL = 'http://localhost:8002';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Functions

// Project Management
export const projectAPI = {
  create: async (projectData) => {
    try {
      console.log('🌊 Creating project with blockchain integration...');
      
      // First register on our backend
      const response = await apiClient.post('/api/projects/create', projectData);
      const result = response.data;
      
      // If backend registration successful and blockchain is connected, register on blockchain too
      if (result.success && blockchainService.isConnected) {
        console.log('💫 Registering project on blockchain...');
        const blockchainResult = await blockchainService.registerProject(projectData);
        
        if (blockchainResult.success) {
          result.blockchain = {
            registered: true,
            transactionHash: blockchainResult.transactionHash,
            projectId: blockchainResult.projectId,
            blockNumber: blockchainResult.blockNumber
          };
          console.log('✅ Project registered on both backend and blockchain!');
        } else {
          result.blockchain = {
            registered: false,
            error: blockchainResult.error
          };
          console.warn('⚠️ Project registered on backend but blockchain registration failed:', blockchainResult.error);
        }
      } else {
        result.blockchain = {
          registered: false,
          reason: 'Blockchain service not connected'
        };
      }
      
      return result;
    } catch (error) {
      console.error('❌ Project creation failed:', error);
      throw error;
    }
  },
  
  getById: async (projectId) => {
    const response = await apiClient.get(`/api/projects/${projectId}`);
    return response.data;
  },
  
  list: async (status = null) => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/api/projects', { params });
    return response.data;
  },
  
  // Get projects with blockchain data
  listWithBlockchain: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get('/api/projects', { params });
      const projects = response.data;
      
      // If blockchain is connected, enrich with blockchain data
      if (blockchainService.isConnected && projects.projects) {
        console.log('🔗 Enriching projects with blockchain data...');
        
        for (let project of projects.projects) {
          try {
            // Get carbon credit balance for project owner
            if (project.blockchain_id) {
              const blockchainProject = await blockchainService.getProject(project.blockchain_id);
              project.blockchainData = blockchainProject;
            }
          } catch (error) {
            console.warn('Failed to get blockchain data for project:', project.id, error.message);
          }
        }
      }
      
      return projects;
    } catch (error) {
      console.error('Failed to list projects:', error);
      throw error;
    }
  }
};

// Admin Functions
export const adminAPI = {
  reviewProject: async (projectId, action, comments) => {
    try {
      const requestData = {
        decision: action === 'approve' ? 'approved' : 'rejected',
        comments: comments
      };
      
      const response = await apiClient.post(`/api/admin/projects/${projectId}/review`, requestData);
      const result = response.data;
      
      // If approving and blockchain is connected, approve on blockchain too
      if (action === 'approve' && result.success && blockchainService.isConnected) {
        console.log('🔗 Approving project on blockchain...');
        try {
          // Get project blockchain ID from backend
          const projectResponse = await apiClient.get(`/api/projects/${projectId}`);
          const project = projectResponse.data;
          
          if (project.blockchain_id) {
            const blockchainResult = await blockchainService.approveProject(project.blockchain_id);
            result.blockchain = blockchainResult;
            
            if (blockchainResult.success) {
              console.log('✅ Project approved on both backend and blockchain!');
            }
          }
        } catch (error) {
          console.warn('⚠️ Failed to approve on blockchain:', error.message);
          result.blockchain = { success: false, error: error.message };
        }
      }
      
      return result;
    } catch (error) {
      console.error('Failed to review project:', error);
      throw error;
    }
  },
  
  getDashboard: async () => {
    try {
      const response = await apiClient.get('/api/admin/dashboard');
      const dashboard = response.data;
      
      // Enrich with blockchain statistics if connected
      if (blockchainService.isConnected) {
        try {
          const [totalProjects, totalCredits, userBalance] = await Promise.all([
            blockchainService.getTotalProjectsCount(),
            blockchainService.getTotalCarbonCredits(),
            blockchainService.getCarbonCreditBalance()
          ]);
          
          dashboard.blockchain = {
            totalProjects,
            totalCredits,
            userBalance,
            network: await blockchainService.getNetworkInfo()
          };
        } catch (error) {
          console.warn('Failed to get blockchain dashboard data:', error);
        }
      }
      
      return dashboard;
    } catch (error) {
      console.error('Failed to get dashboard:', error);
      throw error;
    }
  },
};

// MRV Data Collection
export const mrvAPI = {
  collect: async (mrvData) => {
    const response = await apiClient.post('/mrv/collect', mrvData);
    return response.data;
  },
  
  getData: async (projectId) => {
    const response = await apiClient.get(`/mrv/${projectId}`);
    return response.data;
  },
};

// Verification
export const verificationAPI = {
  verify: async (verificationData) => {
    const response = await apiClient.post('/verification/verify', verificationData);
    return response.data;
  },
};

// Carbon Credits
export const creditAPI = {
  tokenize: async (projectId) => {
    const response = await apiClient.post(`/credits/tokenize/${projectId}`);
    return response.data;
  },
  
  // Mint carbon credits on blockchain
  mintCredits: async (projectId, amount, batchId = '') => {
    try {
      if (!blockchainService.isConnected) {
        throw new Error('Blockchain service not connected');
      }
      
      console.log('🪙 Minting carbon credits on blockchain...');
      const result = await blockchainService.mintCarbonCredits(projectId, amount, batchId);
      
      if (result.success) {
        console.log('✅ Carbon credits minted successfully!');
        
        // Optionally update backend with minting information
        try {
          await apiClient.post(`/credits/mint-record`, {
            projectId,
            amount,
            transactionHash: result.transactionHash,
            batchId
          });
        } catch (error) {
          console.warn('Failed to record minting in backend:', error.message);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Failed to mint credits:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get carbon credit balance
  getBalance: async (address = null) => {
    try {
      if (!blockchainService.isConnected) {
        return 0;
      }
      
      return await blockchainService.getCarbonCreditBalance(address);
    } catch (error) {
      console.error('Failed to get carbon credit balance:', error);
      return 0;
    }
  },
  
  // Transfer carbon credits
  transfer: async (toAddress, amount) => {
    try {
      if (!blockchainService.isConnected) {
        throw new Error('Blockchain service not connected');
      }
      
      console.log('💸 Transferring carbon credits...');
      return await blockchainService.transferCarbonCredits(toAddress, amount);
    } catch (error) {
      console.error('Failed to transfer credits:', error);
      return { success: false, error: error.message };
    }
  }
};

// Marketplace
export const marketplaceAPI = {
  listCredits: async (listingData) => {
    const response = await apiClient.post('/marketplace/list', listingData);
    return response.data;
  },
  
  getListings: async (status = 'active') => {
    const response = await apiClient.get('/marketplace', { params: { status } });
    return response.data;
  },
  
  purchaseCredits: async (listingId, quantity) => {
    const formData = new FormData();
    formData.append('quantity', quantity.toString());
    
    const response = await apiClient.post(`/marketplace/${listingId}/purchase`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Payments
export const paymentAPI = {
  distribute: async (projectId) => {
    const response = await apiClient.post(`/payments/distribute/${projectId}`);
    return response.data;
  },
};

// Reports
export const reportsAPI = {
  getProjectReport: async (projectId) => {
    const response = await apiClient.get(`/reports/project/${projectId}`);
    return response.data;
  },
  
  getSystemDashboard: async () => {
    const response = await apiClient.get('/reports/dashboard');
    return response.data;
  },
};

// Health Check
export const healthAPI = {
  check: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
  
  status: async () => {
    const response = await apiClient.get('/api/status');
    return response.data;
  },
};

// Utility function to handle API errors
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data.detail || 'An error occurred',
      status: error.response.status,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'Network error - please check your connection',
      status: 0,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1,
    };
  }
};

// Blockchain Integration Functions
export const blockchainAPI = {
  // Initialize blockchain connection
  init: async () => {
    try {
      console.log('🔗 Initializing blockchain connection...');
      const success = await blockchainService.init();
      
      if (success) {
        console.log('✅ Blockchain connected successfully!');
        
        // Subscribe to blockchain events
        blockchainService.subscribeToProjectEvents((eventType, data) => {
          console.log('📡 Blockchain event:', eventType, data);
          // You can emit custom events here for UI updates
          window.dispatchEvent(new CustomEvent('blockchain-event', {
            detail: { type: eventType, data }
          }));
        });
      }
      
      return success;
    } catch (error) {
      console.error('❌ Failed to initialize blockchain:', error);
      return false;
    }
  },
  
  // Check if blockchain is connected
  isConnected: () => blockchainService.isConnected,
  
  // Get user's wallet address
  getAccount: () => blockchainService.account,
  
  // Get user's projects from blockchain
  getUserProjects: async () => {
    try {
      if (!blockchainService.isConnected) {
        return [];
      }
      
      return await blockchainService.getUserProjects();
    } catch (error) {
      console.error('Failed to get user projects from blockchain:', error);
      return [];
    }
  },
  
  // Get network information
  getNetworkInfo: async () => {
    try {
      if (!blockchainService.isConnected) {
        return null;
      }
      
      return await blockchainService.getNetworkInfo();
    } catch (error) {
      console.error('Failed to get network info:', error);
      return null;
    }
  },
  
  // Get contract addresses
  getContractAddresses: () => blockchainService.getContractAddresses(),
  
  // Format address for display
  formatAddress: (address) => blockchainService.formatAddress(address),
  
  // Check if MetaMask is available
  hasMetaMask: () => blockchainService.hasMetaMask()
};

export default apiClient;
