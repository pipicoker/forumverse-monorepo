# Notification System - Debugging 401 Errors

## What We've Added

### 1. Enhanced Authentication Checks
- All notification operations now verify the token exists in localStorage
- Added `isProperlyAuthenticated()` helper function

### 2. Debug Logging
- Axios interceptor now logs when token is missing for notification requests
- Look for `[Axios] No token found in localStorage` messages in console

### 3. User-Friendly Error Messages
- Toast notifications when authentication fails
- Clear messages about what went wrong

## How to Debug

### Step 1: Open Browser Console
Press `F12` or right-click → Inspect → Console tab

### Step 2: Look for These Messages

**If you see:**
```
[Axios] No token found in localStorage for request to: /notifications/xxx
```
**Meaning:** The token is not in localStorage when the request is made
**Solution:** This is a timing issue. The 100ms delay should fix it, but you may need to increase it.

**If you don't see that warning but still get 401:**
**Meaning:** Token exists but backend is rejecting it
**Possible causes:**
- Token has expired
- Token format is incorrect
- Backend authentication middleware issue

### Step 3: Check localStorage
In the console, type:
```javascript
localStorage.getItem('token')
```

**If it returns `null`:**
- Token is not being saved during login
- Check AuthContext login function

**If it returns a token string:**
- Token exists, so the issue is with the backend validating it

### Step 4: Check Login Flow

1. **Open Console** before logging in
2. **Clear localStorage**:
   ```javascript
   localStorage.clear()
   ```
3. **Log in** to the application
4. **Check if token was saved**:
   ```javascript
   localStorage.getItem('token')
   ```
5. **Wait 2 seconds** then click the notification bell
6. **Try interacting** with a notification (mark as read or delete)

### Step 5: Check Backend Logs

In your backend terminal, you should see:
```
🟢 New client connected: <socket-id>
User <userId> joined their notification room
```

If you don't see this, Socket.IO connection may have failed.

## Common Issues & Solutions

### Issue 1: Token Not in localStorage After Login

**Symptom:** Console warning appears about missing token

**Check:**
```javascript
// In browser console after login
localStorage.getItem('token')  // Should return a JWT token
```

**Solution:**
- Verify AuthContext `login()` function saves token
- Check if another part of code clears localStorage

### Issue 2: Token Exists But Still 401

**Symptom:** No console warning, but still get 401 errors

**Check Backend:**
1. Is the backend authentication middleware working?
2. Is the JWT_SECRET env variable set correctly?
3. Are tokens expiring too quickly?

**Check Token Format:**
```javascript
// In browser console
const token = localStorage.getItem('token')
console.log('Token:', token)
console.log('Token length:', token?.length)
console.log('Token starts with:', token?.substring(0, 20))
```

JWT tokens should start with something like: `eyJhbGciOiJIUzI1NiIs...`

### Issue 3: Notifications Load But Can't Interact

**Symptom:** Can see notifications, but mark as read/delete fails with 401

**This is the original issue!**

**Cause:** Token might be missing when these specific requests are made

**Solution:** We've added:
- Authentication checks before making requests
- Better error handling
- Toast notifications to inform user

**To test the fix:**
1. Refresh the page (F5)
2. Log out and log back in
3. Wait for notifications to load
4. Try marking one as read
5. Check console for any warnings

## Testing After Fix

1. **Clear browser cache and localStorage**
2. **Close all browser tabs with the app**
3. **Open a fresh tab**
4. **Log in**
5. **Wait for notifications to appear**
6. **Try these actions:**
   - Click notification (should navigate to post)
   - Click checkmark (should mark as read)
   - Click trash (should delete)
   - Click "Mark all read"

## Expected Behavior After Fix

✅ No more 401 errors in console  
✅ If auth fails, user sees friendly toast message  
✅ Operations work smoothly  
✅ No console warnings about missing tokens  

## If Still Getting Errors

### Try These Steps:

1. **Increase the delay in NotificationContext:**
   ```typescript
   // Change from 100ms to 500ms
   setTimeout(() => {
     fetchNotifications();
   }, 500);
   ```

2. **Add more logging:**
   ```typescript
   // In NotificationContext markAsRead:
   console.log('Token check:', {
     isAuthenticated,
     hasToken: !!localStorage.getItem('token'),
     user: user?.id
   });
   ```

3. **Check axios headers manually:**
   ```typescript
   // In NotificationContext, before axios call:
   const token = localStorage.getItem('token');
   console.log('About to make request with token:', token ? 'EXISTS' : 'MISSING');
   ```

## Contact Points

If you're still experiencing issues after trying all the above:

1. Check `forumverse-backend` logs for authentication errors
2. Verify JWT_SECRET is set in backend `.env` file  
3. Check if token expiration time is too short
4. Verify Prisma database connection is working
5. Check if there are any CORS issues

## Quick Recovery

If nothing works, try the "nuclear option":

1. **Backend:**
   ```bash
   cd forumverse-backend
   rm -rf node_modules
   npm install
   npx prisma generate
   npm run dev
   ```

2. **Frontend:**
   ```bash
   cd forumverse-frontend
   rm -rf node_modules
   npm install
   npm run dev
   ```

3. **Browser:**
   - Clear all cookies and cache
   - Close all tabs
   - Restart browser
   - Try again

