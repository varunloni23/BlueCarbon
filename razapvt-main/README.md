# Blue Carbon MRV System Backend

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
NEONDB_CONNECTION_STRING=your_neondb_connection_string

# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
RPC_URL=https://rpc-amoy.polygon.technology
NETWORK=amoy

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# IPFS Configuration
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Start production server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/wallet-auth` - Authenticate with wallet
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/kyc` - Submit KYC documents

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `POST /api/projects/:id/verify` - Verify project

### Carbon Credits
- `GET /api/credits` - Get all carbon credits
- `POST /api/credits/issue` - Issue new credits
- `POST /api/credits/:id/transfer` - Transfer credits
- `POST /api/credits/:id/retire` - Retire credits
- `GET /api/credits/owner/:address` - Get credits by owner

### Blockchain
- `GET /api/blockchain/status` - Get blockchain status
- `POST /api/blockchain/register-project` - Register project on blockchain
- `POST /api/blockchain/mint-credits` - Mint carbon credits
- `GET /api/blockchain/balance/:address` - Get token balance

### IPFS
- `POST /api/ipfs/upload` - Upload file to IPFS
- `POST /api/ipfs/upload-multiple` - Upload multiple files
- `POST /api/ipfs/upload-json` - Upload JSON data
- `GET /api/ipfs/file/:hash` - Get file from IPFS

### Verification
- `GET /api/verification` - Get all verifications
- `POST /api/verification` - Create verification request
- `PUT /api/verification/:id` - Update verification
- `POST /api/verification/:id/data` - Upload verification data

### Payments
- `POST /api/payments/create` - Create new payment
- `POST /api/payments/:id/process-crypto` - Process crypto payment
- `POST /api/payments/:id/process-fiat` - Process fiat payment
- `GET /api/payments/user/:address` - Get user payments

### Analytics
- `GET /api/analytics/overview` - System overview analytics
- `GET /api/analytics/carbon-impact` - Carbon impact analytics
- `GET /api/analytics/financial` - Financial analytics
- `GET /api/analytics/geospatial` - Geospatial analytics

## Features

### Real-time Updates
- Socket.IO integration for real-time notifications
- Project updates
- Payment confirmations
- Verification status changes

### Security
- JWT authentication
- Rate limiting
- Helmet.js security headers
- Input validation
- Error handling

### Blockchain Integration
- Direct contract interaction
- Transaction monitoring
- Gas optimization
- Multi-network support

### IPFS Storage
- File upload handling
- Image processing
- Metadata storage
- Pin management

### Payment Processing
- Crypto payments
- Fiat integration
- Automated distribution
- Escrow functionality

### Verification System
- Multi-method verification
- Document management
- AI analysis integration
- Dispute handling

### Analytics
- Comprehensive reporting
- Real-time metrics
- Geospatial analysis
- Financial insights

## Database Schema

### Collections
- `users` - User profiles and authentication
- `projects` - Blue carbon projects
- `carboncredits` - Carbon credit tokens
- `verifications` - Verification records
- `payments` - Payment transactions
- `exchangerates` - Currency exchange rates

### Indexes
- Geospatial indexes for location queries
- Compound indexes for efficient filtering
- Text indexes for search functionality

## Deployment

### Production Environment
1. Set NODE_ENV=production
2. Configure NeonDB PostgreSQL connection
3. Set up IPFS node or use Pinata
4. Configure SSL certificates
5. Set up monitoring and logging

### Docker Deployment
```bash
docker build -t blue-carbon-backend .
docker run -p 5000:5000 blue-carbon-backend
```

## Testing

Run tests:
```bash
npm test
```

## Monitoring

- Winston logging
- Error tracking
- Performance monitoring
- API analytics

## Support

For technical support or questions, please refer to the project documentation or contact the development team.
