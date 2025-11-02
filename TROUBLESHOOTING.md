# StudyFlow Troubleshooting Guide

Common issues and their solutions. Use `Ctrl+F` (or `Cmd+F` on Mac) to search for your specific error.

## Table of Contents

1. [Installation & Setup Issues](#installation--setup-issues)
2. [Authentication Errors](#authentication-errors)
3. [Database & Supabase Issues](#database--supabase-issues)
4. [Room & Timer Issues](#room--timer-issues)
5. [Deployment Issues](#deployment-issues)
6. [Performance Issues](#performance-issues)

---

## Installation & Setup Issues

### Error: "Cannot find module 'vite'"

**Symptoms:** App won't start, error about missing vite module

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 5173 is already in use"

**Symptoms:** Can't start dev server

**Solution:**
```bash
# Option 1: Kill the process using the port
lsof -ti:5173 | xargs kill -9

# Option 2: Use a different port
npm run dev -- --port 3000
```

### TypeScript Errors on Fresh Install

**Symptoms:** Red squiggly lines everywhere in VS Code

**Solution:**
```bash
# Reload VS Code TypeScript server
# In VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Or ensure you have TypeScript installed
npm install --save-dev typescript
```

### `.env` File Not Working

**Symptoms:** "Invalid API key" or environment variables undefined

**Solution:**
1. Make sure your `.env` file is in the **root directory** (same level as `package.json`)
2. Variables must start with `VITE_` for Vite to expose them
3. Restart the dev server after changing `.env`
4. Check for typos in variable names

```bash
# Correct
VITE_SUPABASE_URL=https://xxx.supabase.co

# Wrong (missing VITE_ prefix)
SUPABASE_URL=https://xxx.supabase.co
```

---

## Authentication Errors

### Error: "Invalid API key" or "Invalid JWT"

**Symptoms:** Can't sign up/in, authentication fails immediately

**Causes & Solutions:**

**Cause 1: Wrong API Key**
- Go to Supabase Dashboard → Settings → API
- Copy the **anon/public** key (not service role key)
- Update `VITE_SUPABASE_ANON_KEY` in `.env`
- Restart dev server

**Cause 2: Wrong Project URL**
- Verify `VITE_SUPABASE_URL` matches your Supabase project URL
- Format: `https://xxxxxxxxxxxxx.supabase.co`

**Cause 3: Supabase Project Paused**
- Free tier projects pause after 1 week of inactivity
- Go to Supabase dashboard and unpause your project

### OAuth "Redirect URI Mismatch" Error

**Symptoms:** After clicking "Sign in with Google/GitHub/Discord", you get a redirect error

**Solution:**

**For Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth credentials
3. Under "Authorized redirect URIs", add:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   http://localhost:5173/
   ```
4. Click Save
5. Wait 5 minutes for changes to propagate

**For GitHub OAuth:**
1. Go to [GitHub OAuth Apps](https://github.com/settings/developers)
2. Edit your app
3. Set "Authorization callback URL" to:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```

**For Discord OAuth:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. OAuth2 → Redirects
3. Add:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```

### User Can Sign Up But Not Sign In

**Symptoms:** Sign up works, but sign in fails with "Invalid credentials"

**Possible Causes:**

**Cause 1: Email Confirmation Required**
- Go to Supabase → Authentication → Providers → Email
- Disable "Confirm email" for testing
- Or check user's email for confirmation link

**Cause 2: Wrong Password**
- Passwords are case-sensitive
- Try "Forgot Password" flow

**Cause 3: User Not in Database**
- Check Supabase → Table Editor → profiles
- If user exists in auth.users but not in profiles table:
  - Make sure migration `20251019134820_add_social_auth_profile_trigger.sql` was run
  - Manually create profile or sign up again

### Error: "Profile not found" After OAuth Login

**Symptoms:** OAuth login succeeds but app shows "Profile not found"

**Solution:**
- This means the automatic profile creation trigger isn't working
- Check that migration `20251019134820_add_social_auth_profile_trigger.sql` was applied
- Run this SQL manually in Supabase SQL Editor:

```sql
-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- If missing, run the migration file
```

---

## Database & Supabase Issues

### Error: "relation 'profiles' does not exist"

**Symptoms:** Database errors, tables not found

**Solution:**
- You haven't run the migrations
- Go to Supabase → SQL Editor
- Run all migration files in order (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))

### Error: "Row Level Security policy violation"

**Symptoms:** "new row violates row-level security policy" or "permission denied"

**Possible Causes:**

**Cause 1: RLS Policies Not Applied**
- Make sure all 7 migrations were run
- Check Supabase → Authentication → Policies
- Each table should have policies

**Cause 2: Not Authenticated**
- User must be logged in to perform action
- Check `supabase.auth.getUser()` returns a user

**Cause 3: Wrong User**
- Some actions (like updating profiles) require the user to own the resource
- Check RLS policy conditions

**Debug RLS Issues:**
```sql
-- In Supabase SQL Editor, temporarily disable RLS to test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Test your operation
-- If it works, the issue is with RLS policies

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Real-time Subscriptions Not Working

**Symptoms:** Chat messages don't appear immediately, room updates don't sync

**Solution:**

**Check 1: Replication Enabled**
1. Go to Supabase → Database → Replication
2. Make sure these tables have replication enabled:
   - `chat_messages`
   - `study_rooms`
   - `room_participants`

**Check 2: Browser Console Errors**
- Open DevTools → Console
- Look for WebSocket connection errors
- Common issue: Supabase project paused

**Check 3: Subscription Code**
```typescript
// Make sure you're cleaning up subscriptions
useEffect(() => {
  const subscription = supabase
    .channel('room-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'study_rooms'
    }, handleChange)
    .subscribe();

  return () => {
    subscription.unsubscribe(); // Important!
  };
}, []);
```

### "Too many requests" Error

**Symptoms:** API calls failing with 429 status code

**Solution:**
- Supabase free tier has rate limits
- Check if you're making too many requests in a loop
- Add debouncing/throttling to frequent operations
- Consider upgrading to Supabase Pro

---

## Room & Timer Issues

### Can't Create a Room

**Symptoms:** Click "Create Room" but nothing happens or error appears

**Debug Steps:**

1. **Check Browser Console**
   ```
   Right-click → Inspect → Console tab
   Look for error messages
   ```

2. **Verify Database Function Exists**
   - Go to Supabase → Database → Functions
   - Check for `create_room_with_join` function
   - If missing, run migration `20251015140436_complete_room_lifecycle_system.sql`

3. **Check User Authentication**
   ```typescript
   // In browser console
   const { data: { user } } = await supabase.auth.getUser();
   console.log(user); // Should show user object, not null
   ```

### Timer Doesn't Sync Across Users

**Symptoms:** Timer shows different times for different users in same room

**Expected Behavior:** This is partially expected due to client-side timers

**Solution:**
- Timers sync when users join/leave room
- For better sync, implement server-side timer (requires Edge Function)

**Workaround:**
- Refresh the page to resync timer
- Make sure `subscribeToRoom` is working (check real-time subscriptions)

### Can't Leave a Room

**Symptoms:** Click "Leave Room" but still in the room

**Debug:**

1. Check if `leave_room_cleanup` function exists in Supabase
2. Check browser console for errors
3. Try manual leave:
   ```typescript
   await roomService.leaveAllRooms(userId);
   ```

### Participants Not Showing Up

**Symptoms:** Room shows 0 participants or doesn't show all users

**Solutions:**

**Solution 1: Clear Stale Participants**
```sql
-- In Supabase SQL Editor
SELECT cleanup_stale_participants();
```

**Solution 2: Check Heartbeat**
- Presence heartbeat runs every 30 seconds
- Make sure `useRoomPresence` hook is active
- Check if Beacon API is supported (not in old browsers)

---

## Deployment Issues

### Blank Page After Deployment

**Symptoms:** App works locally but shows blank page on Vercel/Netlify

**Common Causes:**

**Cause 1: Environment Variables Missing**
- Go to Vercel/Netlify dashboard → Settings → Environment Variables
- Add all `VITE_*` variables
- Redeploy after adding variables

**Cause 2: Build Errors**
- Check Vercel/Netlify build logs
- Look for TypeScript errors or missing dependencies

**Cause 3: Routing Issue**
- For Vercel: Make sure `vercel.json` exists with rewrites
- For Netlify: Create `public/_redirects` file:
  ```
  /*    /index.html   200
  ```

### "Failed to fetch" in Production

**Symptoms:** API calls work locally but fail in production

**Solution:**

**Check 1: CORS Configuration**
- Supabase allows all origins by default
- If you restricted CORS, add your Vercel domain

**Check 2: Environment Variables**
- `VITE_SUPABASE_URL` must be the HTTPS URL
- No trailing slashes

**Check 3: Supabase Project Active**
- Free tier projects pause after inactivity
- Unpause in Supabase dashboard

### Build Fails on Vercel

**Error: "Build exceeded maximum duration"**

**Solution:**
```bash
# In package.json, simplify build
"build": "vite build"

# Remove TypeScript checking from build (check locally instead)
```

**Error: "Out of memory"**

**Solution:**
```bash
# Increase Node memory limit
"build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
```

### OAuth Works Locally But Not in Production

**Symptoms:** OAuth login fails only on deployed site

**Solution:**

1. **Update OAuth Redirect URLs**
   - Add your production URL to OAuth provider settings
   - Format: `https://studyflow.vercel.app/`

2. **Update Supabase Redirect Configuration**
   - Supabase → Authentication → URL Configuration
   - Add production URL to allowed redirect URLs

3. **Check VITE_APP_URL**
   - Must match your actual production domain
   - Redeploy after changing

---

## Performance Issues

### App Loads Slowly

**Symptoms:** Initial page load takes >5 seconds

**Solutions:**

**Solution 1: Check Bundle Size**
```bash
npm run build

# Check dist/ folder size
du -sh dist/

# Should be <2MB total
```

**Solution 2: Lazy Load Components**
```typescript
// Instead of:
import RoomPage from './pages/RoomPage';

// Use:
const RoomPage = React.lazy(() => import('./pages/RoomPage'));
```

**Solution 3: Optimize Images**
- Use WebP format
- Compress images before uploading
- Use appropriate sizes (don't serve 4K images for thumbnails)

### Memory Leaks / App Gets Slower Over Time

**Symptoms:** App slows down after being open for a while

**Common Causes:**

**Cause 1: Subscription Leaks**
```typescript
// Bad - subscription never cleaned up
useEffect(() => {
  const sub = supabase.channel('messages').subscribe();
  // Missing cleanup!
}, []);

// Good - subscription cleaned up
useEffect(() => {
  const sub = supabase.channel('messages').subscribe();
  return () => sub.unsubscribe(); // ✅
}, []);
```

**Cause 2: Interval Leaks**
```typescript
// Bad
useEffect(() => {
  setInterval(() => updateTimer(), 1000);
  // Missing cleanup!
}, []);

// Good
useEffect(() => {
  const interval = setInterval(() => updateTimer(), 1000);
  return () => clearInterval(interval); // ✅
}, []);
```

### Database Queries Are Slow

**Symptoms:** Room list or chat takes >3 seconds to load

**Solutions:**

**Solution 1: Add Indexes**
```sql
-- In Supabase SQL Editor
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_room_participants_user_id ON room_participants(user_id);
```

**Solution 2: Limit Results**
```typescript
// Don't fetch all messages
const { data } = await supabase
  .from('chat_messages')
  .select('*')
  .eq('room_id', roomId)
  .order('created_at', { ascending: false })
  .limit(50); // Only get latest 50
```

**Solution 3: Use Caching**
```typescript
// Cache room list for 30 seconds
const [rooms, setRooms] = useState([]);
const [cacheTime, setCacheTime] = useState(0);

const fetchRooms = async () => {
  const now = Date.now();
  if (now - cacheTime < 30000) return; // Use cache

  const { data } = await roomService.getAllRooms();
  setRooms(data);
  setCacheTime(now);
};
```

---

## Still Having Issues?

### Where to Get Help

1. **Check Browser Console**
   - Right-click → Inspect → Console
   - Look for red error messages
   - Copy the full error when asking for help

2. **Check Supabase Logs**
   - Supabase Dashboard → Logs
   - Filter by Error level
   - Check timestamp matching your issue

3. **Enable Debug Mode**
   ```typescript
   // Add to src/lib/supabase.ts temporarily
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
   ```

4. **Test in Incognito Mode**
   - Rules out browser extension issues
   - Fresh session without cached data

5. **Check Service Status**
   - [Supabase Status](https://status.supabase.com/)
   - [Vercel Status](https://www.vercel-status.com/)

### Getting Support

**Before asking for help, gather:**
- Error message (exact text)
- Browser console screenshot
- Steps to reproduce
- Environment (local dev vs production)
- Browser version

**Where to ask:**
- [Supabase Discord](https://discord.supabase.com)
- [Vercel Discord](https://vercel.com/discord)
- Create GitHub issue in your repository

---

## Common Error Messages Decoded

| Error Message | What It Means | Quick Fix |
|--------------|---------------|-----------|
| `Invalid API key` | Wrong Supabase credentials | Check `.env` file |
| `Failed to fetch` | Network/CORS issue | Check Supabase URL, internet connection |
| `row-level security policy` | Permission denied | Check RLS policies, user authentication |
| `relation does not exist` | Table missing | Run database migrations |
| `Invalid JWT` | Auth token expired | Sign out and sign in again |
| `duplicate key value` | Trying to insert duplicate | Check unique constraints |
| `violates foreign key constraint` | Referenced record doesn't exist | Check parent record exists |
| `null value in column` | Required field missing | Pass all required fields |

---

**Still stuck? Create a GitHub issue with:**
1. Full error message
2. What you were trying to do
3. Steps to reproduce
4. Screenshots if applicable
