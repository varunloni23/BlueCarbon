# NeonDB Setup for Blue Carbon MRV System

This project has been migrated from MongoDB Atlas to NeonDB (PostgreSQL). Follow these steps to set up your database.

## 1. Create a NeonDB Account

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project

## 2. Get Your Connection String

1. In your NeonDB dashboard, go to your project
2. Click on "Connection Details"
3. Copy the connection string (it looks like this):
   ```
   postgresql://username:password@hostname.neon.tech/dbname?sslmode=require
   ```

## 3. Update Environment Variables

1. Open `/backend/.env`
2. Replace the `DATABASE_URL` with your actual NeonDB connection string:
   ```env
   DATABASE_URL=postgresql://your_username:your_password@your_host.neon.tech/your_database?sslmode=require
   ```

## 4. Run Database Migration

```bash
cd backend
node scripts/migrate-neondb.js
```

This will:
- Create all necessary tables (users, projects, verification_data, carbon_credits)
- Add indexes for performance
- Insert sample data including an admin user

## 5. Default Admin Login

After migration, you can login with:
- Email: `admin@bluecarbonmrv.com`
- Password: `admin123`

## 6. Start the Server

```bash
cd backend
npm start
```

## Database Schema

### Tables Created:

1. **users** - User accounts and authentication
2. **projects** - Blue carbon restoration projects
3. **verification_data** - AI verification scores and data
4. **carbon_credits** - Tokenized carbon credits

### Key Features:

- ✅ PostgreSQL with JSONB support for flexible data
- ✅ Proper relationships with foreign keys
- ✅ Indexes for performance
- ✅ SSL support for secure connections
- ✅ Connection pooling for scalability

## Troubleshooting

### Connection Issues
- Verify your connection string is correct
- Check that your IP is whitelisted in NeonDB settings
- Ensure SSL mode is enabled

### Migration Issues
- Make sure the database exists in NeonDB
- Check that you have proper permissions
- Verify the connection string format

### Performance
- NeonDB automatically scales based on usage
- Connection pooling is configured for optimal performance
- Indexes are created for common queries

## Environment Variables Reference

```env
# NeonDB Configuration
DATABASE_URL=postgresql://username:password@hostname.neon.tech/database?sslmode=require

# Other required variables
PRIVATE_KEY=your_blockchain_private_key
RPC_URL=https://rpc-amoy.polygon.technology
JWT_SECRET=your_jwt_secret
```

## Benefits of NeonDB vs MongoDB

1. **Better Performance** - PostgreSQL is optimized for complex queries
2. **ACID Compliance** - Ensures data consistency
3. **SQL Support** - Standard query language
4. **JSON Support** - JSONB fields for flexible data
5. **Auto-scaling** - Scales automatically based on usage
6. **Cost Effective** - Generous free tier