# Blue Carbon MRV System - Authentication & User Management Implementation

## 🎯 Implementation Summary

### ✅ Features Implemented

#### 1. **User Registration with OTP Email Verification**
- Users can register with email, password, full name, organization, and phone
- OTP (6-digit code) sent to email for verification
- OTP expires in 10 minutes
- Maximum 3 attempts to verify OTP
- Password strength validation (min 8 chars, uppercase, lowercase, digit)
- Email format validation

#### 2. **User Login System**
- Email and password authentication
- Session token generation
- Last login timestamp tracking
- Email verification check before login

#### 3. **Forget Password / Password Reset**
- Request OTP for password reset
- Verify OTP before allowing password change
- Same security validations as registration
- Confirmation email sent after successful reset

#### 4. **User-Project Linking**
- Projects now store `user_id` and `user_email`
- Admin dashboard shows creator email instead of "Unknown"
- Created by field displays user's email

#### 5. **Email Notifications for Project Status**
- Email sent when project is **APPROVED** ✅
  - Shows project name, carbon credits awarded
  - Includes reviewer comments
  - Link to dashboard
- Email sent when project is **REJECTED** ❌
  - Shows reason for rejection
  - Includes reviewer feedback
  - Guidance for resubmission

---

## 📁 New Files Created

### Backend Files:

#### `/backend/auth_service.py`
**Purpose**: Complete authentication service
**Features**:
- OTP generation and verification
- User registration
- User login
- Password reset
- Email sending (HTML templates)
- Password hashing (SHA256)
- Email validation
- Password strength validation

**Key Functions**:
```python
send_otp(email, purpose='registration'|'reset')
verify_otp(email, otp, purpose)
register_user(user_data)
login_user(email, password)
reset_password(email, new_password)
send_project_status_notification(email, full_name, project_name, status, comments, carbon_credits)
```

---

## 🔧 Modified Files

### Backend Modifications:

#### `/backend/production_server.py`
**Changes**:
1. **New Authentication Endpoints**:
   - `POST /api/auth/send-otp` - Send OTP for registration/reset
   - `POST /api/auth/verify-otp` - Verify OTP code
   - `POST /api/auth/register` - Register new user
   - `POST /api/auth/login` - Login user
   - `POST /api/auth/reset-password` - Reset password after OTP verification

2. **Project Creation Updates**:
   - Now accepts `user_id` and `user_email` from request
   - Stores user information with project
   - Links project to creator

3. **Admin Review Updates**:
   - Fetches user details from database
   - Sends email notification after approval/rejection
   - Includes carbon credits info in approval email
   - Includes reviewer comments in notification

#### `/backend/neondb_service.py`
**Changes**:
1. **Enhanced Users Table**:
   ```sql
   CREATE TABLE IF NOT EXISTS users (
       id SERIAL PRIMARY KEY,
       user_id VARCHAR(255) UNIQUE NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       password_hash VARCHAR(255) NOT NULL,
       full_name VARCHAR(255) NOT NULL,
       organization VARCHAR(255),
       phone VARCHAR(50),
       role VARCHAR(50) DEFAULT 'user',
       email_verified BOOLEAN DEFAULT FALSE,
       wallet_address VARCHAR(255),
       last_login TIMESTAMP,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **Projects Table Updates**:
   ```sql
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
   ```

3. **New User Management Methods**:
   ```python
   create_user(user_data)
   get_user_by_email(email)
   get_user_by_id(user_id)
   update_user_password(user_id, password_hash)
   update_user_last_login(user_id)
   update_user_email_verified(user_id, verified)
   ```

4. **Updated Project Creation**:
   - Now accepts and stores `user_id` and `user_email` fields

---

## 🔌 API Endpoints

### Authentication Endpoints:

#### 1. Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "purpose": "registration"  // or "reset"
}

Response:
{
  "success": true,
  "message": "OTP sent to user@example.com",
  "expires_in_minutes": 10
}
```

#### 2. Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "registration"
}

Response:
{
  "success": true,
  "message": "OTP verified successfully"
}
```

#### 3. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "organization": "Coastal Conservation Org",
  "phone": "+91-9876543210",
  "role": "user"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "user_id": "USER_ABC123",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

#### 4. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "user_id": "USER_ABC123",
    "email": "user@example.com",
    "full_name": "John Doe",
    "organization": "Coastal Conservation Org",
    "role": "user"
  },
  "token": "session_token_here"
}
```

#### 5. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "new_password": "NewSecurePass123"
}

Response:
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 📧 Email Templates

### Registration OTP Email:
```
Subject: 🌊 Blue Carbon MRV - Verify Your Email
Body: HTML template with OTP code, expires in 10 minutes
```

### Password Reset Email:
```
Subject: 🔐 Blue Carbon MRV - Password Reset Code  
Body: HTML template with reset code
```

### Welcome Email:
```
Subject: 🎉 Welcome to Blue Carbon MRV System!
Body: Welcome message, feature list, login link
```

### Project Approved Email:
```
Subject: ✅ Project Approved - Blue Carbon MRV
Body: 
- Congratulations message
- Project name
- Carbon credits awarded
- Reviewer comments
- Dashboard link
```

### Project Rejected Email:
```
Subject: ❌ Project Status Update - Blue Carbon MRV
Body:
- Rejection notification
- Project name
- Reviewer feedback
- Resubmission guidance
- Dashboard link
```

---

## 🔒 Security Features

1. **Password Hashing**: SHA256 encryption
2. **OTP Expiry**: 10-minute time limit
3. **Rate Limiting**: Max 3 OTP verification attempts
4. **Email Validation**: Regex pattern matching
5. **Password Strength**: Minimum 8 chars, mixed case, digits
6. **Session Tokens**: Secure token generation
7. **Email Verification**: Required before login

---

## 🚀 Testing the Implementation

### 1. Start Backend Server:
```bash
cd /Users/razashaikh/Desktop/sih/backend
python3 production_server.py
```

### 2. Test Registration Flow:
```bash
# Step 1: Send OTP
curl -X POST http://localhost:8002/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","purpose":"registration"}'

# Step 2: Check console for OTP (in development mode)

# Step 3: Verify OTP
curl -X POST http://localhost:8002/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456","purpose":"registration"}'

# Step 4: Register User
curl -X POST http://localhost:8002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test1234",
    "full_name":"Test User",
    "organization":"Test Org",
    "phone":"+91-9876543210"
  }'
```

### 3. Test Login:
```bash
curl -X POST http://localhost:8002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

### 4. Test Password Reset:
```bash
# Step 1: Request OTP
curl -X POST http://localhost:8002/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","purpose":"reset"}'

# Step 2: Verify OTP (check console)
curl -X POST http://localhost:8002/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456","purpose":"reset"}'

# Step 3: Reset Password
curl -X POST http://localhost:8002/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","new_password":"NewPass1234"}'
```

---

## 📊 Database Schema Changes

### Users Table (Enhanced):
- `user_id` (VARCHAR, UNIQUE) - Unique user identifier
- `email` (VARCHAR, UNIQUE) - User email
- `password_hash` (VARCHAR) - Hashed password
- `full_name` (VARCHAR) - Full name
- `organization` (VARCHAR) - Organization name
- `phone` (VARCHAR) - Phone number
- `role` (VARCHAR) - user/admin
- `email_verified` (BOOLEAN) - Email verification status
- `wallet_address` (VARCHAR) - Blockchain wallet
- `last_login` (TIMESTAMP) - Last login time
- `created_at` (TIMESTAMP) - Registration time
- `updated_at` (TIMESTAMP) - Last update time

### Projects Table (Added Columns):
- `user_id` (VARCHAR) - Creator's user ID
- `user_email` (VARCHAR) - Creator's email

---

## 📝 Next Steps for Frontend Integration

### 1. Create Registration Page with OTP:
- Email input → Send OTP button
- OTP verification form (6-digit input)
- Registration form (after OTP verified)
- Password strength indicator
- Form validation

### 2. Update Login Page:
- Add "Forgot Password?" link
- Store user info and token in localStorage
- Redirect to dashboard after login

### 3. Create Forgot Password Flow:
- Request OTP page
- OTP verification
- New password form
- Success redirect to login

### 4. Update Project Creation:
- Auto-fill user_id and user_email from logged-in user
- Send with project submission

### 5. Update Admin Dashboard:
- Display creator email instead of "Unknown"
- Show user details in project view

---

## 🎨 Email Configuration for Production

To enable actual email sending (currently in simulation mode):

### 1. Get Gmail App Password:
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → App Passwords
3. Generate app password for "Mail"

### 2. Set Environment Variables:
```bash
export SENDER_EMAIL="your-email@gmail.com"
export SENDER_PASSWORD="your-app-password"
```

### 3. Uncomment SMTP Code in `auth_service.py`:
```python
# Find the send_email() function
# Uncomment the SMTP section
```

---

## ✅ Verification Checklist

- [x] User registration with OTP
- [x] Email OTP verification
- [x] User login system
- [x] Forget password flow
- [x] Password reset with OTP
- [x] User-project linking
- [x] Admin sees creator email
- [x] Email notification on approval
- [x] Email notification on rejection
- [x] Database schema updated
- [x] API endpoints created
- [x] Security validations
- [ ] Frontend UI components (next step)
- [ ] Production email configuration (next step)

---

## 🐛 Troubleshooting

### Issue: OTP not received
**Solution**: Check console output (development mode shows OTP in terminal)

### Issue: Password validation fails
**Solution**: Ensure password has:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 digit

### Issue: User registration fails
**Solution**: 
1. Verify OTP first
2. Check if email already exists
3. Ensure all required fields provided

### Issue: Email showing "Unknown" in admin
**Solution**: Ensure project creation includes `user_id` and `user_email` fields

---

## 📞 Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify database connection is working
3. Ensure all required fields are provided in API requests
4. Check OTP expiry (10 minutes)

---

**Implementation Date**: October 1, 2025
**System Version**: 3.0.0
**Status**: ✅ Backend Complete, Frontend Integration Pending
