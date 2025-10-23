# StyleCurate - Luxury Fashion Styling Application

## Overview
A premium web-based fashion styling application that provides personalized outfit recommendations based on body type and occasion. Features curated designer styles, product discovery across multiple retailers, and wishlist functionality with a sophisticated luxury interface.

## Project Status
**Current Phase**: MVP Development
**Last Updated**: October 18, 2025

## Recent Changes
- **October 18, 2025**: Expanded body type selection with comprehensive options
  - Women: 16 body types (Petite, Slim, Athletic, Rectangle, Hourglass, Curvy Hourglass, Pear, Triangle, Sporty, Inverted Triangle, Apple, Round Apple, Full Figure, Plus Size, Voluptuous, Curvy Plus)
  - Men: 15 body types (Very Slim, Slim, Lean Athletic, Rectangle, Medium, Triangle, Inverted Triangle, Broad Shoulder, Trapezoid, Muscular, Stocky, Oval, Heavyset, Large Frame, Plus Size)
  - Updated to 4-column grid layout with silhouette images and gold checkmark for selected state
- Initial project setup with luxury design system
- Implemented complete onboarding flow with gender and body type selection
- Created occasion-based browsing and style recommendations
- Built product catalog with filtering and sorting
- Added wishlist functionality for styles and products
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
- In-memory storage (MemStorage)
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
- **BodyType**: Visual body shape guides for personalized recommendations
- **Occasion**: Event categories (casual, business, formal, date night, etc.)

### Pages
1. **Onboarding** (`/`) - Gender selection → Body type selection
2. **Occasion Selection** (`/occasions`) - Choose event type
3. **Style Recommendations** (`/styles`) - Curated designer looks
4. **Product Catalog** (`/products`) - Browse and filter items by category
5. **Wishlist** (`/wishlist`) - Saved styles and products

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
