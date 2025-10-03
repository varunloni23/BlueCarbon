const express = require('express');
const db = require('../services/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET all projects
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    
    let query = 'SELECT * FROM projects';
    let params = [];
    
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
      query += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      params.push(parseInt(limit), parseInt(offset));
    } else {
      query += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      params.push(parseInt(limit), parseInt(offset));
    }
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    });
  }
});

// GET single project
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await db.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    // Also get verification data for this project
    const verifications = await db.getVerificationData(projectId);
    
    res.json({
      success: true,
      data: {
        ...project,
        verifications
      }
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project'
    });
  }
});

// POST create new project
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      ecosystem_type,
      area_hectares,
      carbon_estimate,
      blockchain_tx_hash
    } = req.body;

    // Validate required fields
    if (!title || !description || !location || !ecosystem_type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, location, ecosystem_type'
      });
    }

    // Generate unique project ID
    const project_id = `PROJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const projectData = {
      project_id,
      title,
      description,
      location,
      ecosystem_type,
      area_hectares: area_hectares || 0,
      carbon_estimate: carbon_estimate || 0,
      blockchain_tx_hash
    };

    const project = await db.createProject(projectData);

    // Emit real-time update if socket.io is available
    if (global.io) {
      global.io.emit('new-project', project);
    }

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    });
  }
});

// PUT update project
router.put('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.project_id;
    delete updateData.created_at;

    const updatedProject = await db.updateProject(projectId, updateData);

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Emit real-time update
    if (global.io) {
      global.io.emit('project-updated', updatedProject);
    }

    res.json({
      success: true,
      data: updatedProject,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update project'
    });
  }
});

// POST submit project for verification
router.post('/:projectId/submit', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { verification_data } = req.body;

    // Update project status to submitted
    const updatedProject = await db.updateProject(projectId, {
      status: 'submitted'
    });

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Create verification record if data provided
    if (verification_data) {
      await db.createVerificationData({
        project_id: projectId,
        verification_type: 'submission',
        data: verification_data,
        ai_score: null
      });
    }

    res.json({
      success: true,
      data: updatedProject,
      message: 'Project submitted for verification'
    });
  } catch (error) {
    console.error('Error submitting project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit project'
    });
  }
});

// GET project analytics
router.get('/:projectId/analytics', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Get project details
    const project = await db.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Get carbon credits for this project
    const credits = await db.getCarbonCredits(projectId);
    
    // Get verification history
    const verifications = await db.getVerificationData(projectId);

    const analytics = {
      project_summary: project,
      carbon_credits: {
        total_credits: credits.reduce((sum, credit) => sum + parseFloat(credit.amount || 0), 0),
        total_value: credits.reduce((sum, credit) => sum + (parseFloat(credit.amount || 0) * parseFloat(credit.price_per_credit || 0)), 0),
        credits_issued: credits.length
      },
      verification_history: verifications,
      latest_verification: verifications[0] || null
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project analytics'
    });
  }
});

// DELETE project (soft delete - update status)
router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const updatedProject = await db.updateProject(projectId, {
      status: 'deleted'
    });

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    });
  }
});

module.exports = router;