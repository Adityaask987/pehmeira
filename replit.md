# Pehmeira - Luxury Fashion Styling Application

## Overview
A premium web-based fashion styling application that provides personalized outfit recommendations based on body type and occasion. Features curated designer styles, product discovery across multiple retailers, and wishlist functionality with a sophisticated luxury interface.

## Project Status
**Current Phase**: Feature Enhancement (Post-MVP)
**Last Updated**: October 23, 2025

## Recent Changes
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
- PostgreSQL with Drizzle ORM (DbStorage)
- Static asset serving for user-uploaded images
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

### Key Features
- Visual body type selector with professional illustrations
- Occasion-based style curation
- Product filtering by category (shirts, pants, shoes, accessories)
- Price and match percentage sorting
- Complete style wishlist and individual product wishlist
- Responsive mobile-first design
- Premium hover interactions and transitions

## API Endpoints
- `GET /api/styles` - Get style recommendations
- `GET /api/products` - Get product catalog
- `POST /api/search-products` - Image-based product search using Google Lens API
- `GET /api/wishlist` - Get user's wishlist items
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist/:id` - Remove item from wishlist
- `POST /api/users` - Create user profile

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

## Next Steps (Post-MVP)
1. Integrate real retail APIs (ShopStyle, Amazon, Nordstrom)
2. Implement AI-powered visual similarity matching
3. Add user profile management with size preferences
4. Create personalized recommendation engine
5. Implement price tracking and sale notifications
6. Add social sharing features
7. Build style inspiration feed
