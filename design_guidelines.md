# Design Guidelines for WOW Jewelry E-Commerce

## Design Approach
**Reference-Based**: Drawing inspiration from lalahairbrand.com's clean e-commerce aesthetic combined with Etsy's artisan marketplace professionalism and Shopify's polished product presentation. The design will emphasize elegant simplicity that lets the handmade jewelry take center stage while maintaining sophisticated functionality.

## Core Design Elements

### Typography
- **Primary Font**: Inter or Montserrat via Google Fonts CDN for modern, clean readability
- **Secondary Font**: Playfair Display or Cormorant for elegant product names and accents
- **Hierarchy**:
  - Hero headlines: text-5xl to text-6xl, font-bold
  - Section headings: text-3xl to text-4xl, font-semibold
  - Product names: text-xl, font-medium with secondary font
  - Product prices: text-2xl, font-bold
  - Body text: text-base to text-lg
  - Navigation: text-sm, uppercase tracking-wide

### Layout System
**Tailwind spacing primitives**: Use units of 2, 4, 8, 12, 16, and 24 consistently
- Component padding: p-4, p-6, p-8
- Section spacing: py-12, py-16, py-24
- Grid gaps: gap-4, gap-6, gap-8
- Container max-width: max-w-7xl with px-4 margins

### Component Library

**Navigation Header**
- Sticky top navigation with logo placement (left or center)
- Navigation links with hover underline effect
- Shopping cart icon with item count badge (top-right)
- Mobile hamburger menu with slide-out drawer
- Announcement bar above header: "FREE SHIPPING ON ALL ORDERS"

**Hero Section**
- Full-width hero with lifestyle jewelry photography showing jewelry being worn
- Centered overlay with brand tagline
- Primary CTA button with blurred background treatment: "Shop Collection"
- Height: min-h-[70vh] to min-h-[85vh]

**Product Grid**
- Responsive grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Product cards with aspect-square image containers
- Hover effect revealing second product image
- Product info below image: name, regular price (strikethrough if on sale), sale price
- "Add to Cart" button appears on hover or always visible on mobile
- "Sold Out" overlay with semi-transparent treatment when unavailable
- Quick view option on hover

**Individual Product Page**
- Two-column layout: lg:grid-cols-2
- Left: Image gallery with main large image and thumbnail strip below
- Right: Product details with name, price, description, size/variation selector, quantity input, "Add to Cart" CTA
- Related products carousel below
- Product details accordion: Materials, Care Instructions, Shipping Info

**Shopping Cart**
- Slide-out drawer from right side
- Line items with thumbnail, name, price, quantity controls, remove button
- Subtotal, shipping estimate, total calculation
- "Checkout" CTA button and "Continue Shopping" link
- Empty cart state with illustration and CTA back to shop

**Checkout Process** (Stripe Integration)
- Single-page checkout or multi-step progress indicator
- Customer information form, shipping address, payment details (Stripe Elements)
- Order summary sidebar (sticky on desktop)
- Trust badges and secure payment indicators

**Featured Collections Section**
- 2-3 column grid showcasing collection categories
- Overlay titles on collection images
- Hover effect with subtle zoom or overlay darkening

**About/Story Section**
- Single column, centered max-w-3xl
- Artisan story with authentic photo of creator/workspace
- Emphasis on handmade quality and craftsmanship

**Testimonials Section**
- 3-column grid: grid-cols-1 md:grid-cols-3
- Customer photos with jewelry (if available)
- Star ratings, quote, customer name
- Subtle card treatment with minimal shadow

**Newsletter Signup**
- Full-width section with centered content
- Email input with inline submit button
- Benefit text: "Get 10% off your first order"

**Footer**
- Multi-column layout: grid-cols-2 md:grid-cols-4
- Sections: Shop, About, Customer Service, Connect
- Social media icons (Instagram, Facebook, Pinterest)
- Payment method icons
- Copyright and essential links

**Admin Dashboard** (Order Management)
- Sidebar navigation: Orders, Products, Settings
- Orders table with columns: Order #, Customer, Date, Items, Total, Status
- Click row to expand order details
- "Print Shipping Label" button for each order
- Status filter tabs: All, Pending, Shipped, Completed
- Search functionality for orders

### Icons
Use **Heroicons** via CDN for consistent iconography:
- Shopping cart, user account, menu, search
- Heart for wishlist/favorites
- Chevrons for carousels and accordions
- Check marks for features
- Star ratings for reviews

### Animations
**Minimal and purposeful**:
- Smooth scroll behavior
- Fade-in on scroll for product cards (subtle, fast)
- Hover transitions on buttons and cards: transition-all duration-300
- Cart drawer slide animation
- Image gallery transitions

### Images

**Hero Section**:
- Large lifestyle image showing jewelry being worn in natural setting (e.g., model wearing necklace and earrings, close-up of hands with rings)
- High-quality, professionally styled photography
- Dimensions: minimum 1920x1080, optimized for web

**Product Images**:
- Multiple angles per product (front, side, detail shots, worn/modeled)
- Square aspect ratio for grid consistency
- Clean backgrounds (white or subtle) for product clarity
- Detail macro shots showing craftsmanship

**Collection Banners**:
- Curated lifestyle shots representing each collection theme
- Landscape orientation for banner treatments

**About Section**:
- Authentic photo of artisan/workspace showing handmade process
- Creates personal connection and brand authenticity

**Placeholder Strategy**: Use https://placehold.co/ with appropriate dimensions until actual jewelry photos are provided

### Visual Hierarchy Principles
- Clear visual separation between sections using spacing, not heavy borders
- Product photography is the primary visual focus
- Typography creates rhythm with consistent scale jumps
- White/negative space generously used to convey luxury and focus attention
- CTAs stand out with sufficient contrast and breathing room

### Mobile Responsiveness
- Stack all multi-column layouts to single column on mobile
- Touch-friendly button sizes (minimum h-12)
- Simplified navigation with hamburger menu
- Bottom-fixed "Add to Cart" bar on product pages for mobile
- Optimized image loading with responsive srcset

This design creates a professional, trustworthy e-commerce platform that highlights the unique, handmade nature of WOW jewelry while providing seamless shopping and order management functionality.