# Supabase Migration Guide

This guide will help you migrate your Pehmeira app from Replit PostgreSQL to Supabase, making it ready for GitHub → Vercel deployment.

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign up (free tier is fine)
2. Click **"New Project"**
3. Choose your organization or create a new one
4. Fill in project details:
   - **Name**: `pehmeira` (or whatever you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"** and wait 1-2 minutes for setup

## Step 2: Get Your Supabase Credentials

Once your project is created, you'll need 4 credentials:

### A. Database Connection String (for Drizzle ORM)
1. In your Supabase dashboard, click **"Project Settings"** (gear icon)
2. Go to **"Database"** section
3. Scroll to **"Connection string"**
4. Select **"Transaction pooler"** mode (important!)
5. Copy the connection string - it looks like:
   ```
   postgresql://postgres.xxxxxxxxxxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
6. **Replace `[YOUR-PASSWORD]`** in the string with your actual database password
7. Save this as `DATABASE_URL`

### B. Supabase Project URL
1. In **"Project Settings"** → **"API"**
2. Find **"Project URL"** - looks like:
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
3. Save this as `SUPABASE_URL`

### C. Supabase Anon Key
1. Same section (**"Project Settings"** → **"API"**)
2. Find **"Project API keys"** → **"anon public"**
3. Copy the key (starts with `eyJ...`)
4. Save this as `SUPABASE_ANON_KEY`

### D. Supabase Service Role Key
1. Same section as above
2. Find **"service_role"** key (below anon key)
3. Copy this key (also starts with `eyJ...`)
4. ⚠️ **IMPORTANT**: Keep this secret! Never commit to GitHub
5. Save this as `SUPABASE_SERVICE_KEY`

## Step 3: Add Credentials to Replit

1. In your Replit workspace, open the **"Secrets"** tab (🔒 icon in left sidebar)
2. Add these 4 secrets:

   ```
   DATABASE_URL = postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   SUPABASE_URL = https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY = eyJhbGc...
   SUPABASE_SERVICE_KEY = eyJhbGc...
   ```

3. Replace with your actual values from Step 2

## Step 4: Create Storage Bucket (for Images)

1. In your Supabase dashboard, click **"Storage"** in left sidebar
2. Click **"Create a new bucket"**
3. Bucket details:
   - **Name**: `style-images`
   - **Public bucket**: ✅ **Enable** (so images are publicly accessible)
4. Click **"Create bucket"**

### Set Up Storage Policies (Important!)

1. Click on your `style-images` bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"** → **"For full customization"**
4. Create this policy for uploads:
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **USING expression**: `true`
   - **WITH CHECK expression**: `true`
5. Click **"Review"** → **"Save policy"**

6. Create another policy for public reads:
   - **Policy name**: `Public read access`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public`
   - **USING expression**: `true`
7. Click **"Review"** → **"Save policy"**

## Step 5: Ready for Migration!

Once you have all 4 credentials added to Replit Secrets and your storage bucket set up, come back and let me know. I'll:

1. ✅ Install Supabase SDK
2. ✅ Push your database schema to Supabase
3. ✅ Migrate existing data
4. ✅ Update file uploads to use Supabase Storage
5. ✅ Test everything works
6. ✅ Update documentation

## What This Enables

After migration:
- ✅ Database accessible from anywhere (Replit, Vercel, localhost)
- ✅ Image uploads work on Vercel (no local file system needed)
- ✅ Same credentials work on GitHub + Vercel deployment
- ✅ Easy to manage via Supabase dashboard
- ✅ Automatic backups and scaling

## Need Help?

Common issues:
- **Can't find connection string?** Make sure you selected "Transaction pooler" mode
- **Database password error?** Remember to replace `[YOUR-PASSWORD]` with your actual password
- **Storage bucket not public?** Check that "Public bucket" was enabled when creating it

Once you've completed Steps 1-4, let me know and I'll handle the rest!
