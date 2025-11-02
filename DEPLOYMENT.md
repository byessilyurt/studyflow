# Deployment Guide for StudyFlow

This guide will help you deploy StudyFlow to production using Vercel (free tier available).

## Prerequisites

Before deploying, make sure you've completed:

- ✅ [Supabase Setup](./SUPABASE_SETUP.md) - Database and authentication configured
- ✅ Local testing successful - App works on `http://localhost:5173`
- ✅ GitHub account - To connect your repository to Vercel

## Deployment Options

We recommend **Vercel** for StudyFlow because:
- ✅ Free tier available (perfect for getting started)
- ✅ Automatic deployments from Git
- ✅ Built-in SSL certificates
- ✅ Global CDN for fast loading
- ✅ Easy environment variable management
- ✅ Native support for Vite/React SPAs

**Alternative platforms**: Netlify, Render, Railway, Cloudflare Pages

---

## Method 1: Deploy to Vercel (Recommended - Easiest)

### Step 1: Push Your Code to GitHub

If you haven't already pushed your code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/studyflow.git
git branch -M main
git push -u origin main
```

### Step 2: Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub" (easiest option)
4. Authorize Vercel to access your GitHub account

### Step 3: Import Your Project

1. On the Vercel dashboard, click **"Add New Project"**
2. Click **"Import Git Repository"**
3. Find your `studyflow` repository and click **"Import"**

### Step 4: Configure Build Settings

Vercel should auto-detect your Vite project. Verify these settings:

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

If these aren't set, update them manually.

### Step 5: Add Environment Variables

**IMPORTANT**: Before deploying, you need to add your Supabase credentials.

1. In the project configuration screen, scroll to **"Environment Variables"**
2. Add the following variables:

   | Name | Value | Where to find it |
   |------|-------|------------------|
   | `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Dashboard → Settings → API |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` (long string) | Supabase Dashboard → Settings → API |
   | `VITE_APP_URL` | `https://studyflow.vercel.app` | Will be generated after first deploy |

3. For now, set `VITE_APP_URL` to a placeholder like `https://studyflow.vercel.app`
4. Click **"Deploy"**

### Step 6: Wait for Deployment

Vercel will now:
1. Install dependencies
2. Build your project
3. Deploy to their global CDN

This usually takes 1-2 minutes. ☕

### Step 7: Update Your App URL

1. Once deployed, Vercel will show you your live URL (e.g., `https://studyflow-abc123.vercel.app`)
2. Go to **Settings** → **Environment Variables** in Vercel
3. Edit `VITE_APP_URL` and set it to your actual Vercel URL
4. Redeploy to apply changes:
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment
   - Click **"Redeploy"**

### Step 8: Update OAuth Redirect URLs

For Google/GitHub/Discord OAuth to work in production:

#### Update Supabase OAuth Settings

1. Go to your Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Redirect URLs**:
   - `https://your-app.vercel.app/**`

#### Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth credentials
3. Add to **Authorized redirect URIs**:
   - `https://your-project-id.supabase.co/auth/v1/callback`
   - `https://your-app.vercel.app/` (your Vercel URL)

#### Update GitHub OAuth (if enabled)

1. Go to your [GitHub OAuth App settings](https://github.com/settings/developers)
2. Update **Authorization callback URL** to:
   - `https://your-project-id.supabase.co/auth/v1/callback`

#### Update Discord OAuth (if enabled)

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Add redirect:
   - `https://your-project-id.supabase.co/auth/v1/callback`

### Step 9: Test Your Deployment

Visit your Vercel URL and test:

1. ✅ Sign up with email/password
2. ✅ Sign in with Google OAuth
3. ✅ Create a study room
4. ✅ Join a room
5. ✅ Start Pomodoro timer
6. ✅ Send chat messages
7. ✅ View your profile

If everything works, congratulations! 🎉 Your app is live!

---

## Method 2: Deploy to Netlify (Alternative)

### Step 1: Sign Up for Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub

### Step 2: Create New Site

1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **GitHub**
3. Select your `studyflow` repository

### Step 3: Configure Build Settings

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Base directory**: (leave empty)

### Step 4: Add Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL`

### Step 5: Deploy

Click **"Deploy site"** and wait for the build to complete.

### Step 6: Configure Redirects

Create a `public/_redirects` file in your project:

```
/*    /index.html   200
```

This ensures client-side routing works correctly.

Commit and push this change to trigger a new deployment.

---

## Using a Custom Domain (Optional)

### On Vercel

1. Go to your project **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `studyflow.com`)
4. Follow instructions to:
   - Add DNS records (A or CNAME)
   - Vercel will automatically provision SSL

### On Netlify

1. Go to **Domain settings** → **Custom domains**
2. Click **"Add custom domain"**
3. Follow instructions to configure DNS

### Update Environment Variables

After adding a custom domain:

1. Update `VITE_APP_URL` to your custom domain
2. Update OAuth redirect URLs in Google/GitHub/Discord
3. Redeploy

---

## Continuous Deployment

Both Vercel and Netlify automatically deploy when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push

# Deployment happens automatically!
```

You'll receive an email when deployment is complete.

---

## Monitoring Your App

### Vercel Analytics (Free)

1. Go to your project dashboard on Vercel
2. Click **Analytics** tab
3. View real-time traffic, page views, and performance

### Supabase Dashboard

Monitor your database:

1. **Table Editor** - View data in real-time
2. **SQL Editor** - Run queries
3. **Logs** - View authentication and function logs
4. **Reports** - See API usage and performance

### Check Logs

**Vercel Logs:**
- Project → **Deployments** → Click deployment → **Function Logs**

**Supabase Logs:**
- Dashboard → **Logs** → Filter by type (Auth, Functions, etc.)

---

## Production Checklist

Before going fully live, make sure:

### Security
- [ ] RLS policies enabled on all Supabase tables
- [ ] Environment variables set correctly
- [ ] OAuth credentials configured for production URLs
- [ ] HTTPS enabled (automatic with Vercel/Netlify)
- [ ] No sensitive data in client-side code

### Performance
- [ ] Build completes without warnings
- [ ] Bundle size is reasonable (<1MB for main chunk)
- [ ] Images are optimized
- [ ] No console.logs in production (removed by Vite config)

### Functionality
- [ ] All authentication methods work
- [ ] Users can create/join rooms
- [ ] Pomodoro timer functions correctly
- [ ] Chat messages send/receive
- [ ] Profile updates work
- [ ] Achievements are awarded

### User Experience
- [ ] App loads in <3 seconds
- [ ] Mobile responsive
- [ ] No 404 errors
- [ ] Error messages are user-friendly

### Database
- [ ] All migrations applied
- [ ] Default achievements seeded
- [ ] Edge Functions deployed (if using AI features)

---

## Scaling Considerations

### Free Tier Limits

**Vercel Free Tier:**
- ✅ Unlimited personal projects
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL
- ⚠️ No commercial use (upgrade to Pro for $20/month)

**Supabase Free Tier:**
- ✅ 500MB database storage
- ✅ 1GB file storage
- ✅ 2GB bandwidth/month
- ✅ 50,000 monthly active users
- ⚠️ Projects pause after 1 week of inactivity (upgrade to Pro for $25/month)

### When to Upgrade

Upgrade when you exceed:
- 10,000+ monthly active users
- 500MB database size
- Need guaranteed uptime (99.9% SLA)

---

## Rollback Deployment

If something goes wrong:

### On Vercel

1. Go to **Deployments** tab
2. Find a previous working deployment
3. Click **"..."** → **"Promote to Production"**

### On Netlify

1. Go to **Deploys** tab
2. Find a previous deployment
3. Click **"Publish deploy"**

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module 'vite'"**
```bash
# Solution: Make sure dependencies are installed
npm install
```

**Error: TypeScript errors during build**
```bash
# Solution: Fix TypeScript errors or temporarily bypass
npm run build -- --mode production --skipTypeCheck
```

### Environment Variables Not Working

- ✅ Make sure variable names start with `VITE_`
- ✅ Redeploy after adding/changing variables
- ✅ Check for typos in variable names

### OAuth Redirect Errors

- ✅ Verify redirect URLs match exactly in OAuth provider
- ✅ Make sure `VITE_APP_URL` is set to your actual domain
- ✅ Check Supabase redirect URL configuration

### "Failed to fetch" Errors

- ✅ Check `VITE_SUPABASE_URL` is correct
- ✅ Verify Supabase project is not paused
- ✅ Check browser console for CORS errors

### Blank Page After Deployment

- ✅ Check browser console for errors
- ✅ Verify all environment variables are set
- ✅ Check build logs for warnings

For more troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## Post-Deployment Tasks

### 1. Set Up Error Monitoring (Optional)

Consider adding [Sentry](https://sentry.io) for error tracking:

```bash
npm install @sentry/react
```

### 2. Add Analytics (Optional)

- Google Analytics
- Plausible (privacy-friendly)
- Vercel Analytics (built-in)

### 3. Set Up Status Monitoring

Use [UptimeRobot](https://uptimerobot.com) (free) to monitor if your site is up.

### 4. Create Backups

Supabase Pro includes automated backups. On free tier:
- Export data regularly using Supabase dashboard
- Use `supabase db dump` command

---

## Need Help?

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- Open an issue on GitHub

---

**Congratulations on deploying StudyFlow! 🚀**

Your app is now live and ready for users to enjoy collaborative studying!
