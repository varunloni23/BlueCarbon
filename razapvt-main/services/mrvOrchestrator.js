/**
 * Central MRV Workflow Orchestrator
 * Connects all three components: Backend (Blockchain), Admin Dashboard, Python User App
 */

const axios = require('axios');
const { EventEmitter } = require('events');

class MRVWorkflowOrchestrator extends EventEmitter {
    constructor() {
        super();
        
        // Service endpoints
        this.services = {
            blockchain: 'http://localhost:5000',      // Main backend (this service)
            adminDashboard: 'http://localhost:3001',  // Admin React app
            userAppBackend: 'http://localhost:8000',  // Python FastAPI
            userAppFrontend: 'http://localhost:3000'  // User React app
        };
        
        // Initialize workflow state tracking
        this.activeWorkflows = new Map();
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Step 1: Project Upload Handler
        this.on('project.uploaded', this.handleProjectUpload.bind(this));
        
        // Step 2: Admin Review Handler  
        this.on('admin.reviewed', this.handleAdminReview.bind(this));
        
        // Step 3: MRV Data Collected
        this.on('mrv.collected', this.handleMRVCollection.bind(this));
        
        // Step 4: Verification Complete
        this.on('verification.complete', this.handleVerificationComplete.bind(this));
        
        // Step 5: Credits Tokenized
        this.on('credits.tokenized', this.handleCreditsTokenized.bind(this));
        
        // Step 6: Credits Purchased
        this.on('credits.purchased', this.handleCreditsPurchased.bind(this));
        
        // Step 7: Payments Distributed
        this.on('payments.distributed', this.handlePaymentsDistributed.bind(this));
        
        // Step 8: Reporting Updated
        this.on('reporting.updated', this.handleReportingUpdate.bind(this));
    }

    // Step 1: Project Data Upload by User
    async handleProjectUpload(projectData) {
        try {
            console.log('🌊 Step 1: Processing project upload...', projectData.project_id);
            
            const workflow = {
                projectId: projectData.project_id,
                status: 'uploaded',
                steps: {
                    upload: { completed: true, timestamp: new Date() },
                    adminReview: { completed: false },
                    mrvCollection: { completed: false },
                    verification: { completed: false },
                    tokenization: { completed: false },
                    marketplace: { completed: false },
                    payment: { completed: false },
                    reporting: { completed: false }
                },
                projectData: projectData
            };
            
            this.activeWorkflows.set(projectData.project_id, workflow);
            
            // Store project in blockchain backend database
            await this.storeProjectInBlockchain(projectData);
            
            // Upload media files to IPFS
            const ipfsHashes = await this.uploadToIPFS(projectData.media_files);
            workflow.ipfsHashes = ipfsHashes;
            
            // Create blockchain record with IPFS links
            const blockchainTx = await this.createBlockchainRecord(projectData.project_id, ipfsHashes);
            workflow.blockchainTx = blockchainTx;
            
            // Notify admin dashboard of new project submission
            await this.notifyAdminDashboard('new_project', {
                projectId: projectData.project_id,
                projectName: projectData.project_name,
                location: projectData.location,
                uploadedAt: new Date(),
                status: 'pending_review',
                ipfsHashes: ipfsHashes,
                blockchainTx: blockchainTx
            });
            
            // Update user app status
            await this.updateUserAppStatus(projectData.project_id, 'submitted_for_review');
            
            console.log('✅ Step 1 Complete: Project uploaded and ready for admin review');
            
            return { success: true, workflow: workflow };
            
        } catch (error) {
            console.error('❌ Step 1 Failed:', error);
            throw error;
        }
    }

    // Step 2: NCCR Admin Dashboard Review
    async handleAdminReview(reviewData) {
        try {
            console.log('👨‍💼 Step 2: Processing admin review...', reviewData.project_id);
            
            const workflow = this.activeWorkflows.get(reviewData.project_id);
            if (!workflow) throw new Error('Workflow not found');
            
            workflow.steps.adminReview = {
                completed: true,
                timestamp: new Date(),
                action: reviewData.action,
                comments: reviewData.comments,
                reviewedBy: reviewData.admin_id
            };
            
            if (reviewData.action === 'approve') {
                // Update blockchain status
                await this.updateBlockchainStatus(reviewData.project_id, 'approved');
                
                // Notify user app of approval
                await this.updateUserAppStatus(reviewData.project_id, 'approved_ready_for_mrv');
                
                // Trigger MRV collection phase
                await this.initiateMRVCollection(reviewData.project_id);
                
                workflow.status = 'approved';
                console.log('✅ Step 2 Complete: Project approved, MRV collection initiated');
                
            } else if (reviewData.action === 'reject') {
                workflow.status = 'rejected';
                await this.updateBlockchainStatus(reviewData.project_id, 'rejected');
                await this.updateUserAppStatus(reviewData.project_id, 'rejected');
                console.log('❌ Step 2 Complete: Project rejected');
            }
            
            return { success: true, workflow: workflow };
            
        } catch (error) {
            console.error('❌ Step 2 Failed:', error);
            throw error;
        }
    }

    // Step 3: MRV Data Collection
    async handleMRVCollection(mrvData) {
        try {
            console.log('📊 Step 3: Processing MRV data collection...', mrvData.project_id);
            
            const workflow = this.activeWorkflows.get(mrvData.project_id);
            if (!workflow) throw new Error('Workflow not found');
            
            // Upload MRV data to IPFS
            const mrvIpfsHashes = await this.uploadMRVDataToIPFS(mrvData);
            
            // Store MRV data in blockchain
            await this.storeMRVDataInBlockchain(mrvData.project_id, mrvIpfsHashes);
            
            workflow.steps.mrvCollection = {
                completed: true,
                timestamp: new Date(),
                dataPoints: mrvData.data_points,
                ipfsHashes: mrvIpfsHashes
            };
            
            // Trigger automated verification
            await this.initiateVerification(mrvData.project_id);
            
            console.log('✅ Step 3 Complete: MRV data collected, verification initiated');
            
            return { success: true, workflow: workflow };
            
        } catch (error) {
            console.error('❌ Step 3 Failed:', error);
            throw error;
        }
    }

    // Step 4: MRV Verification & Approval
    async handleVerificationComplete(verificationData) {
        try {
            console.log('🔍 Step 4: Processing verification...', verificationData.project_id);
            
            const workflow = this.activeWorkflows.get(verificationData.project_id);
            if (!workflow) throw new Error('Workflow not found');
            
            workflow.steps.verification = {
                completed: true,
                timestamp: new Date(),
                verificationScore: verificationData.score,
                carbonCreditsCalculated: verificationData.carbon_credits,
                verifiedBy: verificationData.verifier_id
            };
            
            if (verificationData.status === 'verified') {
                // Update blockchain with verification results
                await this.updateBlockchainStatus(verificationData.project_id, 'verified');
                
                // Trigger carbon credit tokenization
                await this.initiateTokenization(verificationData.project_id, verificationData.carbon_credits);
                
                workflow.status = 'verified';
                console.log('✅ Step 4 Complete: Project verified, tokenization initiated');
                
            } else {
                workflow.status = 'verification_failed';
                await this.updateBlockchainStatus(verificationData.project_id, 'verification_failed');
                console.log('❌ Step 4: Verification failed');
            }
            
            return { success: true, workflow: workflow };
            
        } catch (error) {
            console.error('❌ Step 4 Failed:', error);
            throw error;
        }
    }

    // Step 5: Carbon Credit Tokenization
    async handleCreditsTokenized(tokenData) {
        try {
            console.log('🪙 Step 5: Processing credit tokenization...', tokenData.project_id);
            
            const workflow = this.activeWorkflows.get(tokenData.project_id);
            if (!workflow) throw new Error('Workflow not found');
            
            workflow.steps.tokenization = {
                completed: true,
                timestamp: new Date(),
                tokenId: tokenData.token_id,
                creditAmount: tokenData.credit_amount,
                blockchainTx: tokenData.blockchain_tx
            };
            
            // Make credits available in marketplace
            await this.listCreditsInMarketplace(tokenData);
            
            workflow.status = 'tokenized';
            console.log('✅ Step 5 Complete: Credits tokenized and listed in marketplace');
            
            return { success: true, workflow: workflow };
            
        } catch (error) {
            console.error('❌ Step 5 Failed:', error);
            throw error;
        }
    }

    // Step 6: Credit Marketplace & Sale
    async handleCreditsPurchased(purchaseData) {
        try {
            console.log('🛒 Step 6: Processing credit purchase...', purchaseData.listing_id);
            
            const workflow = this.activeWorkflows.get(purchaseData.project_id);
            if (!workflow) throw new Error('Workflow not found');
            
            workflow.steps.marketplace = {
                completed: true,
                timestamp: new Date(),
                buyer: purchaseData.buyer,
                quantity: purchaseData.quantity,
                totalPaid: purchaseData.total_paid,
                transactionHash: purchaseData.transaction_hash
            };
            
            // Trigger payment distribution
            await this.initiatePaymentDistribution(purchaseData);
            
            console.log('✅ Step 6 Complete: Credits purchased, payment distribution initiated');
            
            return { success: true, workflow: workflow };
            
        } catch (error) {
            console.error('❌ Step 6 Failed:', error);
            throw error;
        }
    }

    // Step 7: Auto Payment & Distribution
    async handlePaymentsDistributed(paymentData) {
        try {
            console.log('💰 Step 7: Processing payment distribution...', paymentData.project_id);
            
            const workflow = this.activeWorkflows.get(paymentData.project_id);
            if (!workflow) throw new Error('Workflow not found');
            
            workflow.steps.payment = {
                completed: true,
                timestamp: new Date(),
                distributions: paymentData.distributions,
                conversionRate: paymentData.crypto_to_inr_rate,
                bankTransfers: paymentData.bank_transfers,
                upiPayments: paymentData.upi_payments
            };
            
            // Send notifications to stakeholders
            await this.sendPaymentNotifications(paymentData);
            
            // Update reporting dashboard
            await this.updateReportingDashboard(paymentData.project_id);
            
            console.log('✅ Step 7 Complete: Payments distributed to stakeholders');
            
            return { success: true, workflow: workflow };
            
        } catch (error) {
            console.error('❌ Step 7 Failed:', error);
            throw error;
        }
    }

    // Step 8: Reporting & Transparency
    async handleReportingUpdate(reportData) {
        try {
            console.log('📊 Step 8: Updating reporting dashboard...', reportData.project_id);
            
            const workflow = this.activeWorkflows.get(reportData.project_id);
            if (!workflow) throw new Error('Workflow not found');
            
            workflow.steps.reporting = {
                completed: true,
                timestamp: new Date(),
                impactMetrics: reportData.impact_metrics,
                transparencyScore: reportData.transparency_score
            };
            
            workflow.status = 'completed';
            
            // Update all dashboards with final metrics
            await this.updateAllDashboards(workflow);
            
            console.log('✅ Step 8 Complete: Full MRV workflow completed successfully!');
            console.log('🎉 Project', reportData.project_id, 'has completed the full cycle from upload to reporting');
            
            return { success: true, workflow: workflow };
            
        } catch (error) {
            console.error('❌ Step 8 Failed:', error);
            throw error;
        }
    }

    // Helper Methods for Service Integration

    async storeProjectInBlockchain(projectData) {
        // This method would integrate with actual blockchain smart contracts
        console.log('Storing project in blockchain:', projectData.project_id);
        return `0x${Date.now().toString(16)}`;
    }

    async uploadToIPFS(mediaFiles) {
        // Integration with IPFS service
        console.log('Uploading media files to IPFS');
        return mediaFiles?.map(file => `Qm${Date.now()}${Math.random()}`);
    }

    async createBlockchainRecord(projectId, ipfsHashes) {
        // Create immutable blockchain record
        console.log('Creating blockchain record for project:', projectId);
        return `0x${Date.now().toString(16)}`;
    }

    async notifyAdminDashboard(eventType, data) {
        try {
            // Send real-time notification to admin dashboard
            console.log('Notifying admin dashboard:', eventType, data.projectId);
            // In production, this would use WebSocket or push notifications
            return { success: true };
        } catch (error) {
            console.error('Failed to notify admin dashboard:', error);
        }
    }

    async updateUserAppStatus(projectId, status) {
        try {
            await axios.post(`${this.services.userAppBackend}/api/projects/${projectId}/status`, {
                status: status,
                timestamp: new Date()
            });
            console.log('Updated user app status:', projectId, status);
        } catch (error) {
            console.error('Failed to update user app status:', error);
        }
    }

    async updateBlockchainStatus(projectId, status) {
        // Update blockchain smart contract state
        console.log('Updating blockchain status:', projectId, status);
        return `0x${Date.now().toString(16)}`;
    }

    async initiateMRVCollection(projectId) {
        // Trigger MRV data collection phase
        console.log('Initiating MRV collection for project:', projectId);
        await this.updateUserAppStatus(projectId, 'mrv_collection_ready');
    }

    async uploadMRVDataToIPFS(mrvData) {
        // Upload MRV data to IPFS for immutable storage
        console.log('Uploading MRV data to IPFS');
        return [`Qm${Date.now()}MRV${Math.random()}`];
    }

    async storeMRVDataInBlockchain(projectId, ipfsHashes) {
        // Store MRV data hashes in blockchain
        console.log('Storing MRV data in blockchain:', projectId);
        return `0x${Date.now().toString(16)}`;
    }

    async initiateVerification(projectId) {
        // Trigger automated verification process
        console.log('Initiating verification for project:', projectId);
        // Simulate verification completion after delay
        setTimeout(() => {
            this.emit('verification.complete', {
                project_id: projectId,
                status: 'verified',
                score: 95,
                carbon_credits: 50.5,
                verifier_id: 'system_verifier'
            });
        }, 5000);
    }

    async initiateTokenization(projectId, carbonCredits) {
        // Trigger carbon credit tokenization
        console.log('Initiating tokenization for project:', projectId, 'credits:', carbonCredits);
        setTimeout(() => {
            this.emit('credits.tokenized', {
                project_id: projectId,
                token_id: `BCT_${projectId}_${Date.now()}`,
                credit_amount: carbonCredits,
                blockchain_tx: `0x${Date.now().toString(16)}`
            });
        }, 3000);
    }

    async listCreditsInMarketplace(tokenData) {
        // Make credits available in marketplace
        console.log('Listing credits in marketplace:', tokenData.token_id);
        await axios.post(`${this.services.userAppBackend}/api/marketplace/list`, {
            project_id: tokenData.project_id,
            credit_amount: tokenData.credit_amount,
            price_per_credit: 15.0,
            currency: 'MATIC',
            description: 'Verified blue carbon credits',
            certification_level: 'Gold Standard'
        });
    }

    async initiatePaymentDistribution(purchaseData) {
        // Trigger payment distribution to stakeholders
        console.log('Initiating payment distribution for purchase:', purchaseData.listing_id);
        setTimeout(() => {
            this.emit('payments.distributed', {
                project_id: purchaseData.project_id,
                distributions: {
                    community: purchaseData.total_paid * 0.7,
                    verifier: purchaseData.total_paid * 0.2,
                    platform: purchaseData.total_paid * 0.1
                },
                crypto_to_inr_rate: 65.0,
                bank_transfers: ['TXN123', 'TXN124'],
                upi_payments: ['UPI456']
            });
        }, 2000);
    }

    async sendPaymentNotifications(paymentData) {
        // Send SMS/WhatsApp/app notifications about payments
        console.log('Sending payment notifications for project:', paymentData.project_id);
        // Integration with notification services
    }

    async updateReportingDashboard(projectId) {
        // Update reporting dashboard with latest data
        console.log('Updating reporting dashboard for project:', projectId);
        setTimeout(() => {
            this.emit('reporting.updated', {
                project_id: projectId,
                impact_metrics: {
                    co2_sequestered: 50.5,
                    area_restored: 25.5,
                    community_beneficiaries: 150
                },
                transparency_score: 98
            });
        }, 1000);
    }

    async updateAllDashboards(workflow) {
        // Update admin and user dashboards with completed workflow
        console.log('Updating all dashboards with completed workflow:', workflow.projectId);
        // Send final updates to all connected services
    }

    // Public API Methods

    getWorkflowStatus(projectId) {
        return this.activeWorkflows.get(projectId);
    }

    getAllActiveWorkflows() {
        return Array.from(this.activeWorkflows.values());
    }

    getWorkflowsByStatus(status) {
        return Array.from(this.activeWorkflows.values()).filter(w => w.status === status);
    }
}

module.exports = MRVWorkflowOrchestrator;
