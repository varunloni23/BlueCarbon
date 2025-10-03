import Web3 from 'web3';

// Contract addresses from deployed contracts on Polygon Amoy
const CONTRACTS = {
  ProjectRegistry: '0x331A9336B7855E32B46F78053a963dc7FB6e3281',
  CarbonCreditToken: '0x50DB160bb4dfA789D600b5Be7eD80f66993b7620',
  UniqueCarbonCreditNFT: '0x8cB6Db9a056D2C9cEaD3860B2035ed0FEDaBE2Db',
  PaymentDistributor: '0xC69d14B24D6330fBA0a7527fc0da64199E038a6f',
  VerificationOracle: '0x0313771d7FB6A6460D7144eC660E2949eEdd515e'
};

// Polygon Amoy testnet configuration
const POLYGON_AMOY = {
  chainId: '0x13882', // 80002 in hex
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/'],
};

// ProjectRegistry ABI (simplified for common functions)
const PROJECT_REGISTRY_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_description", "type": "string"},
      {"internalType": "uint8", "name": "_ecosystemType", "type": "uint8"},
      {"internalType": "string", "name": "_location", "type": "string"},
      {"internalType": "uint256", "name": "_areaInHectares", "type": "uint256"},
      {"internalType": "address[]", "name": "_communityWallets", "type": "address[]"},
      {"internalType": "string", "name": "_ipfsHashMetadata", "type": "string"},
      {"internalType": "uint256", "name": "_estimatedCarbonCredits", "type": "uint256"}
    ],
    "name": "registerProject",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_projectId", "type": "uint256"}],
    "name": "getProject",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "uint8", "name": "ecosystemType", "type": "uint8"},
          {"internalType": "string", "name": "location", "type": "string"},
          {"internalType": "uint256", "name": "areaInHectares", "type": "uint256"},
          {"internalType": "address", "name": "projectOwner", "type": "address"},
          {"internalType": "address[]", "name": "communityWallets", "type": "address[]"},
          {"internalType": "address[]", "name": "verifiers", "type": "address[]"},
          {"internalType": "uint8", "name": "status", "type": "uint8"},
          {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
          {"internalType": "uint256", "name": "approvedAt", "type": "uint256"},
          {"internalType": "string", "name": "ipfsHashMetadata", "type": "string"},
          {"internalType": "uint256", "name": "estimatedCarbonCredits", "type": "uint256"},
          {"internalType": "uint256", "name": "totalCarbonCredits", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"}
        ],
        "internalType": "struct ProjectRegistry.Project",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_projectId", "type": "uint256"}],
    "name": "approveProject",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalProjects",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_owner", "type": "address"}],
    "name": "getProjectsByOwner",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Carbon Credit Token ABI (ERC-20 functions)
const CARBON_CREDIT_TOKEN_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_to", "type": "address"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"},
      {"internalType": "uint256", "name": "_projectId", "type": "uint256"},
      {"internalType": "string", "name": "_batchId", "type": "string"}
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

class BlockchainService {
  constructor() {
    this.web3 = null;
    this.account = null;
    this.contracts = {};
    this.isConnected = false;
  }

  // Initialize Web3 and connect to MetaMask
  async init() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        this.web3 = new Web3(window.ethereum);
        
        // Request account access if needed
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        this.account = accounts[0];
        this.isConnected = true;
        
        // Switch to Polygon Amoy testnet if needed
        await this.switchToPolygonAmoy();
        
        // Initialize contracts
        this.initializeContracts();
        
        console.log('🌊 Blockchain service initialized:', {
          account: this.account,
          network: await this.web3.eth.getChainId()
        });
        
        return true;
      } else {
        console.error('MetaMask not detected');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      return false;
    }
  }

  // Switch to Polygon Amoy testnet
  async switchToPolygonAmoy() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY.chainId }],
      });
    } catch (switchError) {
      // Add the network if it doesn't exist
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [POLYGON_AMOY],
        });
      } else {
        throw switchError;
      }
    }
  }

  // Initialize smart contracts
  initializeContracts() {
    this.contracts.projectRegistry = new this.web3.eth.Contract(
      PROJECT_REGISTRY_ABI,
      CONTRACTS.ProjectRegistry
    );
    
    this.contracts.carbonCreditToken = new this.web3.eth.Contract(
      CARBON_CREDIT_TOKEN_ABI,
      CONTRACTS.CarbonCreditToken
    );
  }

  // Register a new project on blockchain
  async registerProject(projectData) {
    try {
      if (!this.isConnected) {
        throw new Error('Blockchain service not connected');
      }

      const {
        title: name,
        description,
        ecosystem_type,
        location,
        area_hectares,
        community_wallets = [],
        ipfs_hash = '',
        estimated_credits = 0
      } = projectData;

      // Convert ecosystem type to number (0: Mangrove, 1: Seagrass, 2: Saltmarsh)
      const ecosystemTypeMap = {
        'mangrove': 0,
        'seagrass': 1,
        'saltmarsh': 2
      };
      const ecosystemTypeNum = ecosystemTypeMap[ecosystem_type?.toLowerCase()] || 0;

      console.log('🚀 Registering project on blockchain:', {
        name,
        ecosystemType: ecosystemTypeNum,
        areaHectares: area_hectares,
        estimatedCredits: estimated_credits
      });

      const tx = await this.contracts.projectRegistry.methods
        .registerProject(
          name,
          description,
          ecosystemTypeNum,
          location,
          this.web3.utils.toWei(area_hectares.toString(), 'ether'), // Convert to wei for precision
          community_wallets,
          ipfs_hash,
          estimated_credits
        )
        .send({
          from: this.account,
          gas: 500000
        });

      console.log('✅ Project registered on blockchain:', tx.transactionHash);
      
      // Get project ID from events
      const projectId = tx.events.ProjectRegistered?.returnValues?.projectId;
      
      return {
        success: true,
        transactionHash: tx.transactionHash,
        projectId: projectId,
        blockNumber: tx.blockNumber
      };
    } catch (error) {
      console.error('❌ Failed to register project on blockchain:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get project details from blockchain
  async getProject(projectId) {
    try {
      const project = await this.contracts.projectRegistry.methods
        .getProject(projectId)
        .call();
      
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        ecosystemType: project.ecosystemType,
        location: project.location,
        areaInHectares: this.web3.utils.fromWei(project.areaInHectares, 'ether'),
        projectOwner: project.projectOwner,
        communityWallets: project.communityWallets,
        status: project.status,
        createdAt: new Date(parseInt(project.createdAt) * 1000),
        approvedAt: project.approvedAt > 0 ? new Date(parseInt(project.approvedAt) * 1000) : null,
        estimatedCarbonCredits: project.estimatedCarbonCredits,
        totalCarbonCredits: project.totalCarbonCredits,
        isActive: project.isActive
      };
    } catch (error) {
      console.error('Failed to get project from blockchain:', error);
      throw error;
    }
  }

  // Approve a project (admin function)
  async approveProject(projectId) {
    try {
      const tx = await this.contracts.projectRegistry.methods
        .approveProject(projectId)
        .send({
          from: this.account,
          gas: 200000
        });

      return {
        success: true,
        transactionHash: tx.transactionHash
      };
    } catch (error) {
      console.error('Failed to approve project:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Mint carbon credits for a project
  async mintCarbonCredits(projectId, amount, batchId = '') {
    try {
      const tx = await this.contracts.carbonCreditToken.methods
        .mint(
          this.account, // Mint to current account
          amount,
          projectId,
          batchId || `batch_${Date.now()}`
        )
        .send({
          from: this.account,
          gas: 300000
        });

      return {
        success: true,
        transactionHash: tx.transactionHash,
        amount: amount
      };
    } catch (error) {
      console.error('Failed to mint carbon credits:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get carbon credit balance
  async getCarbonCreditBalance(address = null) {
    try {
      const accountAddress = address || this.account;
      const balance = await this.contracts.carbonCreditToken.methods
        .balanceOf(accountAddress)
        .call();
      
      return parseInt(balance);
    } catch (error) {
      console.error('Failed to get carbon credit balance:', error);
      return 0;
    }
  }

  // Get total carbon credits in circulation
  async getTotalCarbonCredits() {
    try {
      const total = await this.contracts.carbonCreditToken.methods
        .totalSupply()
        .call();
      
      return parseInt(total);
    } catch (error) {
      console.error('Failed to get total carbon credits:', error);
      return 0;
    }
  }

  // Get user's projects
  async getUserProjects(address = null) {
    try {
      const accountAddress = address || this.account;
      const projectIds = await this.contracts.projectRegistry.methods
        .getProjectsByOwner(accountAddress)
        .call();
      
      // Get full project details for each ID
      const projects = await Promise.all(
        projectIds.map(id => this.getProject(id))
      );
      
      return projects;
    } catch (error) {
      console.error('Failed to get user projects:', error);
      return [];
    }
  }

  // Get total projects count
  async getTotalProjectsCount() {
    try {
      const count = await this.contracts.projectRegistry.methods
        .getTotalProjects()
        .call();
      
      return parseInt(count);
    } catch (error) {
      console.error('Failed to get total projects count:', error);
      return 0;
    }
  }

  // Listen to blockchain events
  subscribeToProjectEvents(callback) {
    if (!this.contracts.projectRegistry) return;

    this.contracts.projectRegistry.events.ProjectRegistered({
      fromBlock: 'latest'
    })
    .on('data', (event) => {
      callback('ProjectRegistered', event.returnValues);
    })
    .on('error', console.error);

    this.contracts.projectRegistry.events.ProjectApproved({
      fromBlock: 'latest'
    })
    .on('data', (event) => {
      callback('ProjectApproved', event.returnValues);
    })
    .on('error', console.error);
  }

  // Transfer carbon credits
  async transferCarbonCredits(toAddress, amount) {
    try {
      const tx = await this.contracts.carbonCreditToken.methods
        .transfer(toAddress, amount)
        .send({
          from: this.account,
          gas: 200000
        });

      return {
        success: true,
        transactionHash: tx.transactionHash
      };
    } catch (error) {
      console.error('Failed to transfer carbon credits:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get blockchain network info
  async getNetworkInfo() {
    try {
      const chainId = await this.web3.eth.getChainId();
      const blockNumber = await this.web3.eth.getBlockNumber();
      const gasPrice = await this.web3.eth.getGasPrice();

      return {
        chainId,
        blockNumber,
        gasPrice: this.web3.utils.fromWei(gasPrice, 'gwei') + ' Gwei',
        account: this.account,
        isConnected: this.isConnected
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      return null;
    }
  }

  // Get contract addresses for reference
  getContractAddresses() {
    return CONTRACTS;
  }

  // Check if user has MetaMask
  static hasMetaMask() {
    return typeof window.ethereum !== 'undefined';
  }

  // Format blockchain addresses for display
  static formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Convert wei to ether for display
  weiToEther(wei) {
    return this.web3.utils.fromWei(wei.toString(), 'ether');
  }

  // Convert ether to wei for transactions
  etherToWei(ether) {
    return this.web3.utils.toWei(ether.toString(), 'ether');
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
export default blockchainService;