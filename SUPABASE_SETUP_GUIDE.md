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

⚠️ **CRITICAL**: Follow these steps exactly to avoid 401/403 errors!

1. In your Supabase dashboard, click **"Storage"** in left sidebar
2. Click **"Create a new bucket"**
3. Bucket details:
   - **Name**: `style-images` (exact name, case-sensitive)
   - **Public bucket**: ✅ **MUST CHECK THIS BOX** (makes images publicly accessible)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: Leave empty or add: `image/jpeg,image/jpg,image/png,image/webp`
4. Click **"Create bucket"**

### Set Up Storage Policies (REQUIRED!)

**Without these policies, uploads will fail with 401/403 errors!**

1. Click on your `style-images` bucket
2. Go to **"Policies"** tab
3. You should see "No policies for this bucket yet"

**Policy 1: Allow Authenticated Uploads**
1. Click **"New Policy"** 
2. Choose **"For full customization"** (not templates)
3. Fill in:
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: Check **INSERT** only
   - **Policy definition**: 
     - **Target roles**: Select `authenticated`
     - **USING expression**: `true` (type this manually)
     - **WITH CHECK expression**: `true` (type this manually)
4. Click **"Review"** → **"Save policy"**

**Policy 2: Allow Public Read Access**
1. Click **"New Policy"** again
2. Choose **"For full customization"**
3. Fill in:
   - **Policy name**: `Public read access`
   - **Allowed operation**: Check **SELECT** only
   - **Policy definition**:
     - **Target roles**: Select `public`
     - **USING expression**: `true` (type this manually)
4. Click **"Review"** → **"Save policy"**

**Policy 3: Allow Authenticated Delete** (for cleanup)
1. Click **"New Policy"** again
2. Choose **"For full customization"**
3. Fill in:
   - **Policy name**: `Allow authenticated delete`
   - **Allowed operation**: Check **DELETE** only
   - **Policy definition**:
     - **Target roles**: Select `authenticated`
     - **USING expression**: `true` (type this manually)
4. Click **"Review"** → **"Save policy"**

### Verify Bucket Setup

After creating policies, you should see **3 policies** in the list:
- ✅ Allow authenticated uploads (INSERT)
- ✅ Public read access (SELECT)
- ✅ Allow authenticated delete (DELETE)

If you don't see all 3, uploads and deletions will fail!

## Step 5: Migrate Existing Images (If You Have Styles Already)

⚠️ **IMPORTANT**: If you already have styles in your database with local image paths (`/uploads/styles/...`), you need to migrate them to Supabase Storage URLs.

### Option A: Re-upload Images via Admin Panel (Recommended)
1. Sign in to your admin panel at `/admin`
2. For each existing style:
   - Click "Edit" (pencil icon)
   - Upload the same image again (it will go to Supabase Storage)
   - Save the style
3. The old local image will be automatically replaced with the Supabase URL

### Option B: SQL Migration (Advanced)
If you have many styles and want to migrate programmatically:

1. Download all images from your local `uploads/styles/` directory
2. Upload them to Supabase Storage using the Supabase dashboard or API
3. Run this SQL to update URLs in database:

```sql
-- Example: Update a single style's image URL
UPDATE styles 
SET image = 'https://your-project.supabase.co/storage/v1/object/public/style-images/new-filename.jpg'
WHERE id = 'style-id-here';

-- Or update all styles at once (adjust URLs accordingly)
```

### Why This Matters
- Old URLs (`/uploads/styles/...`) only work on Replit with local file storage
- Supabase URLs (`https://...supabase.co/storage/...`) work everywhere (Vercel, production, etc.)
- The app automatically handles both formats for backwards compatibility
- New uploads always go to Supabase Storage

## Step 6: Ready for Migration!

Once you have all 4 credentials added to Replit Secrets and your storage bucket set up with correct policies, the migration is complete!

**What's Been Done:**
1. ✅ Installed Supabase SDK
2. ✅ Database schema already exists in Supabase
3. ✅ File uploads now use Supabase Storage
4. ✅ Storage cleanup on delete/update implemented
5. ✅ Documentation updated

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
