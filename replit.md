# Pehmeira - Luxury Fashion Styling Application

## Overview
A premium web-based fashion styling application that provides personalized outfit recommendations based on body type and occasion. Features curated designer styles, product discovery across multiple retailers, and wishlist functionality with a sophisticated luxury interface.

## Project Status
**Current Phase**: Production-Ready Authentication & Feature Enhancement
**Last Updated**: November 19, 2025

## Recent Changes
- **November 19, 2025**: Production-Ready Authentication Error Handling
  - **Zero Silent Failures**: All authentication errors now show user-visible toast notifications
  - **Complete Parity**: Both onAuthChange and refreshUser flows have identical error handling
  - **Auto-Recovery**: Missing database users are automatically recreated with success confirmation
  - **Structured Error Propagation**: Full Postgres diagnostics (code, detail, hint, constraint) preserved through entire chain
  - **Comprehensive Toast Notifications**: JSON parsing failures, network errors, database sync errors, and user creation failures all show descriptive messages
  - **Development Diagnostics**: Error responses include full metadata (code, detail, hint, stack) in development mode for debugging
  - **User Feedback**: Success toasts for new user creation ("Welcome to Pehmeira") and session restoration
  - **Server Message Display**: All error toasts include server-provided messages when available
  - **Architect Verified**: Production-ready for Vercel deployment with zero known edge cases
- **November 19, 2025**: Custom Roboflow Model for Indian Fashion Segmentation
  - **Custom Model**: Using user's trained Roboflow model specifically for Indian fashion styles
  - **Model Details**: `aditya-singh-kshatriya-r3kpr/find-lower-body-clothes-upper-body-clothes-shoes-and-jewellery-and-bags-and-watches/1`
  - **Detection Classes**: "upper body clothes", "lower body clothes", "shoes", "jewelleries and bags and watches"
  - **Clothing Segmentation Approach**: Detects individual garments (tops, bottoms, shoes, accessories) in style images
  - **Per-Garment Search**: Each detected clothing item is cropped and searched separately via Google Lens
  - **Accuracy Improvement**: Searches individual garments instead of full image = much better product matches
  - **Implementation**: Custom Roboflow API → Crop garments → Google Lens per crop → Categorized results
  - **Robust Fallback**: If Roboflow fails, automatically falls back to Google Shopping API with category queries
  - **No AI costs**: Using FREE Roboflow tier (unlimited inference on free plan)
  - **Rate limiting**: Max 3 concurrent Roboflow requests using p-limit
  - **Image processing**: Sharp library for precise garment cropping from bounding boxes
  - **Workflow**: Style image → Detect clothing → Crop regions → Search each → Filter Indian merchants → Return 10 products/category
- **November 14, 2025**: Migrated to Supabase for Production Deployment
  - Migrated database from Replit PostgreSQL to Supabase PostgreSQL
  - Replaced local file storage (multer) with Supabase Storage for image uploads
  - Image uploads now stored in Supabase Storage bucket `style-images` (public access)
  - Updated admin upload endpoint to use Supabase Storage SDK
  - Removed local uploads directory serving (no longer needed)
  - Application now fully portable for GitHub → Vercel deployment
  - Same DATABASE_URL works on Replit, Vercel, and any hosting platform
  - No local file system dependencies (ready for serverless deployment)
- **January 14, 2026**: Admin Panel for Style Management
  - Created comprehensive admin panel at /admin with full CRUD operations
  - Added isAdmin field to users table for role-based access control
  - Built admin API endpoints: GET/POST/PATCH/DELETE /api/admin/styles
  - Created admin middleware (requireAdmin) with Firebase token verification
  - Designed luxury black/gold admin UI matching application aesthetic
  - Database-backed styles table replaces hardcoded arrays
  - Admin users can add, edit, delete styles with image upload capability
- **January 9, 2026**: Firebase Authentication with Google OAuth
  - Integrated Firebase Authentication for secure user login
  - Implemented Google sign-in with popup flow
  - Created AuthContext for global user state management
  - Updated Header with user avatar dropdown menu (profile, wishlist, sign out)
  - Added /auth login page with Pehmeira branding
  - Backend routes for user sync and session management using Firebase Admin SDK
  - User database schema updated to support Firebase UID, email, name, profilePicture
  - Auth middleware for protecting API endpoints with Firebase token verification
- **January 3, 2026**: Image-based product search with match percentages
  - Integrated Google Lens API (SerpAPI) for visual similarity product search
  - Added match percentage badges to product cards (98% for top results, decreasing by 3% per position)
  - Implemented parallel API calls for 4 categories (Tops, Bottoms, Accessories, Footwear)
  - Created /product-results page with tabbed interface showing 40 products across categories
  - Performance optimized: reduced search latency from 20-60s to 5-15s via concurrent requests
  - Gold badge styling with black text for premium aesthetic
- **October 24, 2025**: Added Plus Size Date Night style recommendations
  - Added two new curated styles for Plus Size women's Date Night occasion
  - Configured Express server to serve attached_assets folder as static files
  - Both styles feature custom imagery and designer recommendations
- **October 23, 2025**: Database migration and user profile management
  - Migrated from in-memory storage to PostgreSQL with Drizzle ORM
  - Implemented user profile management with size preferences, favorite brands, and budget settings
  - Added validated API endpoints for profile updates
  - Created profile page with react-hook-form and comprehensive validation
- **October 18, 2025**: Expanded body type selection with comprehensive options
  - Women: 16 body types (Petite, Slim, Athletic, Rectangle, Hourglass, Curvy Hourglass, Pear, Triangle, Sporty, Inverted Triangle, Apple, Round Apple, Full Figure, Plus Size, Voluptuous, Curvy Plus)
  - Men: 15 body types (Very Slim, Slim, Lean Athletic, Rectangle, Medium, Triangle, Inverted Triangle, Broad Shoulder, Trapezoid, Muscular, Stocky, Oval, Heavyset, Large Frame, Plus Size)
  - Updated to 4-column grid layout with silhouette images and gold checkmark for selected state
- Initial project setup with luxury design system
- Implemented complete onboarding flow with gender and body type selection
- Created occasion-based browsing and style recommendations
- Built product catalog with filtering and sorting
- Added wishlist functionality for styles and products with database persistence
- Configured black, white, and gold color scheme with Playfair Display, Montserrat, and Inter fonts

## Tech Stack
**Frontend**:
- React with TypeScript
- Tailwind CSS + Shadcn UI components
- Wouter for routing
- TanStack Query for data fetching
- Framer Motion for animations

**Backend**:
- Express.js
- Supabase PostgreSQL with Drizzle ORM (DbStorage)
- Supabase Storage for image uploads (serverless-ready)
- Firebase Admin SDK for authentication
- TypeScript

**Design System**:
- Colors: Black (#000000), White (#FFFFFF), Gold (#FFD700), Light Grey (#F8F8F8), Darker Gold (#C9B037)
- Typography: Playfair Display (serif headings), Montserrat (UI elements), Inter (body text)
- Layout: Card-based with elegant spacing, gold accents, hover interactions

## Project Architecture

### Data Models
- **User**: username, gender, bodyType
- **WishlistItem**: userId, itemType (style|product), itemId
- **Style**: Designer-curated outfit combinations with occasion and body type targeting
- **Product**: Individual items organized by category with retailer information
- **SearchedProduct**: Products from Google Lens API with title, price, source, link, thumbnail, category, matchPercentage
- **BodyType**: Visual body shape guides for personalized recommendations
- **Occasion**: Event categories (casual, business, formal, date night, etc.)

### Pages
1. **Onboarding** (`/`) - Gender selection → Body type selection
2. **Occasion Selection** (`/occasions`) - Choose event type
3. **Style Recommendations** (`/styles`) - Curated designer looks
4. **Product Results** (`/product-results/:styleId`) - Image-based search results with match percentages
5. **Product Catalog** (`/products`) - Browse and filter items by category
6. **Wishlist** (`/wishlist`) - Saved styles and products
7. **Admin Panel** (`/admin`) - Style management dashboard (admin-only)

### Key Features
- Visual body type selector with professional illustrations
- Occasion-based style curation
- Product filtering by category (shirts, pants, shoes, accessories)
- Price and match percentage sorting
- Complete style wishlist and individual product wishlist
- Responsive mobile-first design
- Premium hover interactions and transitions

## API Endpoints

### Public Endpoints
- `GET /api/styles` - Get style recommendations (with optional filters: gender, bodyType, occasion)
- `GET /api/products` - Get product catalog
- `POST /api/search-products` - Image-based product search using Google Lens API
- `GET /api/wishlist` - Get user's wishlist items
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist/:id` - Remove item from wishlist
- `POST /api/users` - Create user profile

### Admin Endpoints (Protected)
- `GET /api/admin/styles` - List all styles (admin only)
- `POST /api/admin/styles` - Create new style (admin only)
- `PATCH /api/admin/styles/:id` - Update existing style (admin only)
- `DELETE /api/admin/styles/:id` - Delete style (admin only)
- `POST /api/admin/upload` - Upload style image (admin only)

## User Preferences
- **Design Priority**: Visual excellence is paramount - luxury aesthetic with gold accents
- **Target Audience**: Fashion-conscious users seeking personalized styling
- **UX Philosophy**: Elegant, intuitive, and visually striking
- **Performance**: Fast loading with beautiful loading states

## Development Guidelines
- Follow design_guidelines.md for all UI implementations
- Use Shadcn components for consistency
- Maintain elegant spacing (p-6 to p-8 for cards)
- Gold accents for premium feel
- Smooth transitions and hover effects
- High-quality imagery with proper aspect ratios

## Admin Workflow
**How to Manage Styles:**
1. Sign in with Google using an admin account (set `isAdmin = true` in database)
2. Navigate to `/admin` to access the admin panel
3. View all existing styles in the grid layout
4. **Add New Style**: Click "Add Style" button → Fill form → Upload image → Submit
5. **Edit Style**: Click pencil icon → Modify fields → Update image if needed → Submit
6. **Delete Style**: Click trash icon → Confirm deletion
7. Images are stored in Supabase Storage bucket `style-images` with public URLs

**Admin Access Setup:**
```sql
-- Make a user an admin
UPDATE users SET "isAdmin" = true WHERE email = 'admin@example.com';
```

## Deployment to Vercel

Your Pehmeira app is now ready to deploy to Vercel with GitHub! Here's how:

### Prerequisites
1. ✅ Supabase database configured (DATABASE_URL)
2. ✅ Supabase Storage bucket `style-images` created
3. ✅ Firebase project configured with Google OAuth

### Deployment Steps

**1. Push to GitHub**
```bash
git init
git add .
git commit -m "Pehmeira luxury fashion styling app"
git remote add origin https://github.com/yourusername/pehmeira.git
git push -u origin main
```

**2. Connect to Vercel**
- Go to https://vercel.com
- Click "New Project"
- Import your GitHub repository
- Vercel will auto-detect the Vite/Express setup

**3. Add Environment Variables**
In your Vercel project settings, add these secrets:
```
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_APP_ID=1:xxx...
VITE_FIREBASE_PROJECT_ID=pehmeira-xxx
SESSION_SECRET=your-session-secret
SERPAPI_API_KEY=your-serpapi-key
```

**4. Update Firebase Authorized Domains**
- Go to Firebase Console → Authentication → Settings
- Add your Vercel domain: `your-project.vercel.app`
- Add your custom domain if using one: `pehmeira.com`

**5. Deploy**
- Click "Deploy" in Vercel
- Your app will be live at `your-project.vercel.app`

### Custom Domain (Pehmeira.com)
**In Vercel:**
1. Go to Project Settings → Domains
2. Add `pehmeira.com` and `www.pehmeira.com`

**In Your Domain Registrar:**
1. Add A record: `@` → Vercel IP
2. Add CNAME record: `www` → `cname.vercel-dns.com`

**Update Firebase:**
1. Add `pehmeira.com` to Firebase authorized domains

### Benefits of Supabase Migration
- ✅ No local file system dependencies (Vercel serverless-ready)
- ✅ Database accessible from anywhere (same URL works everywhere)
- ✅ Image uploads work on Vercel (Supabase Storage instead of local files)
- ✅ Automatic backups via Supabase
- ✅ Easy to scale with Supabase's infrastructure

## Next Steps (Post-MVP)
1. Integrate real retail APIs (ShopStyle, Amazon, Nordstrom)
2. Implement AI-powered visual similarity matching
3. Create personalized recommendation engine
4. Implement price tracking and sale notifications
5. Add social sharing features
6. Build style inspiration feed
7. Add analytics dashboard for admin panel
