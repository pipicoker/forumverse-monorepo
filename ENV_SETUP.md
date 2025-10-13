# Environment Variables Setup Guide

## Frontend (.env.local)

Create a `.env.local` file in the `forumverse-frontend` directory:

```env
VITE_BACKEND_BASE_URL=http://localhost:3001
```

**Note:** The frontend code has fallback values, so this is optional. If not set, it defaults to `http://localhost:3001`.

## Backend (.env)

Create a `.env` file in the `forumverse-backend` directory:

```env
# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:8080

# Database
DATABASE_URL="your_database_url_here"

# JWT Secret (use a secure random string)
JWT_SECRET=your_jwt_secret_here

# Email Configuration (for verification emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password_or_app_password

# Backend URL (for email verification links)
BACKEND_BASE_URL=http://localhost:3001

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Current Issues Fixed

### 1. API Endpoint Errors (400 Bad Request)
- ✅ Fixed duplicate `/api` in auth endpoints
- ✅ Added proper error logging in login controller
- ✅ Added fallback URLs for CORS configuration

### 2. Posts Endpoint (403 Forbidden)
- ✅ Will be resolved once login works and token is saved

### 3. Better Error Handling
- ✅ Added detailed error logging in backend
- ✅ Improved frontend error handling in AuthContext
- ✅ Added console logging to debug issues

## How to Apply Changes

1. **Restart Frontend Server:**
   ```bash
   # Stop the current frontend server (Ctrl+C)
   cd forumverse-frontend
   npm run dev
   ```

2. **Backend Auto-Restarts:**
   - The backend (ts-node-dev) should auto-restart when files change
   - If not, restart manually:
     ```bash
     # Stop the current backend server (Ctrl+C)
     cd forumverse-backend
     npm run dev
     ```

3. **Clear Browser Cache:**
   - Open DevTools (F12)
   - Right-click the refresh button → "Empty Cache and Hard Reload"
   - Or clear localStorage: `localStorage.clear()` in console

## Testing the Fix

1. Open the app at `http://localhost:8080`
2. Try to login with the demo account:
   - Email: `sarahekere79@gmail.com`
   - Password: `sophia123`
3. Check the backend console for the new log message: `Login request body: { email: '...', password: '...' }`
4. If you still see errors, check the backend console for the detailed error message

## Common Issues

### Still getting 400 errors?
- Make sure the user's email is verified in the database
- Check backend logs for the actual validation error
- Ensure the request body is being sent as JSON

### Still getting 403 errors on posts?
- This happens when not authenticated
- Make sure login succeeds first
- Check that the token is saved in localStorage

### CORS errors?
- Ensure `FRONTEND_URL` in backend .env matches your frontend URL
- Default fallback is `http://localhost:8080`

