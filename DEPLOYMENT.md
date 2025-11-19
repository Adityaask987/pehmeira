# Pehmeira Deployment Guide - Replit

## Current Deployment Issue

**Problem**: The deployed app at pehmeira.com is using in-memory storage instead of Supabase because environment variables are not configured for the deployment.

**Symptoms**:
- New user logins don't appear in Supabase database
- Styles added in dev environment not visible on pehmeira.com
- Old hardcoded styles visible on deployed version

## Solution: Configure Deployment Secrets

### Step 1: Access Deployment Settings

1. Click the **"Deploy"** or **"Publish"** button in your Replit workspace
2. Find your existing deployment for **pehmeira.com**
3. Click on **"Settings"** or **"Configure"** for the deployment

### Step 2: Add Required Environment Variables

You need to add these secrets to your **deployment configuration** (not just workspace secrets):

#### Database Secrets (Supabase)
```
DATABASE_URL=<your-supabase-postgres-url>
SUPABASE_URL=<your-supabase-project-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_KEY=<your-supabase-service-key>
```

#### Firebase Authentication
```
VITE_FIREBASE_API_KEY=<your-firebase-api-key>
VITE_FIREBASE_APP_ID=<your-firebase-app-id>
VITE_FIREBASE_PROJECT_ID=<your-firebase-project-id>
```

#### API Keys
```
SERPAPI_API_KEY=<your-serpapi-key>
ROBOFLOW_API_KEY=<your-roboflow-key>
SESSION_SECRET=<your-session-secret>
```

### Step 3: How to Get Your Secret Values

Your workspace already has these configured. To copy them to deployment:

**Option A: From Replit Secrets UI**
1. Open the "Secrets" tab in your workspace (🔒 icon or Tools → Secrets)
2. Copy each value
3. Paste into deployment configuration

**Option B: From Shell**
```bash
# Print all secret values (be careful - these are sensitive!)
echo "DATABASE_URL=$DATABASE_URL"
echo "SUPABASE_URL=$SUPABASE_URL"
echo "SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"
echo "SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY"
echo "VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY"
echo "VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID"
echo "VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID"
echo "SERPAPI_API_KEY=$SERPAPI_API_KEY"
echo "ROBOFLOW_API_KEY=$ROBOFLOW_API_KEY"
echo "SESSION_SECRET=$SESSION_SECRET"
```

### Step 4: Redeploy

After adding all environment variables:
1. Click **"Redeploy"** or **"Deploy"** button
2. Wait for deployment to complete
3. The build should now show: "✅ DbStorage initialized successfully"

### Step 5: Verify

1. Visit **pehmeira.com**
2. Sign in with a new test email
3. Check Supabase database → Users table
4. Verify the new user appears ✅

## Safety Features Added

The codebase now includes safety guards:

```typescript
// In server/storage.ts
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be configured in production");
}
```

This will:
- ✅ Prevent accidental deployment without database
- ✅ Show clear error in deployment logs
- ✅ Force you to configure DATABASE_URL

## Troubleshooting

### Deployment Build Fails with "DATABASE_URL must be set"

**Good!** This means the safety guard is working. You need to:
1. Add DATABASE_URL to deployment secrets
2. Redeploy

### Users Still Not Saving After Adding Secrets

1. Check deployment logs for: "✅ DbStorage initialized successfully"
2. If not present, secrets might not be configured correctly
3. Verify all secrets are added to **deployment** (not just workspace)

### Firebase Auth Fails on Deployed Version

1. Add pehmeira.com to Firebase authorized domains:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add: `pehmeira.com`

## Important Notes

- **Workspace secrets** (Tools → Secrets) are for development
- **Deployment secrets** must be configured separately in deployment settings
- Both need the same values for consistency
- Never commit secrets to Git

## Current Environment

**Development**:
- Database: Supabase PostgreSQL
- Region: AWS Asia Pacific (South) - Mumbai
- Host: `aws-1-ap-south-1.pooler.supabase.com`

**Production** (after fix):
- Same database as development
- All environment variables must match dev
