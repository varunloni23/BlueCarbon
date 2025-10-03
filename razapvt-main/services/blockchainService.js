const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

// Load contract addresses
const contractAddressPath = path.join(__dirname, '../contract-addresses.json');

// Simplified contract ABIs (matching routes/blockchain.js)
const ProjectRegistryABI = [
  "function registerProject(string memory name, string memory location, uint256 area, string memory ipfsHash) external returns (uint256)",
  "function getProject(uint256 projectId) external view returns (tuple(uint256 id, string name, string location, uint256 area, string ipfsHash, address owner, bool verified, uint256 createdAt))",
  "function verifyProject(uint256 projectId) external",
  "function getProjectCount() external view returns (uint256)",
  "event ProjectRegistered(uint256 indexed projectId, address indexed owner, string name)"
];

const CarbonCreditABI = [
  "function mint(address to, uint256 amount, uint256 projectId, string memory batchId) external",
  "function balanceOf(address owner) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function retire(uint256 amount, string memory reason) external",
  "function getProjectCredits(uint256 projectId) external view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event CreditsMinted(address indexed to, uint256 amount, uint256 projectId, string batchId)"
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.projectRegistry = null;
    this.carbonCreditToken = null;
    this.verificationOracle = null;
    this.contractAddresses = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log('🔄 Initializing blockchain service...');

      // Setup provider (using Polygon Amoy testnet)
      this.provider = new ethers.providers.JsonRpcProvider(
        process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology'
      );

      // Load contract addresses
      if (fs.existsSync(contractAddressPath)) {
        this.contractAddresses = JSON.parse(fs.readFileSync(contractAddressPath, 'utf8'));
        console.log('📍 Loaded contract addresses:', this.contractAddresses.contracts);
      } else {
        console.warn('⚠️  Contract addresses not found. Deploy contracts first.');
        return false;
      }

      // Setup signer with private key
      if (process.env.PRIVATE_KEY) {
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        console.log('🔐 Signer initialized:', this.signer.address);
      } else {
        console.warn('⚠️  No private key found. Read-only mode.');
      }

      // Load contract ABIs and create instances
      await this.initializeContracts();

      console.log('✅ Blockchain service initialized successfully');
      this.initialized = true;
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error.message);
      return false;
    }
  }

  async initializeContracts() {
    try {
      // Initialize ProjectRegistry with simplified ABI
      if (this.contractAddresses.contracts.ProjectRegistry) {
        this.projectRegistry = new ethers.Contract(
          this.contractAddresses.contracts.ProjectRegistry,
          ProjectRegistryABI,
          this.signer || this.provider
        );
        console.log('📋 ProjectRegistry loaded:', this.contractAddresses.contracts.ProjectRegistry);
      }

      // Initialize CarbonCreditToken with simplified ABI
      if (this.contractAddresses.contracts.CarbonCreditToken) {
        this.carbonCreditToken = new ethers.Contract(
          this.contractAddresses.contracts.CarbonCreditToken,
          CarbonCreditABI,
          this.signer || this.provider
        );
        console.log('🪙 CarbonCreditToken loaded:', this.contractAddresses.contracts.CarbonCreditToken);
      }

      console.log('✅ Contracts initialized with simplified ABIs');

    } catch (error) {
      console.error('❌ Failed to initialize contracts:', error.message);
      throw error;
    }
  }

  // Register a new blue carbon project on blockchain
  async registerProject(projectData) {
    if (!this.initialized || !this.projectRegistry) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      console.log('📝 Registering project on blockchain:', projectData.name);

      // Convert area to square meters (from hectares) to ensure integer
      const areaInSquareMeters = Math.floor(projectData.area * 10000); // 1 hectare = 10,000 sq meters
      
      console.log('🔧 Contract parameters:', {
        name: projectData.name,
        location: projectData.location,
        area: projectData.area,
        areaInSquareMeters: areaInSquareMeters,
        ipfsHash: projectData.ipfsHash
      });

      const tx = await this.projectRegistry.registerProject(
        projectData.name,
        projectData.location,
        areaInSquareMeters,
        projectData.ipfsHash,
        {
          maxFeePerGas: ethers.utils.parseUnits('50', 'gwei'),
          maxPriorityFeePerGas: ethers.utils.parseUnits('30', 'gwei'),
          gasLimit: 500000
        }
      );

      console.log('📝 Transaction submitted:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Project registered, transaction confirmed:', receipt.transactionHash);

      // Extract project ID from events
      const projectRegisteredEvent = receipt.events?.find(e => e.event === 'ProjectRegistered');
      const projectId = projectRegisteredEvent?.args?.projectId?.toString();

      return {
        success: true,
        projectId: projectId,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error) {
      console.error('❌ Project registration failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get project details from blockchain
  async getProject(projectId) {
    if (!this.initialized || !this.projectRegistry) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const project = await this.projectRegistry.getProject(projectId);
      
      return {
        projectId: projectId,
        projectOwner: project.projectOwner,
        name: project.name,
        projectType: project.projectType,
        location: project.location,
        area: project.area.toString(),
        estimatedCarbonCredits: project.estimatedCarbonCredits.toString(),
        actualCarbonCredits: project.actualCarbonCredits.toString(),
        status: project.status,
        ipfsMetadata: project.ipfsMetadata,
        description: project.description,
        createdAt: new Date(project.createdAt.toNumber() * 1000),
        isVerified: project.isVerified
      };

    } catch (error) {
      console.error('❌ Failed to get project:', error.message);
      throw error;
    }
  }

  // Submit verification data to blockchain
  async submitVerificationData(verificationData) {
    if (!this.initialized || !this.verificationOracle) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      console.log('🔍 Submitting verification data for project:', verificationData.projectId);

      const tx = await this.verificationOracle.submitVerificationData(
        verificationData.projectId,
        verificationData.source, // 0: Community, 1: Satellite, 2: Drone, 3: ThirdParty
        verificationData.ipfsHash,
        verificationData.description,
        verificationData.carbonCreditsEstimate
      );

      console.log('📝 Verification data submitted:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Verification data confirmed:', receipt.transactionHash);

      // Extract verification ID from events
      const verificationEvent = receipt.events?.find(e => e.event === 'VerificationDataSubmitted');
      const verificationId = verificationEvent?.args?.verificationId?.toString();

      return {
        success: true,
        verificationId: verificationId,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };

    } catch (error) {
      console.error('❌ Verification submission failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get verification data for a project
  async getProjectVerifications(projectId) {
    if (!this.initialized || !this.verificationOracle) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const verification = await this.verificationOracle.getProjectVerification(projectId);
      
      return {
        projectId: verification.projectId.toString(),
        verificationIds: verification.verificationIds.map(id => id.toString()),
        communityDataCount: verification.communityDataCount.toString(),
        satelliteDataCount: verification.satelliteDataCount.toString(),
        droneDataCount: verification.droneDataCount.toString(),
        thirdPartyDataCount: verification.thirdPartyDataCount.toString(),
        verifiedDataCount: verification.verifiedDataCount.toString(),
        isCompletelyVerified: verification.isCompletelyVerified,
        finalCarbonCredits: verification.finalCarbonCredits.toString(),
        lastUpdateTimestamp: new Date(verification.lastUpdateTimestamp.toNumber() * 1000)
      };

    } catch (error) {
      console.error('❌ Failed to get project verifications:', error.message);
      throw error;
    }
  }

  // Get carbon credit token balance
  async getCarbonCreditBalance(address) {
    if (!this.initialized || !this.carbonCreditToken) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const balance = await this.carbonCreditToken.balanceOf(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('❌ Failed to get balance:', error.message);
      throw error;
    }
  }

  // Get total project count
  async getTotalProjects() {
    if (!this.initialized || !this.projectRegistry) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const total = await this.projectRegistry.getTotalProjects();
      return total.toString();
    } catch (error) {
      console.error('❌ Failed to get total projects:', error.message);
      throw error;
    }
  }

  // Check if blockchain is available
  isAvailable() {
    return this.initialized && this.projectRegistry !== null;
  }

  // Get contract info
  getContractInfo() {
    return {
      network: this.contractAddresses?.network || 'unknown',
      chainId: this.contractAddresses?.chainId || 'unknown',
      contracts: this.contractAddresses?.contracts || {},
      available: this.isAvailable(),
      deployedAt: this.contractAddresses?.deployedAt || 'unknown'
    };
  }

  // Calculate AI verification score based on uploaded data
  calculateAIScore(projectData) {
    let score = 0;
    const maxScore = 100;

    try {
      // Base score for having required data
      if (projectData.name && projectData.description) score += 10;
      if (projectData.location) score += 10;
      if (projectData.area && projectData.area > 0) score += 10;

      // Score based on image data quality
      if (projectData.images && projectData.images.length > 0) {
        score += Math.min(20, projectData.images.length * 5); // Max 20 points for images

        // Bonus for image metadata
        const hasGoodMetadata = projectData.images.some(img => 
          img.metadata && img.metadata.width && img.metadata.height
        );
        if (hasGoodMetadata) score += 10;
      }

      // Score based on GPS data accuracy
      if (projectData.location && projectData.location.accuracy) {
        const accuracy = parseFloat(projectData.location.accuracy);
        if (accuracy <= 5) score += 15; // High accuracy GPS
        else if (accuracy <= 10) score += 10; // Medium accuracy
        else if (accuracy <= 20) score += 5; // Low accuracy
      }

      // Score based on estimated carbon credits (realistic estimates)
      if (projectData.estimatedCarbonCredits) {
        const credits = parseFloat(projectData.estimatedCarbonCredits);
        const area = parseFloat(projectData.area || 0);
        
        if (area > 0) {
          const creditsPerHa = credits / area;
          // Typical blue carbon projects: 2-10 credits per hectare per year
          if (creditsPerHa >= 2 && creditsPerHa <= 10) {
            score += 15; // Realistic estimate
          } else if (creditsPerHa < 2 || creditsPerHa > 15) {
            score += 5; // Somewhat realistic
          }
        }
      }

      // Bonus for comprehensive description
      if (projectData.description && projectData.description.length > 100) {
        score += 10;
      }

      return Math.min(score, maxScore);

    } catch (error) {
      console.error('❌ AI scoring error:', error.message);
      return 50; // Default score on error
    }
  }

  // Enhanced AI scoring with ecosystem-specific criteria
  calculateEnhancedAIScore(projectData, verificationData = {}) {
    let score = 0;
    const weights = {
      dataQuality: 30,
      locationAccuracy: 20,
      carbonEstimate: 25,
      completeness: 15,
      verification: 10
    };

    try {
      // Data Quality Score (30 points)
      let dataQualityScore = 0;
      if (projectData.images && projectData.images.length > 0) {
        const imageCount = Math.min(projectData.images.length, 10);
        dataQualityScore += (imageCount / 10) * 15; // Up to 15 points for images

        // Image quality assessment
        const highQualityImages = projectData.images.filter(img => 
          img.metadata && img.metadata.width >= 1920 && img.metadata.height >= 1080
        );
        dataQualityScore += (highQualityImages.length / projectData.images.length) * 15;
      }
      score += (dataQualityScore / 30) * weights.dataQuality;

      // Location Accuracy Score (20 points)
      let locationScore = 0;
      if (projectData.location && projectData.location.accuracy) {
        const accuracy = parseFloat(projectData.location.accuracy);
        if (accuracy <= 3) locationScore = 20; // Excellent
        else if (accuracy <= 5) locationScore = 15; // Very good
        else if (accuracy <= 10) locationScore = 10; // Good
        else if (accuracy <= 20) locationScore = 5; // Fair
      }
      score += (locationScore / 20) * weights.locationAccuracy;

      // Carbon Estimate Realism (25 points)
      let carbonScore = 0;
      if (projectData.estimatedCarbonCredits && projectData.area) {
        const credits = parseFloat(projectData.estimatedCarbonCredits);
        const area = parseFloat(projectData.area);
        const creditsPerHa = credits / area;

        // Blue carbon ecosystem specific ranges
        const ecosystemType = projectData.projectType?.toLowerCase() || '';
        let expectedRange = [2, 8]; // Default range

        if (ecosystemType.includes('mangrove')) {
          expectedRange = [3, 12]; // Mangroves can sequester more
        } else if (ecosystemType.includes('seagrass')) {
          expectedRange = [2, 8]; // Seagrass meadows
        } else if (ecosystemType.includes('salt marsh')) {
          expectedRange = [4, 10]; // Salt marshes
        }

        if (creditsPerHa >= expectedRange[0] && creditsPerHa <= expectedRange[1]) {
          carbonScore = 25; // Perfect range
        } else if (creditsPerHa >= expectedRange[0] * 0.7 && creditsPerHa <= expectedRange[1] * 1.3) {
          carbonScore = 15; // Acceptable range
        } else {
          carbonScore = 5; // Outside expected range
        }
      }
      score += (carbonScore / 25) * weights.carbonEstimate;

      // Completeness Score (15 points)
      let completenessScore = 0;
      const requiredFields = ['name', 'description', 'location', 'area', 'projectType'];
      const providedFields = requiredFields.filter(field => 
        projectData[field] && projectData[field].toString().trim().length > 0
      );
      
      completenessScore = (providedFields.length / requiredFields.length) * 15;
      
      // Bonus for detailed description
      if (projectData.description && projectData.description.length > 200) {
        completenessScore = Math.min(completenessScore + 3, 15);
      }
      
      score += (completenessScore / 15) * weights.completeness;

      // Verification Score (10 points)
      let verificationScore = 0;
      if (verificationData.communityDataCount >= 1) verificationScore += 3;
      if (verificationData.satelliteDataCount >= 1) verificationScore += 4;
      if (verificationData.droneDataCount >= 1) verificationScore += 2;
      if (verificationData.thirdPartyDataCount >= 1) verificationScore += 1;
      
      score += (Math.min(verificationScore, 10) / 10) * weights.verification;

      return Math.round(Math.min(score, 100));

    } catch (error) {
      console.error('❌ Enhanced AI scoring error:', error.message);
      return 60; // Default score on error
    }
  }
}

// Export singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;
