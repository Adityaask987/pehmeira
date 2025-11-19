# 🚀 Pehmeira - Complete Vercel Deployment Guide

**Version:** 2.0.0  
**Last Updated:** November 19, 2025  
**Application:** Pehmeira Luxury Fashion Styling Web App

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Prepare Your Codebase](#step-1-prepare-your-codebase)
3. [Push to GitHub](#step-2-push-to-github)
4. [Create Vercel Project](#step-3-create-vercel-project)
5. [Configure Environment Variables](#step-4-configure-environment-variables)
6. [Deploy](#step-5-deploy)
7. [Verify Deployment](#step-6-verify-deployment)
8. [Custom Domain Setup](#step-7-custom-domain-setup)
9. [Troubleshooting](#troubleshooting)
10. [Post-Deployment](#post-deployment)

---

## Prerequisites

Before starting deployment, ensure you have:

- ✅ **Pehmeira source code** downloaded and extracted
- ✅ **Vercel account** (free tier works - sign up at [vercel.com](https://vercel.com))
- ✅ **GitHub account** (for automatic deployments)
- ✅ **Git installed** on your computer
- ✅ **Node.js 18+** installed locally
- ✅ **All environment variable values** (provided in this guide)

---

## Step 1: Prepare Your Codebase

### A. Create `vercel.json` Configuration File

In your project root directory, create a new file called `vercel.json` with this exact content:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": null,
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/dist/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "functions": {
    "dist/index.js": {
      "runtime": "nodejs20.x",
      "memory": 1024,
      "maxDuration": 10,
      "includeFiles": "dist/**"
    }
  }
}
```

**What this configuration does:**
- Routes all `/api/*` requests to Express serverless function at `dist/index.js`
- Routes all other requests to React SPA (`index.html`)
- Configures Node.js 20 runtime with 1GB memory and 10s timeout
- Includes built frontend files for serving static assets

### B. Verify Build Script

Your `package.json` should already have this build script:

```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
  }
}
```

This builds:
1. **React frontend** → `dist/` folder (Vite)
2. **Express backend** → `dist/index.js` (esbuild serverless function)

---

## Step 2: Push to GitHub

### A. Initialize Git Repository

Open terminal in your project directory:

```bash
# Navigate to your project folder
cd pehmeira-main

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit for Vercel deployment"
```

### B. Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **"New repository"** (green button)
3. Repository name: `pehmeira` (or any name you prefer)
4. Keep it **Private** or **Public** (your choice)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### C. Push Code to GitHub

Copy the commands from GitHub's quick setup page, or use these:

```bash
# Add GitHub remote
git remote add origin https://github.com/yourusername/pehmeira.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**Replace `yourusername`** with your actual GitHub username.

---

## Step 3: Create Vercel Project

### A. Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com) and **sign in**
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository:**
   - If not connected, click **"Connect GitHub Account"**
   - Find your `pehmeira` repository in the list
   - Click **"Import"**

### B. Configure Project Settings

**IMPORTANT:** Do NOT click "Deploy" yet! Configure these settings first:

- **Framework Preset:** Select **"Other"** (not Next.js - you're using Vite + Express)
- **Root Directory:** `.` (leave as default/root)
- **Build Command:** `npm run build` (should auto-detect)
- **Output Directory:** `dist`
- **Install Command:** `npm install` (auto-detected)
- **Node.js Version:** 20.x (auto-detected)

---

## Step 4: Configure Environment Variables

This is **CRITICAL** - your application will NOT work without these environment variables!

### Click "Environment Variables" Section

Before deploying, add all 10 environment variables below.

For each variable:
1. Enter the **Key** (variable name)
2. Enter the **Value** (exact value from below)
3. Select **"Production"** environment (optionally also Preview + Development)
4. Click **"Add"**

---

### 🗄️ Database Environment Variables (Supabase)

#### 1. DATABASE_URL
```
postgresql://postgres.fssgtbaubbiluhgyelfd:spe11%400DD%23%24%23%24@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```
**Purpose:** PostgreSQL connection string for Supabase database

#### 2. SUPABASE_URL
```
https://fssgtbaubbiluhgyelfd.supabase.co
```
**Purpose:** Supabase project URL

#### 3. SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzc2d0YmF1YmJpbHVoZ3llbGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMTM2NjMsImV4cCI6MjA3ODY4OTY2M30.9pAt3zLJ84vqNZ9ZZr0WXkQrpmsGe_uxrGml2E6tf7w
```
**Purpose:** Supabase anonymous (public) key for client-side access

#### 4. SUPABASE_SERVICE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzc2d0YmF1YmJpbHVoZ3llbGZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzExMzY2MywiZXhwIjoyMDc4Njg5NjYzfQ.Fr5vZgQGgnaia2stHlbMEtEoFazthgFeIJSAK74LEmA
```
**Purpose:** Supabase service role key (SECRET - admin access, server-side only)

---

### 🔐 Firebase Authentication Variables

#### 5. VITE_FIREBASE_API_KEY
```
AIzaSyDeeY1TCC4PflGKMdZw9QqZd81NWe30KrY
```
**Purpose:** Firebase API key for web authentication (public)

#### 6. VITE_FIREBASE_APP_ID
```
1:644978772939:web:fc43e1ae0eed805c83044e
```
**Purpose:** Firebase app identifier

#### 7. VITE_FIREBASE_PROJECT_ID
```
pehmeira-c301b
```
**Purpose:** Firebase project ID

---

### 🔑 API Keys for External Services

#### 8. SERPAPI_API_KEY
```
82d573c04861f3dd3ba08b1ac977dff33ef04dda91c9f4390edff060e6c3751d
```
**Purpose:** SerpAPI key for Google Lens product search

#### 9. ROBOFLOW_API_KEY
```
rf_Q7rL6D8NDZboELX4yukz1qHYBvK2
```
**Purpose:** Roboflow API key for clothing segmentation (custom Indian fashion model)

#### 10. SESSION_SECRET
```
l4vBQzDVlr53mS/H40saruaz6PkCoy+Tfg1iPX6VC9WTp27FxRZjYBeTRVNsYkb62EteslUIT6MpRxmkVoaffg==
```
**Purpose:** Express session secret for secure cookie signing

---

### ⚠️ Important Notes About Environment Variables

**Client-Side vs Server-Side:**
- Variables with `VITE_` prefix are accessible in browser (client-side)
- Variables without prefix are server-side only (more secure)
- NEVER add `VITE_` prefix to secret keys like `SUPABASE_SERVICE_KEY`

**Environment Selection:**
- Always select **"Production"** for all variables
- Optionally add to **"Preview"** for testing branches
- Optionally add to **"Development"** for local dev with Vercel CLI

**After Adding:**
- Double-check all values are copied exactly (no extra spaces or line breaks)
- Click "Add" after each variable
- Total count should be **10 variables**

---

## Step 5: Deploy!

After adding all 10 environment variables:

1. Click the **"Deploy"** button
2. Watch the deployment logs in real-time
3. Build process takes 2-4 minutes

### What Happens During Deployment:

```
📦 Installing dependencies (npm install)
🏗️  Building frontend (vite build)
⚙️  Bundling backend (esbuild)
📤 Deploying to Vercel Edge Network
✅ Assigning production URL
```

### Success Indicators:

Look for these messages in the logs:
- ✅ `Build Completed`
- ✅ `Deploying to production`
- ✅ `Deployment Ready`

You'll receive a deployment URL like:
- `https://pehmeira.vercel.app`
- `https://pehmeira-username.vercel.app`

---

## Step 6: Verify Deployment

### ✅ Check 1: Health Endpoint

Visit your deployment URL + `/api/health`:

```
https://your-app.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-19T14:30:00.000Z",
  "environment": "production",
  "database": {
    "configured": true,
    "type": "Supabase PostgreSQL",
    "host": "aws-1-ap-south-1.pooler.supabase.com:6543"
  },
  "supabase": {
    "configured": true
  },
  "version": "2.0.0-dbstorage-safety-guards"
}
```

**⚠️ If you see `"configured": false`:**
- Environment variables not set correctly
- Go back to Vercel → Settings → Environment Variables
- Verify all 10 variables are present
- Redeploy from Vercel dashboard

---

### ✅ Check 2: Test User Authentication

1. **Visit your deployment URL**
2. **Click "Sign In with Google"**
3. **Complete Google OAuth flow**
4. **Select body type and proceed**

**Verify in Supabase:**
1. Open **Supabase Dashboard** → Table Editor
2. Click on **"users"** table
3. **New user should appear** with email, name, Google ID ✅

**If user doesn't appear in database:**
- Check browser console for errors
- Check Vercel function logs (Deployments → Functions)
- Verify `DATABASE_URL` is correct
- Ensure Firebase authorized domains include your Vercel URL

---

### ✅ Check 3: Test Product Search

1. **Select occasion** (e.g., "Date Night")
2. **Click on a style card**
3. **Click "Shop This Look" button**
4. **Wait 5-15 seconds** for products to load
5. **Verify category tabs** display correctly:
   - Mobile: 2x2 grid
   - Desktop: 1x4 grid
6. **Check products** load in each category

---

### ✅ Check 4: Test Mobile Interface

1. **Open on mobile** or resize browser to phone width
2. **Verify category tabs** don't overlap (should be 2 columns)
3. **Test authentication** flow on mobile
4. **Check responsive design** across all pages

---

## Step 7: Custom Domain Setup

### A. Add Domain in Vercel

1. Go to Vercel project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `pehmeira.com`
4. Click **"Add"**
5. **Repeat** for: `www.pehmeira.com`

Vercel will show you the DNS records you need to configure.

---

### B. Configure DNS Records

Go to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.) and add these DNS records:

#### For Apex Domain (pehmeira.com):
```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
TTL: Auto (or 3600)
```

#### For WWW Subdomain:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto (or 3600)
```

**DNS Propagation:**
- Takes 5 minutes to 24 hours (usually under 1 hour)
- Check status at: [dnschecker.org](https://dnschecker.org)
- Vercel will auto-issue SSL certificate when DNS propagates

---

### C. Update Firebase Authorized Domains

**CRITICAL:** Firebase will block logins from unauthorized domains

1. Go to **Firebase Console** → Your Project
2. Click **Authentication** → **Settings**
3. Scroll to **"Authorized domains"**
4. Click **"Add domain"** and add:
   - `pehmeira.com`
   - `www.pehmeira.com`
   - `pehmeira.vercel.app` (your Vercel subdomain)
   - `localhost` (for local development)

5. Click **"Save"**

**Test after adding:**
- Visit `https://pehmeira.com`
- Try signing in with Google
- Should work without "Unauthorized domain" error

---

## Troubleshooting

### Issue 1: Build Fails with "Cannot find module"

**Symptoms:** Deployment fails during build

**Cause:** Missing dependencies or incorrect imports

**Fix:**
1. Check `package.json` - ensure all used packages are in `dependencies`
2. Vercel only installs `dependencies`, not `devDependencies` for serverless
3. Move critical packages from `devDependencies` to `dependencies`:
   ```bash
   npm install --save package-name
   ```
4. Commit and push changes
5. Vercel auto-redeploys

---

### Issue 2: API Routes Return 404

**Symptoms:** 
- Health endpoint returns 404
- Login doesn't work
- Product search fails

**Cause:** Incorrect routing configuration

**Fix:**
1. Verify `vercel.json` exists in project root
2. Check `/api/*` rewrite points to `/dist/index.js`
3. Ensure `dist/index.js` exists after build:
   ```bash
   npm run build
   ls dist/  # Should show index.js
   ```
4. Redeploy if configuration was missing

---

### Issue 3: "Unauthorized domain" Error (Firebase)

**Symptoms:** Login fails with Firebase error

**Fix:**
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add your Vercel domain (`pehmeira.vercel.app`, `pehmeira.com`)
3. Wait 2-3 minutes for Firebase to update
4. Try login again

---

### Issue 4: Environment Variables Undefined

**Symptoms:**
- Database connection fails
- "DATABASE_URL not configured" error
- Health endpoint shows `configured: false`

**Cause:** Variables not added or deployment didn't include them

**Fix:**
1. Vercel → Settings → Environment Variables
2. Verify all 10 variables exist for **Production** environment
3. Click **"Redeploy"** (variables don't apply to existing deployments automatically)
4. Check health endpoint after redeploy

---

### Issue 5: Users Not Saving to Database

**Symptoms:** Login works but users don't appear in Supabase

**Cause:** Wrong database URL or connection error

**Fix:**
1. Verify `DATABASE_URL` matches your Supabase project:
   ```
   Supabase Dashboard → Settings → Database → Connection string
   ```
2. Check for typos in connection string
3. Ensure Supabase project is active (not paused)
4. Check Vercel function logs for database errors
5. Test connection locally:
   ```bash
   psql "postgresql://postgres.fssgtbaubbiluhgyelfd:spe11%400DD%23%24%23%24@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
   ```

---

### Issue 6: Product Search Takes Too Long or Times Out

**Symptoms:** "Shop This Look" button loads forever

**Cause:** Function timeout (default 10s) or API rate limits

**Fix:**
1. Check `vercel.json` - increase `maxDuration`:
   ```json
   "functions": {
     "dist/index.js": {
       "maxDuration": 30
     }
   }
   ```
2. Verify SerpAPI and Roboflow API keys are valid
3. Check API quotas/limits haven't been exceeded
4. Review function logs for specific error messages

---

### Issue 7: Images/Assets Not Loading

**Symptoms:** Style images show broken, uploaded admin images fail

**Cause:** Supabase Storage bucket not public or incorrect URLs

**Fix:**
1. Supabase Dashboard → Storage → `style-images` bucket
2. Click **"Policies"** tab
3. Enable **"Public access"** for reading:
   ```sql
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'style-images');
   ```
4. Verify image URLs start with `https://fssgtbaubbiluhgyelfd.supabase.co/storage/v1/object/public/`

---

### Issue 8: Mobile Category Tabs Overlap

**Symptoms:** Category tabs collide on phone screens

**Status:** ✅ **FIXED** - Already deployed in latest code

**Verify Fix:**
1. Open on mobile or resize browser
2. Category tabs should display as **2x2 grid** on mobile
3. Tabs should be **1x4 grid** on desktop
4. No text overlap or collision

If still broken:
- Clear browser cache
- Force refresh (Ctrl+Shift+R)
- Check latest deployment has the fix

---

## Post-Deployment

### Enable Vercel Analytics (Optional)

1. Vercel project → **Analytics** tab
2. Click **"Enable Web Analytics"** (free)
3. See visitor stats, page views, countries
4. Track user behavior and popular pages

---

### Enable Speed Insights (Optional)

1. Vercel project → **Speed Insights** tab
2. Click **"Enable"**
3. Monitor Core Web Vitals:
   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)
   - Cumulative Layout Shift (CLS)
4. Get recommendations for performance improvements

---

### Set Up Preview Deployments

**Automatic Preview Deployments** are enabled by default:

- **Every Git branch** gets its own preview URL
- **Every Pull Request** shows preview in PR comments
- Test changes safely before merging to production

**How to use:**
```bash
# Create new branch
git checkout -b feature/new-feature

# Make changes and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Vercel automatically deploys to:
# https://pehmeira-git-feature-new-feature-username.vercel.app
```

**Test preview deployment:**
1. Check the preview URL in GitHub PR or Vercel dashboard
2. Verify feature works correctly
3. Merge to `main` when ready
4. Vercel auto-deploys to production

---

### Monitoring and Logs

#### Function Logs
1. Vercel → Deployments → Click latest deployment
2. Click **"Functions"** tab
3. See real-time logs for:
   - API requests
   - Database queries
   - Errors and exceptions
   - Performance metrics

#### Deployment History
1. Vercel → Deployments
2. See all past deployments with:
   - Build logs
   - Deployment duration
   - Git commit info
   - Rollback option

#### Alerts (Pro Plan)
- Configure alerts for:
  - Build failures
  - Function errors
  - Performance degradation
  - Quota limits

---

## Future Updates

### Automatic Deployments (Recommended)

Once connected to GitHub, updates are automatic:

```bash
# Make changes locally
git add .
git commit -m "Update feature or fix bug"
git push

# Vercel automatically:
# 1. Detects the push to main branch
# 2. Runs build process
# 3. Deploys to production
# 4. Site updates in ~2-3 minutes
```

**No manual intervention needed!**

---

### Manual Deployments via CLI

Install Vercel CLI for manual deployments:

```bash
# Install globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from local folder (preview)
vercel

# Deploy to production
vercel --prod

# Deploy specific branch
vercel --prod --force
```

---

### Rollback to Previous Deployment

If something breaks:

1. Vercel → **Deployments**
2. Find a previous working deployment
3. Click **"⋯"** menu → **"Promote to Production"**
4. Instant rollback (no rebuild needed)

---

## Success Checklist

After completing all steps, verify:

- ✅ Health endpoint returns `database.configured: true`
- ✅ Firebase Google login works
- ✅ New users appear in Supabase `users` table
- ✅ Product search loads results (5-15 seconds)
- ✅ Mobile category tabs display correctly (2x2 grid)
- ✅ Custom domain `pehmeira.com` resolves
- ✅ HTTPS certificate active (auto-enabled)
- ✅ All 10 environment variables configured
- ✅ Automatic deployments from GitHub working

---

## Quick Reference

### Important URLs

**Production:**
- Main site: `https://pehmeira.com`
- Health check: `https://pehmeira.com/api/health`
- Vercel subdomain: `https://pehmeira.vercel.app`

**Management:**
- Vercel Dashboard: `https://vercel.com/your-username/pehmeira`
- GitHub Repo: `https://github.com/your-username/pehmeira`
- Supabase Dashboard: `https://supabase.com/dashboard`
- Firebase Console: `https://console.firebase.google.com`

---

### Environment Variables Summary

| Variable | Type | Purpose |
|----------|------|---------|
| `DATABASE_URL` | Server | PostgreSQL connection string |
| `SUPABASE_URL` | Server | Supabase project URL |
| `SUPABASE_ANON_KEY` | Server | Public Supabase key |
| `SUPABASE_SERVICE_KEY` | Server | Secret admin key |
| `VITE_FIREBASE_API_KEY` | Client | Firebase web API key |
| `VITE_FIREBASE_APP_ID` | Client | Firebase app ID |
| `VITE_FIREBASE_PROJECT_ID` | Client | Firebase project ID |
| `SERPAPI_API_KEY` | Server | Google Lens search |
| `ROBOFLOW_API_KEY` | Server | Clothing segmentation |
| `SESSION_SECRET` | Server | Session encryption |

---

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS + Shadcn UI
- TanStack Query for data fetching
- Wouter for routing

**Backend:**
- Express.js serverless functions
- Node.js 20.x runtime
- Firebase Admin SDK for auth
- Drizzle ORM for database

**Database & Storage:**
- Supabase PostgreSQL (production)
- Supabase Storage for images
- Firebase Authentication

**External APIs:**
- SerpAPI (Google Lens product search)
- Roboflow (custom clothing segmentation)

---

## Need Help?

### Common Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Express.js Docs:** https://expressjs.com

### Debugging Steps

1. **Check Vercel deployment logs** (most build errors shown here)
2. **Check function logs** (runtime errors and API issues)
3. **Test health endpoint** (confirms environment configuration)
4. **Check browser console** (frontend errors)
5. **Review Supabase logs** (database connection issues)

### Support Channels

- **Vercel Support:** help@vercel.com
- **GitHub Issues:** For code-specific problems
- **Stack Overflow:** Tag questions with `vercel`, `supabase`, `express`

---

## Conclusion

Your Pehmeira luxury fashion styling application is now deployed to Vercel with:

✅ **Production-grade infrastructure** (Vercel Edge Network)  
✅ **Scalable database** (Supabase PostgreSQL)  
✅ **Secure authentication** (Firebase + Google OAuth)  
✅ **Custom domain** (pehmeira.com with SSL)  
✅ **AI-powered features** (Roboflow clothing detection, Google Lens search)  
✅ **Mobile-responsive UI** (optimized for all screen sizes)  
✅ **Automatic deployments** (from GitHub main branch)  
✅ **Zero-downtime updates** (instant rollback capability)

**Your app is live and ready for users!** 🎉

---

**Document Version:** 2.0.0  
**Created:** November 19, 2025  
**For:** Pehmeira Luxury Fashion Styling Application
