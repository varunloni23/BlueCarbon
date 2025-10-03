const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ipfsService = require('../services/ipfsService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/temp';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and data files
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|csv|json|txt|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

// Test IPFS connection
router.get('/status', async (req, res) => {
  try {
    const isConnected = await ipfsService.isConnected();
    
    if (!isConnected) {
      return res.json({
        status: 'disconnected',
        error: 'IPFS node not accessible',
        instructions: {
          step1: 'Open IPFS Desktop application',
          step2: 'Make sure it\'s running (check menu bar for IPFS icon)',
          step3: 'Verify API is accessible at http://127.0.0.1:5001',
          step4: 'Check IPFS Desktop settings for API access'
        },
        alternatives: {
          pinata: 'https://pinata.cloud',
          infura: 'https://infura.io/product/ipfs',
          web3storage: 'https://web3.storage'
        }
      });
    }

    const nodeInfo = await ipfsService.getNodeInfo();
    const stats = await ipfsService.getStats();
    
    res.json({
      status: 'connected',
      version: nodeInfo.AgentVersion,
      peerId: nodeInfo.ID,
      addresses: nodeInfo.Addresses,
      peers: stats.peers,
      repoSize: stats.repo.RepoSize
    });
  } catch (error) {
    console.error('IPFS status error:', error);
    res.json({
      status: 'error',
      error: error.message,
      instructions: {
        step1: 'Open IPFS Desktop application',
        step2: 'Make sure it\'s running and API is enabled',
        step3: 'Check if IPFS daemon is accessible at http://127.0.0.1:5001'
      }
    });
  }
});

// Upload single file to IPFS
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const isConnected = await ipfsService.isConnected();
    if (!isConnected) {
      return res.status(503).json({ 
        error: 'IPFS node not available',
        suggestion: 'Start IPFS Desktop or use alternative storage'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const fileSize = req.file.size;

    // Read file and add to IPFS
    const fileBuffer = fs.readFileSync(filePath);
    const result = await ipfsService.addFile(fileBuffer, fileName);

    // Create metadata
    const metadata = {
      name: fileName,
      type: fileType,
      size: fileSize,
      hash: result.Hash,
      uploadedAt: new Date().toISOString(),
      gateway: ipfsService.getGatewayURL(result.Hash),
      publicGateway: ipfsService.getPublicGatewayURL(result.Hash)
    };

    // Store metadata on IPFS as well
    const metadataResult = await ipfsService.addJSON(metadata, `${fileName}.metadata.json`);

    // Clean up temporary file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      fileHash: result.Hash,
      metadataHash: metadataResult.Hash,
      metadata,
      size: result.Size || fileSize
    });

  } catch (error) {
    console.error('IPFS upload error:', error);
    
    // Clean up files on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to upload to IPFS',
      details: error.message 
    });
  }
});

// Upload multiple files to IPFS
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const isConnected = await ipfsService.isConnected();
    if (!isConnected) {
      return res.status(503).json({ 
        error: 'IPFS node not available',
        suggestion: 'Start IPFS Desktop or use alternative storage'
      });
    }

    const uploadResults = [];

    for (const file of req.files) {
      try {
        const fileBuffer = fs.readFileSync(file.path);
        const result = await ipfsService.addFile(fileBuffer, file.originalname);

        uploadResults.push({
          originalName: file.originalname,
          hash: result.Hash,
          size: result.Size || file.size,
          type: file.mimetype,
          gateway: ipfsService.getGatewayURL(result.Hash)
        });

        // Clean up
        fs.unlinkSync(file.path);
      } catch (fileError) {
        console.error(`Error uploading ${file.originalname}:`, fileError);
        // Clean up on error
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    res.json({
      success: true,
      files: uploadResults,
      totalFiles: uploadResults.length
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    
    // Clean up all files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to upload files to IPFS',
      details: error.message 
    });
  }
});

// Upload JSON data to IPFS
router.post('/upload-json', async (req, res) => {
  try {
    const data = req.body;
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON data' });
    }

    const isConnected = await ipfsService.isConnected();
    if (!isConnected) {
      return res.status(503).json({ 
        error: 'IPFS node not available'
      });
    }

    const result = await ipfsService.addJSON(data);

    res.json({
      success: true,
      hash: result.Hash,
      size: result.Size,
      gateway: ipfsService.getGatewayURL(result.Hash),
      publicGateway: ipfsService.getPublicGatewayURL(result.Hash)
    });

  } catch (error) {
    console.error('JSON upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload JSON to IPFS',
      details: error.message 
    });
  }
});

// Get file from IPFS
router.get('/file/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    const data = await ipfsService.getFile(hash);
    
    // Try to detect content type
    const contentType = req.query.type || 'application/octet-stream';
    
    res.set('Content-Type', contentType);
    res.send(data);

  } catch (error) {
    console.error('IPFS get file error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve file from IPFS',
      details: error.message 
    });
  }
});

// Get JSON data from IPFS
router.get('/json/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    const jsonData = await ipfsService.getJSON(hash);
    
    res.json(jsonData);

  } catch (error) {
    console.error('IPFS get JSON error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve JSON from IPFS',
      details: error.message 
    });
  }
});

// Pin file to keep it available
router.post('/pin/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    await ipfsService.pinFile(hash);
    
    res.json({
      success: true,
      message: `File ${hash} pinned successfully`
    });

  } catch (error) {
    console.error('IPFS pin error:', error);
    res.status(500).json({ 
      error: 'Failed to pin file',
      details: error.message 
    });
  }
});

// Unpin file
router.delete('/pin/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    await ipfsService.unpinFile(hash);
    
    res.json({
      success: true,
      message: `File ${hash} unpinned successfully`
    });

  } catch (error) {
    console.error('IPFS unpin error:', error);
    res.status(500).json({ 
      error: 'Failed to unpin file',
      details: error.message 
    });
  }
});

// Upload project metadata bundle
router.post('/upload-project-metadata', async (req, res) => {
  try {
    const {
      projectId,
      name,
      description,
      location,
      area,
      ecosystem,
      community,
      methodology,
      baseline,
      monitoring,
      documentation
    } = req.body;

    const isConnected = await ipfsService.isConnected();
    if (!isConnected) {
      return res.status(503).json({ 
        error: 'IPFS node not available'
      });
    }

    const metadata = {
      projectId,
      name,
      description,
      location,
      area,
      ecosystem,
      community,
      methodology,
      baseline,
      monitoring,
      documentation,
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const result = await ipfsService.addJSON(metadata, `project-${projectId}-metadata.json`);
    
    // Pin the metadata
    await ipfsService.pinFile(result.Hash);

    res.json({
      success: true,
      metadataHash: result.Hash,
      size: result.Size,
      gateway: ipfsService.getGatewayURL(result.Hash),
      publicGateway: ipfsService.getPublicGatewayURL(result.Hash)
    });

  } catch (error) {
    console.error('Project metadata upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload project metadata',
      details: error.message 
    });
  }
});

module.exports = router;
