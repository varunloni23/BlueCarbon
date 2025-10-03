# 📧 Email Setup Guide for Blue Carbon MRV System

This guide will help you set up Gmail SMTP for sending authentication emails (OTP, password reset, etc.).

---

## 🔐 Step 1: Enable 2-Factor Authentication (2FA)

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** section
3. Under "Signing in to Google", click on **2-Step Verification**
4. Follow the prompts to enable 2FA (you'll need your phone)

---

## 🔑 Step 2: Generate App Password

1. After enabling 2FA, return to **Security** settings
2. Under "Signing in to Google", click on **App passwords**
   - Direct link: https://myaccount.google.com/apppasswords
3. You may need to sign in again
4. Select app: **Mail**
5. Select device: **Other (Custom name)**
6. Enter name: `Blue Carbon MRV System`
7. Click **Generate**
8. **Copy the 16-digit password** (it looks like: `abcd efgh ijkl mnop`)
   - Remove spaces when copying: `abcdefghijklmnop`

---

## ⚙️ Step 3: Configure Environment Variables

### Option A: Create .env file (Recommended for Development)

1. Navigate to the backend directory:
   ```bash
   cd /Users/razashaikh/Desktop/sih/backend
   ```

2. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file:
   ```bash
   nano .env
   ```

4. Update these lines with your credentials:
   ```env
   SENDER_EMAIL=your-email@gmail.com
   SENDER_APP_PASSWORD=abcdefghijklmnop
   ```

5. Save and exit (Ctrl+X, then Y, then Enter)

### Option B: Export Environment Variables (Quick Test)

```bash
export SENDER_EMAIL="your-email@gmail.com"
export SENDER_APP_PASSWORD="abcdefghijklmnop"
```

---

## 🧪 Step 4: Test Email Configuration

1. Start the backend server:
   ```bash
   cd /Users/razashaikh/Desktop/sih/backend
   python production_server.py
   ```

2. You should see:
   ```
   ✅ Email service configured: your-email@gmail.com
   ```

3. Test sending OTP via API:
   ```bash
   curl -X POST http://localhost:8002/api/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "purpose": "registration"
     }'
   ```

4. Check the test email inbox - you should receive the OTP!

---

## 🔍 Troubleshooting

### Error: "Username and Password not accepted"

**Solution:** Double-check your app password:
- Make sure you copied all 16 characters
- Remove any spaces from the password
- Ensure 2FA is enabled on your Google account

### Error: "SMTP Authentication Error"

**Solution:** 
- Verify `SENDER_EMAIL` matches the Gmail account that generated the app password
- Try generating a new app password
- Check if "Less secure app access" is disabled (it should be with app passwords)

### Error: "Connection timed out"

**Solution:**
- Check your internet connection
- Verify firewall isn't blocking port 587
- Try changing `SMTP_PORT` to 465 and use SSL instead of TLS

### Emails not received

**Solution:**
- Check spam/junk folder
- Verify the recipient email is correct
- Check Gmail "Sent" folder to confirm email was sent
- Try sending to a different email provider

---

## 📝 Important Security Notes

1. **Never commit .env file to Git** - It's already in .gitignore
2. **Keep your app password secret** - Treat it like a regular password
3. **Revoke app passwords** you're not using from Google Account settings
4. **Use environment variables** in production, not .env files

---

## 🚀 Production Deployment

For production (Render, Heroku, etc.):

1. Add environment variables in the hosting platform dashboard:
   - `SENDER_EMAIL`
   - `SENDER_APP_PASSWORD`
   - `SMTP_SERVER` (optional, defaults to smtp.gmail.com)
   - `SMTP_PORT` (optional, defaults to 587)

2. **DO NOT** deploy .env file to production

---

## 📧 Email Templates

The system sends these types of emails:

1. **OTP for Registration** - 6-digit code to verify email
2. **OTP for Password Reset** - 6-digit code to reset password
3. **Welcome Email** - Sent after successful registration
4. **Password Reset Confirmation** - Sent after password change
5. **Project Status Notification** - Sent when project is approved/rejected

All emails are styled with HTML templates for professional appearance.

---

## ✅ Verification Checklist

- [ ] 2FA enabled on Google Account
- [ ] App password generated (16 digits)
- [ ] `.env` file created with correct credentials
- [ ] Server starts with "✅ Email service configured" message
- [ ] Test OTP email received successfully
- [ ] .env file is in .gitignore (never commit it!)

---

## 🆘 Need Help?

If you're still having issues:

1. Check the server console for detailed error messages
2. Verify your Gmail account settings at https://myaccount.google.com/security
3. Try creating a new app password
4. Test with a simple Python script first to isolate the issue

---

**Ready to go! 🎉** Once configured, all authentication emails will be sent automatically.
