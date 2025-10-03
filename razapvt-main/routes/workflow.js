/**
 * MRV Workflow Integration Routes
 * Connects the three components and orchestrates the 8-step workflow
 */

const express = require('express');
const router = express.Router();
const MRVWorkflowOrchestrator = require('../services/mrvOrchestrator');

// Initialize the orchestrator
const orchestrator = new MRVWorkflowOrchestrator();

// Step 1: Project Upload Endpoint
router.post('/workflow/project/upload', async (req, res) => {
    try {
        const projectData = req.body;
        
        console.log('🌊 Received project upload request:', projectData.project_name);
        
        // Trigger Step 1: Project Upload workflow
        const result = await orchestrator.handleProjectUpload(projectData);
        
        res.json({
            success: true,
            message: 'Project uploaded successfully and submitted for NCCR review',
            workflowId: result.workflow.projectId,
            status: 'submitted_for_review',
            nextStep: 'admin_review',
            blockchain_tx: result.workflow.blockchainTx,
            ipfs_hashes: result.workflow.ipfsHashes
        });
        
    } catch (error) {
        console.error('Project upload failed:', error);
        res.status(500).json({
            success: false,
            message: 'Project upload failed',
            error: error.message
        });
    }
});

// Step 2: Admin Review Endpoint
router.post('/workflow/admin/review', async (req, res) => {
    try {
        const { project_id, action, comments, admin_id } = req.body;
        
        console.log('👨‍💼 Received admin review:', project_id, action);
        
        // Trigger Step 2: Admin Review workflow
        orchestrator.emit('admin.reviewed', {
            project_id,
            action,
            comments,
            admin_id
        });
        
        res.json({
            success: true,
            message: `Project ${action} successfully`,
            project_id,
            action,
            nextStep: action === 'approve' ? 'mrv_collection' : 'workflow_ended'
        });
        
    } catch (error) {
        console.error('Admin review failed:', error);
        res.status(500).json({
            success: false,
            message: 'Admin review failed',
            error: error.message
        });
    }
});

// Step 3: MRV Data Collection Endpoint
router.post('/workflow/mrv/collect', async (req, res) => {
    try {
        const mrvData = req.body;
        
        console.log('📊 Received MRV data collection:', mrvData.project_id);
        
        // Trigger Step 3: MRV Collection workflow
        orchestrator.emit('mrv.collected', mrvData);
        
        res.json({
            success: true,
            message: 'MRV data collected successfully',
            project_id: mrvData.project_id,
            nextStep: 'verification'
        });
        
    } catch (error) {
        console.error('MRV collection failed:', error);
        res.status(500).json({
            success: false,
            message: 'MRV data collection failed',
            error: error.message
        });
    }
});

// Step 6: Credits Purchase Endpoint (triggered from marketplace)
router.post('/workflow/credits/purchase', async (req, res) => {
    try {
        const purchaseData = req.body;
        
        console.log('🛒 Received credit purchase:', purchaseData.listing_id);
        
        // Trigger Step 6: Credits Purchase workflow
        orchestrator.emit('credits.purchased', purchaseData);
        
        res.json({
            success: true,
            message: 'Credits purchased successfully',
            purchase_id: purchaseData.purchase_id,
            nextStep: 'payment_distribution'
        });
        
    } catch (error) {
        console.error('Credit purchase failed:', error);
        res.status(500).json({
            success: false,
            message: 'Credit purchase failed',
            error: error.message
        });
    }
});

// Get Workflow Status
router.get('/workflow/status/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const workflow = orchestrator.getWorkflowStatus(projectId);
        
        if (!workflow) {
            return res.status(404).json({
                success: false,
                message: 'Workflow not found'
            });
        }
        
        res.json({
            success: true,
            workflow: workflow,
            progress: calculateProgress(workflow)
        });
        
    } catch (error) {
        console.error('Failed to get workflow status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get workflow status',
            error: error.message
        });
    }
});

// Get All Active Workflows (for dashboard)
router.get('/workflow/active', async (req, res) => {
    try {
        const workflows = orchestrator.getAllActiveWorkflows();
        
        res.json({
            success: true,
            workflows: workflows,
            total: workflows.length,
            byStatus: groupByStatus(workflows)
        });
        
    } catch (error) {
        console.error('Failed to get active workflows:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get active workflows',
            error: error.message
        });
    }
});

// Cross-Service Integration Endpoints

// Endpoint for Python User App to register projects
router.post('/integration/user-app/project', async (req, res) => {
    try {
        const projectData = {
            ...req.body,
            source: 'user_app',
            timestamp: new Date()
        };
        
        // Forward to main workflow
        const response = await fetch(`http://localhost:5000/api/workflow/project/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });
        
        const result = await response.json();
        res.json(result);
        
    } catch (error) {
        console.error('User app integration failed:', error);
        res.status(500).json({
            success: false,
            message: 'User app integration failed',
            error: error.message
        });
    }
});

// Endpoint for Admin Dashboard to review projects
router.post('/integration/admin-dashboard/review', async (req, res) => {
    try {
        const reviewData = {
            ...req.body,
            source: 'admin_dashboard',
            timestamp: new Date()
        };
        
        // Forward to main workflow
        const response = await fetch(`http://localhost:5000/api/workflow/admin/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });
        
        const result = await response.json();
        res.json(result);
        
    } catch (error) {
        console.error('Admin dashboard integration failed:', error);
        res.status(500).json({
            success: false,
            message: 'Admin dashboard integration failed',
            error: error.message
        });
    }
});

// WebSocket Events for Real-time Updates
const setupWebSocketEvents = (io) => {
    // Listen to orchestrator events and broadcast to connected clients
    orchestrator.on('project.uploaded', (data) => {
        io.emit('workflow_update', {
            type: 'project_uploaded',
            projectId: data.project_id,
            step: 1,
            message: 'Project uploaded and ready for review'
        });
    });
    
    orchestrator.on('admin.reviewed', (data) => {
        io.emit('workflow_update', {
            type: 'admin_reviewed',
            projectId: data.project_id,
            step: 2,
            action: data.action,
            message: `Project ${data.action} by admin`
        });
    });
    
    orchestrator.on('mrv.collected', (data) => {
        io.emit('workflow_update', {
            type: 'mrv_collected',
            projectId: data.project_id,
            step: 3,
            message: 'MRV data collected successfully'
        });
    });
    
    orchestrator.on('verification.complete', (data) => {
        io.emit('workflow_update', {
            type: 'verification_complete',
            projectId: data.project_id,
            step: 4,
            status: data.status,
            carbonCredits: data.carbon_credits,
            message: `Verification ${data.status} - ${data.carbon_credits} credits calculated`
        });
    });
    
    orchestrator.on('credits.tokenized', (data) => {
        io.emit('workflow_update', {
            type: 'credits_tokenized',
            projectId: data.project_id,
            step: 5,
            tokenId: data.token_id,
            creditAmount: data.credit_amount,
            message: 'Carbon credits tokenized and ready for marketplace'
        });
    });
    
    orchestrator.on('credits.purchased', (data) => {
        io.emit('workflow_update', {
            type: 'credits_purchased',
            projectId: data.project_id,
            step: 6,
            buyer: data.buyer,
            quantity: data.quantity,
            message: `${data.quantity} credits purchased by ${data.buyer}`
        });
    });
    
    orchestrator.on('payments.distributed', (data) => {
        io.emit('workflow_update', {
            type: 'payments_distributed',
            projectId: data.project_id,
            step: 7,
            distributions: data.distributions,
            message: 'Payments distributed to all stakeholders'
        });
    });
    
    orchestrator.on('reporting.updated', (data) => {
        io.emit('workflow_update', {
            type: 'reporting_updated',
            projectId: data.project_id,
            step: 8,
            impactMetrics: data.impact_metrics,
            message: 'Workflow completed - full transparency reporting available'
        });
    });
};

// Helper Functions
function calculateProgress(workflow) {
    const steps = Object.values(workflow.steps);
    const completedSteps = steps.filter(step => step.completed).length;
    const totalSteps = steps.length;
    
    return {
        completed: completedSteps,
        total: totalSteps,
        percentage: Math.round((completedSteps / totalSteps) * 100),
        currentStep: workflow.status
    };
}

function groupByStatus(workflows) {
    return workflows.reduce((acc, workflow) => {
        const status = workflow.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});
}

// Admin Dashboard Specific Endpoints

// Get pending reviews count for admin dashboard
router.get('/admin/pending-reviews', async (req, res) => {
    try {
        // Mock implementation - in real app, query database
        const pendingCount = Math.floor(Math.random() * 5) + 1; // 1-5 pending reviews
        res.json({ count: pendingCount });
    } catch (error) {
        console.error('Error fetching pending reviews count:', error);
        res.status(500).json({ error: 'Failed to fetch pending reviews count' });
    }
});

// Get projects pending admin review
router.get('/admin/pending-projects', async (req, res) => {
    try {
        const mockProjects = [
            {
                id: 'proj_001',
                name: 'Sundarbans Mangrove Conservation',
                location: 'West Bengal, India',
                area: '500 hectares',
                submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                submittedBy: 'Local Conservation NGO',
                type: 'Mangrove Restoration'
            },
            {
                id: 'proj_002', 
                name: 'Chilika Lake Restoration',
                location: 'Odisha, India',
                area: '300 hectares',
                submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                submittedBy: 'State Forest Department',
                type: 'Wetland Conservation'
            }
        ];
        
        res.json({ projects: mockProjects });
    } catch (error) {
        console.error('Error fetching pending projects:', error);
        res.status(500).json({ error: 'Failed to fetch pending projects' });
    }
});

// Submit admin review decision
router.post('/admin/review/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { decision, comments, adminId } = req.body;
        
        if (!['approved', 'rejected'].includes(decision)) {
            return res.status(400).json({ error: 'Invalid decision. Must be approved or rejected.' });
        }
        
        const reviewData = {
            projectId,
            decision,
            comments,
            adminId: adminId || 'admin-dashboard',
            timestamp: new Date().toISOString()
        };
        
        console.log(`📋 Admin review decision: ${decision} for project ${projectId}`);
        
        // Process the review through workflow orchestrator
        if (decision === 'approved') {
            orchestrator.emit('admin.approved', reviewData);
        } else {
            orchestrator.emit('admin.rejected', reviewData);
        }
        
        // Emit real-time notification via WebSocket
        const eventType = decision === 'approved' ? 'workflow:project_approved' : 'workflow:project_rejected';
        if (global.io) {
            global.io.emit(eventType, {
                projectId,
                projectName: `Project ${projectId}`,
                decision,
                comments,
                adminId: reviewData.adminId,
                timestamp: reviewData.timestamp
            });
        }
        
        res.json({ 
            success: true, 
            message: `Project ${decision} successfully`,
            data: reviewData 
        });
    } catch (error) {
        console.error('Error processing admin review:', error);
        res.status(500).json({ error: 'Failed to process admin review' });
    }
});

// Get workflow statistics for admin dashboard
router.get('/admin/statistics', async (req, res) => {
    try {
        // Mock statistics - in real app, aggregate from database
        const stats = {
            totalProjects: 23,
            pendingReviews: Math.floor(Math.random() * 5) + 1,
            verifiedProjects: 18,
            issuedCredits: 15,
            totalCarbonCredits: 12450,
            activeProjects: 8,
            rejectedProjects: 2
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching workflow statistics:', error);
        res.status(500).json({ error: 'Failed to fetch workflow statistics' });
    }
});

// Export router and setup function
module.exports = {
    router,
    setupWebSocketEvents,
    orchestrator
};
