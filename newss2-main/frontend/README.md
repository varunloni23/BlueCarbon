# Blue Carbon MRV System - Frontend

This is the frontend application for the Blue Carbon MRV (Monitoring, Reporting, and Verification) system.

## Deployment Configuration

- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`
- **Node Version**: 18.x

## Project Structure

```
frontend/
├── package.json          # Main package file
├── craco.config.js      # CRACO configuration
├── src/                 # Source code
├── public/              # Public assets
└── build/               # Built files (generated)
```

## Environment Variables

Make sure to set the following environment variables in your deployment:

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_BLOCKCHAIN_URL`: Blockchain network URL
- `NODE_ENV`: production