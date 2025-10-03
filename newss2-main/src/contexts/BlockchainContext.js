import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { blockchainAPI } from '../services/api';

// Initial state
const initialState = {
  isConnected: false,
  account: null,
  networkInfo: null,
  userProjects: [],
  carbonBalance: 0,
  loading: false,
  error: null,
  contractAddresses: {},
  hasMetaMask: false
};

// Actions
const BLOCKCHAIN_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_ACCOUNT: 'SET_ACCOUNT',
  SET_NETWORK_INFO: 'SET_NETWORK_INFO',
  SET_USER_PROJECTS: 'SET_USER_PROJECTS',
  SET_CARBON_BALANCE: 'SET_CARBON_BALANCE',
  SET_ERROR: 'SET_ERROR',
  SET_CONTRACT_ADDRESSES: 'SET_CONTRACT_ADDRESSES',
  SET_HAS_METAMASK: 'SET_HAS_METAMASK',
  RESET: 'RESET'
};

// Reducer
const blockchainReducer = (state, action) => {
  switch (action.type) {
    case BLOCKCHAIN_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case BLOCKCHAIN_ACTIONS.SET_CONNECTED:
      return { ...state, isConnected: action.payload };
    
    case BLOCKCHAIN_ACTIONS.SET_ACCOUNT:
      return { ...state, account: action.payload };
    
    case BLOCKCHAIN_ACTIONS.SET_NETWORK_INFO:
      return { ...state, networkInfo: action.payload };
    
    case BLOCKCHAIN_ACTIONS.SET_USER_PROJECTS:
      return { ...state, userProjects: action.payload };
    
    case BLOCKCHAIN_ACTIONS.SET_CARBON_BALANCE:
      return { ...state, carbonBalance: action.payload };
    
    case BLOCKCHAIN_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    
    case BLOCKCHAIN_ACTIONS.SET_CONTRACT_ADDRESSES:
      return { ...state, contractAddresses: action.payload };
    
    case BLOCKCHAIN_ACTIONS.SET_HAS_METAMASK:
      return { ...state, hasMetaMask: action.payload };
    
    case BLOCKCHAIN_ACTIONS.RESET:
      return { ...initialState, hasMetaMask: state.hasMetaMask };
    
    default:
      return state;
  }
};

// Create context
const BlockchainContext = createContext();

// Provider component
export const BlockchainProvider = ({ children }) => {
  const [state, dispatch] = useReducer(blockchainReducer, initialState);

  // Initialize blockchain connection
  const initializeBlockchain = async () => {
    try {
      dispatch({ type: BLOCKCHAIN_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: BLOCKCHAIN_ACTIONS.SET_ERROR, payload: null });

      // Check if MetaMask is available
      const hasMetaMask = blockchainAPI.hasMetaMask();
      dispatch({ type: BLOCKCHAIN_ACTIONS.SET_HAS_METAMASK, payload: hasMetaMask });

      if (!hasMetaMask) {
        throw new Error('MetaMask not detected. Please install MetaMask to use blockchain features.');
      }

      // Initialize blockchain connection
      const success = await blockchainAPI.init();
      
      if (success) {
        dispatch({ type: BLOCKCHAIN_ACTIONS.SET_CONNECTED, payload: true });
        
        // Get account
        const account = blockchainAPI.getAccount();
        dispatch({ type: BLOCKCHAIN_ACTIONS.SET_ACCOUNT, payload: account });
        
        // Get network info
        const networkInfo = await blockchainAPI.getNetworkInfo();
        dispatch({ type: BLOCKCHAIN_ACTIONS.SET_NETWORK_INFO, payload: networkInfo });
        
        // Get contract addresses
        const contractAddresses = blockchainAPI.getContractAddresses();
        dispatch({ type: BLOCKCHAIN_ACTIONS.SET_CONTRACT_ADDRESSES, payload: contractAddresses });
        
        // Load user data
        await loadUserData();
        
        console.log('🎉 Blockchain initialized successfully!');
      } else {
        throw new Error('Failed to connect to blockchain');
      }
    } catch (error) {
      console.error('❌ Blockchain initialization failed:', error);
      dispatch({ type: BLOCKCHAIN_ACTIONS.SET_ERROR, payload: error.message });
      dispatch({ type: BLOCKCHAIN_ACTIONS.SET_CONNECTED, payload: false });
    } finally {
      dispatch({ type: BLOCKCHAIN_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Load user-specific data
  const loadUserData = async () => {
    try {
      if (!blockchainAPI.isConnected()) return;

      // Get user's projects from blockchain
      const userProjects = await blockchainAPI.getUserProjects();
      dispatch({ type: BLOCKCHAIN_ACTIONS.SET_USER_PROJECTS, payload: userProjects });

      // Get carbon credit balance
      const carbonBalance = await blockchainAPI.getCarbonBalance();
      dispatch({ type: BLOCKCHAIN_ACTIONS.SET_CARBON_BALANCE, payload: carbonBalance });

    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    await loadUserData();
  };

  // Disconnect blockchain
  const disconnect = () => {
    dispatch({ type: BLOCKCHAIN_ACTIONS.RESET });
    console.log('🔌 Blockchain disconnected');
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== state.account) {
          dispatch({ type: BLOCKCHAIN_ACTIONS.SET_ACCOUNT, payload: accounts[0] });
          loadUserData();
        }
      };

      const handleChainChanged = (chainId) => {
        console.log('🔗 Chain changed:', chainId);
        // Reload the page or reconnect
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [state.account]);

  // Listen for blockchain events
  useEffect(() => {
    const handleBlockchainEvent = (event) => {
      const { type, data } = event.detail;
      console.log('📡 Received blockchain event:', type, data);
      
      // Refresh user data when relevant events occur
      if (type === 'ProjectRegistered' || type === 'ProjectApproved') {
        loadUserData();
      }
    };

    window.addEventListener('blockchain-event', handleBlockchainEvent);
    
    return () => {
      window.removeEventListener('blockchain-event', handleBlockchainEvent);
    };
  }, []);

  // Context value
  const value = {
    ...state,
    
    // Actions
    initializeBlockchain,
    disconnect,
    refreshUserData,
    
    // Utilities
    formatAddress: blockchainAPI.formatAddress,
    
    // Helper functions
    isReady: state.isConnected && !state.loading,
    needsMetaMask: !state.hasMetaMask,
    canConnect: state.hasMetaMask && !state.isConnected && !state.loading
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

// Hook to use blockchain context
export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  
  return context;
};

export default BlockchainContext;