# Notification Authentication - Testing Instructions

## Step-by-Step Debugging

### 1. Restart Backend
```bash
cd forumverse-backend
npm run dev
```

### 2. Refresh Frontend
- Press F5 in your browser
- Clear browser cache if needed (Ctrl+Shift+Delete)

### 3. Test and Check Logs

#### In Browser Console (F12 → Console):
When you click to mark a notification as read, look for:
```
[Axios] Token Info: {
  url: "/notifications/cmgqz.../read",
  tokenLength: 143,
  tokenStart: "eyJhbGciOiJIUzI1NiIs...",
  hasAuthHeader: true
}
```

#### In Backend Terminal:
Look for:
```
[Auth Middleware] Debug: {
  path: '/notifications/cmgqz.../read',
  method: 'PATCH',
  hasAuthHeader: true,
  authHeaderStart: 'Bearer eyJhbGciOiJ...',
  hasToken: true
}
```

### 4. Diagnose Based on Output

#### Case A: Frontend has token, Backend missing auth header
**Diagnosis:** Header not reaching backend
**Quick Test:**
1. Open browser DevTools → Network tab
2. Click to mark notification as read
3. Find the PATCH request to `/notifications/.../read`
4. Click on it → Headers tab
5. Scroll to "Request Headers"
6. Look for: `Authorization: Bearer ...`

If it's there → Backend issue
If it's not there → Frontend axios issue

#### Case B: Backend gets header but extracts no token
**Check backend logs for:**
```
[Auth Middleware] Debug: {
  hasAuthHeader: true,
  authHeaderStart: 'Bearer ...',  // Does this show "Bearer"?
  hasToken: false  // ← Problem here
}
```

#### Case C: Token verification fails
**Check backend logs for:**
```
[Auth Middleware] Token verification failed: jwt malformed
// or
[Auth Middleware] Token verification failed: invalid signature
// or
[Auth Middleware] Token verification failed: jwt expired
```

## Solutions by Case

### Solution A: Headers Not Reaching Backend

**Option 1 - Check CORS:**
In `forumverse-backend/index.ts`, ensure CORS allows headers:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'], // ← Add this
}));
```

**Option 2 - Check if another middleware is interfering**

### Solution B: Token Extraction Failing

Check if the Authorization header format is correct.
Should be: `Bearer eyJhbGci...` (note the space after "Bearer")

### Solution C: JWT Verification Failing

1. **Check JWT_SECRET:**
   ```bash
   # In forumverse-backend directory
   cat .env | grep JWT_SECRET
   ```
   Make sure it's set and not empty

2. **Check token expiration:**
   Look at the auth controller where tokens are created.
   Maybe tokens expire too quickly?

3. **Re-login:**
   Sometimes old tokens get corrupted. Try:
   - Log out
   - Clear localStorage: `localStorage.clear()`
   - Log back in
   - Try again

## Quick Manual Test

If you want to quickly test if your token is valid:

1. **Get your token:**
   ```javascript
   // In browser console
   const token = localStorage.getItem('token');
   console.log(token);
   ```

2. **Test it directly:**
   ```bash
   # In terminal (replace TOKEN with your actual token)
   curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/notifications
   ```

   If this works → Frontend issue
   If this fails → Backend/token issue

## Nuclear Option

If nothing works, try regenerating tokens:

1. **Backend:** Change JWT_SECRET in .env:
   ```bash
   # In .env file
   JWT_SECRET=your_new_super_secret_key_here_make_it_long_and_random
   ```

2. **Restart backend**

3. **Frontend:** Log out and log back in
   - This generates a new token with the new secret

4. **Try notifications again**

## Common Pitfalls

❌ **Backend not restarted** after changing .env  
❌ **Frontend not refreshed** after code changes  
❌ **Multiple tabs** with different auth states  
❌ **JWT_SECRET empty** or has special characters causing issues  
❌ **Token expired** and user never logged out/in again  

## Still Not Working?

Share the EXACT output from:

1. **Browser console** (the [Axios] Token Info log)
2. **Backend terminal** (the [Auth Middleware] Debug log)
3. **Browser Network tab** → Headers → Request Headers

This will tell us exactly where the problem is!

