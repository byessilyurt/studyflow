# Authentication System Fix - Complete Guide

## What Was Broken

Your authentication system had 3 critical issues preventing signup and login:

1. **Missing Email Column** - The profiles table was missing the email column but the OAuth trigger tried to insert into it
2. **OAuth Trigger Failure** - Social auth (Google/GitHub/Discord) failed at database level
3. **Incomplete Profile Creation** - Email/password signup didn't store email in profiles

## How to Fix

### Step 1: Run the Database Fix

**In Supabase SQL Editor**, run the `FIX_AUTH.sql` file:

```sql
-- This script does:
-- 1. Adds email column to profiles table
-- 2. Backfills existing profiles with email from auth.users
-- 3. Fixes the OAuth trigger
-- 4. Creates a universal trigger for ALL auth signups
```

**Important**: This replaces the old `on_oauth_user_created` trigger with `on_all_user_created` which handles BOTH email/password AND OAuth signups.

### Step 2: Verify the Fix

Run these queries in Supabase SQL Editor:

```sql
-- Check email column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'email';

-- Check trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_all_user_created';

-- Check if any existing users need email backfill
SELECT COUNT(*) FROM profiles WHERE email IS NULL;
```

### Step 3: Test Authentication

1. **Test Email/Password Signup**:
   - Go to your app
   - Click signup
   - Enter name, email, password
   - Should successfully create account and log you in

2. **Test Social Auth (Google/GitHub/Discord)**:
   - Click social login button
   - Complete OAuth flow
   - Should create profile automatically and log you in

3. **Test Login**:
   - Log out
   - Log back in with email/password
   - Should work without issues

## What Changed in Code

### 1. [auth.ts](src/lib/auth.ts)
- Added `email` to profile insert in `signUp()`
- Added name to signup metadata for OAuth
- Added error handling for duplicate profile inserts

### 2. [AppContext.tsx](src/context/AppContext.tsx)
- Added 500ms delay to wait for trigger to create profile
- Added error messages when profile loading fails
- Better user feedback with alerts

### 3. Database Trigger
- New `handle_all_user_signup()` function handles ALL signup types
- Automatically creates profile for any new auth.users record
- Extracts metadata from OAuth providers
- Falls back to email username if no name provided

## Authentication Flow (After Fix)

### Email/Password Signup:
```
1. User fills signup form
2. authService.signUp() called
3. Supabase creates auth.users record
4. Database trigger fires → creates profile automatically
5. Client also tries to insert profile (as fallback)
6. AppContext loads profile after 500ms delay
7. User is logged in ✓
```

### OAuth Signup (Google/GitHub/Discord):
```
1. User clicks social button
2. OAuth flow completes
3. Supabase creates auth.users record with metadata
4. Database trigger fires → extracts name/avatar/email → creates profile
5. AppContext loads profile after 500ms delay
6. User is logged in ✓
```

### Login:
```
1. User enters credentials
2. authService.signIn() called
3. Supabase authenticates
4. AppContext loads existing profile
5. User is logged in ✓
```

## Troubleshooting

### Issue: "Profile not found" error after signup
**Solution**: Check that the database trigger is installed:
```sql
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_all_user_created';
```

### Issue: Email column doesn't exist error
**Solution**: Run the FIX_AUTH.sql script again

### Issue: OAuth still not working
**Solution**: Check Supabase dashboard → Authentication → Providers
- Ensure Google/GitHub/Discord are enabled
- Verify redirect URLs are correct
- Check OAuth client IDs and secrets are set

### Issue: Users created before fix don't have email
**Solution**: Run email backfill:
```sql
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;
```

## Migration Notes

If you want to update COMPLETE_MIGRATION.sql to include this fix:

The current COMPLETE_MIGRATION.sql already has:
- ✓ Email column in profiles table (line 14)
- ✓ OAuth trigger function (lines 732-775)

But you should update the trigger to the new universal one:
- Replace `handle_oauth_user_signup()` with `handle_all_user_signup()`
- Replace trigger name `on_oauth_user_created` with `on_all_user_created`

## Testing Checklist

- [ ] Run FIX_AUTH.sql in Supabase
- [ ] Verify email column exists
- [ ] Verify trigger exists
- [ ] Test email/password signup
- [ ] Test Google OAuth signup
- [ ] Test GitHub OAuth signup (if enabled)
- [ ] Test Discord OAuth signup (if enabled)
- [ ] Test email/password login
- [ ] Verify profile data loads correctly
- [ ] Check that email is stored in profiles table

## Support

If authentication still doesn't work after these fixes:

1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify RLS policies allow profile reads
4. Ensure Supabase environment variables are correct in .env
5. Clear browser cache and local storage
6. Try in incognito mode

## Security Notes

- ✓ Email is now stored in profiles for easy access
- ✓ RLS policies protect profile data
- ✓ Only authenticated users can read profiles
- ✓ Users can only modify their own profiles
- ✓ OAuth metadata is safely extracted and sanitized
- ✓ Database triggers use SECURITY DEFINER for proper permissions
