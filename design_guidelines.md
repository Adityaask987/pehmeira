# Fashion Styling Application - Design Guidelines

## Design Approach: Luxury Fashion E-Commerce

**Selected Reference**: Myntra shopping interface + luxury fashion apps (Net-a-Porter, Farfetch)
**Key Principle**: Premium, editorial-quality presentation with intuitive shopping experience

## Core Design Elements

### A. Color Palette

**Light Mode (Primary)**
- Primary: 0 0% 0% (Black) - Headers, primary text, CTA buttons
- Secondary: 0 0% 100% (White) - Backgrounds, cards
- Accent: 51 100% 50% (Gold #FFD700) - Highlights, premium badges, active states
- Premium Accent: 48 46% 50% (Darker Gold #C9B037) - Subtle luxury touches, borders
- Background: 0 0% 97% (Light Grey #F8F8F8) - Page background
- Text: 0 0% 20% (Dark Grey #333333) - Body text, descriptions
- Divider: 0 0% 90% - Subtle separators

**Interactive States**
- Hover on gold elements: Darker gold (#C9B037)
- Hover on black buttons: 0 0% 15%
- Selected/Active: Gold accent with subtle shadow

### B. Typography

**Font Families**
- Display/Headlines: Playfair Display (serif, elegant)
- UI Elements/Navigation: Montserrat (sans-serif, modern)
- Body Text: Inter (sans-serif, readable)

**Type Scale**
- Hero Headline: text-5xl md:text-7xl, Playfair Display, font-bold
- Section Headers: text-3xl md:text-4xl, Playfair Display, font-semibold
- Product Titles: text-xl, Montserrat, font-medium
- Body Text: text-base, Inter, font-normal
- Captions/Metadata: text-sm, Inter, font-light
- Price Text: text-lg md:text-xl, Montserrat, font-semibold

### C. Layout System

**Spacing Units**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 consistently
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24
- Card margins: gap-6 to gap-8
- Element spacing: space-y-4 to space-y-6

**Grid System**
- Container: max-w-7xl mx-auto px-4 md:px-6
- Product grids: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Feature cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Body type selection: grid-cols-2 md:grid-cols-3

### D. Component Library

**Navigation**
- Sticky header with subtle shadow on scroll
- Logo left-aligned (Playfair Display)
- Navigation links center (Montserrat, uppercase, letter-spacing)
- User actions right (wishlist count badge with gold accent, profile icon)
- Mobile: Hamburger menu with smooth slide-in drawer

**Product Cards**
- Clean white background with subtle shadow on hover
- High-quality product image (aspect-ratio-3/4)
- Thin gold border on hover
- Product name (Montserrat, medium)
- Price (bold, prominent)
- Retailer name (small, grey)
- Match percentage badge (gold background, black text) when applicable
- Quick-add to wishlist heart icon (top-right, gold when active)

**Style Recommendation Cards**
- Larger format than product cards
- Complete outfit image
- Designer name with gold accent
- Occasion tag
- "Shop This Look" CTA button (black background, gold on hover)
- Individual product breakdown on expansion

**Body Type Selector**
- Visual illustration cards with professional fashion sketches
- Gold border on selection
- Clear label beneath (Montserrat)
- Subtle hover effect (lift + shadow)

**Buttons**
- Primary: Black background, white text, gold hover
- Secondary: White background, black border, black text
- Outline on images: Backdrop blur, white border, white text
- Sizes: py-3 px-8 (large), py-2 px-6 (medium)
- Border radius: rounded-md

**Filters & Sorting**
- Elegant dropdown menus with gold accents
- Checkbox/radio with gold selected state
- Price range slider with gold thumb
- Clear all filters link (underlined, gold)

**Wishlist**
- Grid layout matching product display
- Remove action with smooth fade-out
- Empty state with elegant illustration + CTA

### E. Animations

Use sparingly for premium feel:
- Card hover: Subtle lift (transform + shadow transition)
- Image zoom: Smooth scale on product hover
- Page transitions: Elegant fade
- Wishlist heart: Subtle pulse on add
- Filter drawer: Smooth slide
- NO continuous/distracting animations

## Images

**Hero Section**
- Large, editorial-quality fashion photography
- Model in styled outfit representing the app's curation
- Overlay with slight dark gradient (bottom to top)
- Hero text positioned left-aligned or centered depending on image composition
- Minimum height: 80vh on desktop, 60vh on mobile
- Image should convey luxury and style diversity

**Product Images**
- High-resolution product photography on clean white or minimal background
- Consistent aspect ratio (3:4 portrait for clothing, 1:1 for accessories)
- Multiple angles available on product detail
- Zoom capability on hover/click

**Body Type Guides**
- Professional fashion illustration style
- Clean line drawings showing silhouettes
- Consistent artistic style across all body types
- Subtle gold accent in illustrations

**Occasion Categories**
- Lifestyle imagery representing each occasion
- Professional photography with models in context
- Consistent filtering/color grading

**Empty States**
- Elegant minimalist illustrations
- Gold accent colors
- Encouraging copy with clear CTA

## Responsive Behavior

**Mobile (< 768px)**
- 2-column product grid
- Collapsible filters in slide-out drawer
- Simplified navigation in hamburger menu
- Larger tap targets (min 44px)
- Sticky "Shop Now" button on product pages

**Tablet (768px - 1024px)**
- 3-column product grid
- Side-by-side filter + products layout
- Full navigation visible

**Desktop (> 1024px)**
- 4-column product grid
- Persistent filter sidebar
- Hover interactions active
- Larger imagery and generous whitespace

## Page-Specific Layouts

**Onboarding Flow**
- Step indicator with gold progress bar
- Single-focus per step (gender → body type → preferences)
- Large visual selectors
- Clear navigation (Back/Next)

**Style Recommendations**
- Featured designer quote/inspiration at top
- Masonry or grid layout for outfit cards
- Filter by occasion, season, formality
- "Explore Products" breakdown below each style

**Product Discovery**
- Left sidebar: Filters (collapsible categories)
- Top bar: Sorting, view toggle (grid/list)
- Main area: Product grid
- Pagination or infinite scroll with elegant loading state

**Wishlist**
- Tabs: Complete Styles | Individual Items
- Grid matching product display
- Share wishlist CTA
- "Continue Shopping" suggestions below

This design system creates a cohesive, premium experience that balances luxury aesthetics with functional shopping capabilities.