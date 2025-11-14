# Admin Panel Access Guide

## How to Access the Admin Panel

The admin panel is located at `/admin` and requires two things:

1. **Firebase Authentication** - You must be signed in with Google
2. **Admin Permission** - Your user account must have `isAdmin = true` in the database

## Step-by-Step Instructions

### Step 1: Sign in with Google
1. Navigate to your Pehmeira application
2. Click "Sign In" in the header
3. Sign in with your Google account
4. You'll be redirected to the homepage

### Step 2: Grant Admin Access to Your Account

You need to update your user record in the database to make yourself an admin.

**Option A: Using Replit Database Tool**
1. Open the "Database" tab in your Replit workspace
2. Navigate to the `users` table
3. Find your user record (search by your email address)
4. Edit the record and set `isAdmin` to `true`
5. Save the changes

**Option B: Using SQL Query**
1. Open the "Database" tab in your Replit workspace
2. Click "Query" to open the SQL console
3. Run this query (replace with your actual email):

```sql
UPDATE users 
SET "isAdmin" = true 
WHERE email = 'your-email@gmail.com';
```

4. Verify the change:

```sql
SELECT id, email, "isAdmin" FROM users WHERE email = 'your-email@gmail.com';
```

### Step 3: Access the Admin Panel
1. Navigate to `/admin` in your application
2. If you're signed in and have admin permissions, you'll see the admin panel
3. If not authorized, you'll be redirected to the homepage

## Admin Panel Features

Once you have access, you can:

- **View All Styles** - See every style in the database with thumbnails
- **Add New Style** - Click "Add Style" to create a new style with image upload
- **Edit Style** - Click the pencil icon to modify existing styles
- **Delete Style** - Click the trash icon to remove styles
- **Upload Images** - Upload style images (max 5MB, jpeg/jpg/png/webp only)

## Security Notes

- Admin access is checked on every API request using Firebase token verification
- Only users with `isAdmin = true` can access admin endpoints
- Images are stored in `uploads/styles/` directory
- File uploads are limited to 5MB and image formats only

## Troubleshooting

**"You are not authorized to access this page"**
- Verify you're signed in with Google
- Check that your user record has `isAdmin = true` in the database
- Try signing out and signing back in to refresh your session

**Can't upload images**
- Check file size (must be under 5MB)
- Verify file format (jpeg, jpg, png, or webp only)
- Make sure you're signed in and have admin permissions

**Changes not appearing**
- Refresh the page to see updated data
- Check the browser console for any errors
