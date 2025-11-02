# Supabase Setup Guide for StudyFlow

This guide will walk you through setting up your Supabase project for StudyFlow from scratch.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com) - it's free!)
- Your StudyFlow project code

## Step 1: Create a New Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the details:
   - **Name**: `studyflow` (or any name you prefer)
   - **Database Password**: Create a strong password and **save it somewhere safe**
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Free tier is perfect to start
4. Click "Create new project"
5. Wait 2-3 minutes for your project to be provisioned

## Step 2: Get Your API Credentials

1. In your Supabase dashboard, click on the **Settings** icon (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)
4. **Keep this page open** - you'll need these values soon!

## Step 3: Run Database Migrations

Your StudyFlow database schema is defined in 7 migration files. You need to run these in order.

### Option A: Using Supabase SQL Editor (Easiest for beginners)

1. In your Supabase dashboard, click **SQL Editor** in the sidebar
2. Click "New query"
3. For each migration file below, **copy the entire contents** and paste into the SQL Editor, then click "Run":

   **Migration 1**: `supabase/migrations/20251014173024_create_study_flow_schema.sql`
   - Creates core tables: profiles, study_rooms, room_participants, chat_messages, achievements, user_achievements, study_sessions

   **Migration 2**: `supabase/migrations/20251015133723_add_user_settings_and_enhanced_features.sql`
   - Adds user_settings table and default achievements

   **Migration 3**: `supabase/migrations/20251015135147_add_ai_students_and_cleanup_triggers.sql`
   - Adds ai_students table and cleanup triggers

   **Migration 4**: `supabase/migrations/20251015140436_complete_room_lifecycle_system.sql`
   - Adds room lifecycle functions (create_room_with_join, leave_room_cleanup, etc.)

   **Migration 5**: `supabase/migrations/20251015141051_fix_room_stats_duplicate_key.sql`
   - Fixes room statistics tracking

   **Migration 6**: `supabase/migrations/20251015142359_fix_join_room_duplicate_participant.sql`
   - Fixes duplicate participant prevention

   **Migration 7**: `supabase/migrations/20251019134820_add_social_auth_profile_trigger.sql`
   - Adds automatic profile creation for OAuth users

### Option B: Using Supabase CLI (For advanced users)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```

## Step 4: Verify Database Setup

1. Click **Table Editor** in the Supabase sidebar
2. You should see these tables:
   - ✅ profiles
   - ✅ study_rooms
   - ✅ room_participants
   - ✅ chat_messages
   - ✅ achievements
   - ✅ user_achievements
   - ✅ study_sessions
   - ✅ user_settings
   - ✅ ai_students

3. Click on the **achievements** table
4. You should see 10 default achievements already inserted

If you see all these tables, congratulations! Your database is set up correctly.

## Step 5: Configure Authentication

### Enable Email/Password Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. **Email** should be enabled by default
3. Scroll down and **disable** "Confirm email" if you want to test without email verification (you can enable this later)

### Enable Google OAuth (Recommended)

1. Go to **Authentication** → **Providers**
2. Click **Google**
3. Toggle "Enable Sign in with Google"
4. You'll need to create a Google OAuth app:

   **Create Google OAuth App:**
   1. Go to [Google Cloud Console](https://console.cloud.google.com/)
   2. Create a new project or select an existing one
   3. Go to **APIs & Services** → **Credentials**
   4. Click **Create Credentials** → **OAuth client ID**
   5. Choose **Web application**
   6. Add authorized redirect URIs:
      - `https://your-project-id.supabase.co/auth/v1/callback`
      - `http://localhost:5173/` (for local development)
   7. Copy the **Client ID** and **Client Secret**
   8. Paste them into your Supabase Google provider settings
   9. Click **Save**

### Enable GitHub OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Click **GitHub**
3. Toggle "Enable Sign in with GitHub"
4. Create a GitHub OAuth app:
   1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
   2. Click "New OAuth App"
   3. Fill in:
      - Application name: `StudyFlow`
      - Homepage URL: `https://studyflow.vercel.app` (or your domain)
      - Authorization callback URL: `https://your-project-id.supabase.co/auth/v1/callback`
   4. Copy the **Client ID** and generate a **Client Secret**
   5. Paste them into Supabase
   6. Click **Save**

### Enable Discord OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Click **Discord**
3. Toggle "Enable Sign in with Discord"
4. Create a Discord OAuth app:
   1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
   2. Click "New Application"
   3. Go to **OAuth2** in the sidebar
   4. Copy the **Client ID** and **Client Secret**
   5. Add redirect: `https://your-project-id.supabase.co/auth/v1/callback`
   6. Paste credentials into Supabase
   7. Click **Save**

## Step 6: Deploy Edge Functions (For AI Features)

StudyFlow has 3 Edge Functions for AI study buddies and cleanup tasks.

### Deploy Edge Functions

```bash
# Navigate to your project directory
cd /path/to/studyflow

# Deploy all functions
supabase functions deploy ai-student-messages
supabase functions deploy cleanup-empty-rooms
supabase functions deploy cleanup-stale-participants
```

### Set Environment Variables for Functions

```bash
# Set Supabase URL and Service Role Key (automatically available in functions)
# These are set automatically by Supabase
```

**Note**: If you want to skip AI features for now, you can deploy the app without Edge Functions. The app will work fine, just without AI study buddies.

## Step 7: Configure Row Level Security (RLS)

Good news! All RLS policies are included in the migrations. To verify:

1. Go to **Authentication** → **Policies** in Supabase
2. Each table should have policies like:
   - `profiles`: "Users can view all profiles" (SELECT)
   - `profiles`: "Users can update own profile" (UPDATE)
   - `study_rooms`: "Anyone can view rooms" (SELECT)
   - `chat_messages`: "Room participants can read messages" (SELECT)
   - etc.

If you see these policies, you're all set!

## Step 8: Create Your .env File

Now that you have your Supabase credentials, create a `.env` file in your project root:

1. Copy the `.env.example` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_APP_URL=http://localhost:5173
   ```

3. Replace `your-project-id` and `your-anon-key-here` with the values from Step 2

## Step 9: Test Locally

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Test These Features:

1. ✅ Sign up with email/password
2. ✅ Sign in with Google (if you configured it)
3. ✅ Create a study room
4. ✅ Join a room
5. ✅ Send a chat message
6. ✅ Start the Pomodoro timer
7. ✅ View your profile

If everything works, you're ready to deploy!

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env` file has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Make sure you copied the **anon/public** key, not the service role key

### "Row Level Security policy violation" error
- Run all 7 migrations in order
- Check that RLS policies exist in Supabase dashboard

### OAuth redirect errors
- Make sure your redirect URIs in Google/GitHub/Discord match exactly
- Format: `https://your-project-id.supabase.co/auth/v1/callback`

### Can't create a room
- Check browser console for errors
- Verify the `create_room_with_join` function exists (Migration 4)

### AI students not appearing
- Make sure you deployed the Edge Functions
- Check Supabase Functions logs for errors

## Next Steps

Once everything works locally, you're ready to deploy to production!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- Check the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) guide
