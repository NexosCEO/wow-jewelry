# WOW Jewelry E-Commerce Platform

## Overview

WOW Jewelry (WOW by Dany) is a handmade artisan jewelry e-commerce platform built as a full-stack web application. Live site: https://wowbydany.com The platform enables customers to browse a curated collection of handcrafted jewelry pieces including necklaces, earrings, bracelets, and rings, add items to a shopping cart, and complete purchases through integrated payment processing. The application features a clean, elegant design inspired by modern e-commerce aesthetics, with a focus on showcasing product photography and providing a smooth checkout experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing (alternative to React Router)
- TanStack Query (React Query) for server state management and API data fetching

**UI Component System**
- Shadcn/ui component library built on Radix UI primitives for accessibility
- Tailwind CSS for utility-first styling with custom design tokens
- Component configuration follows the "new-york" style variant
- CSS variables for theming with light/dark mode support
- Custom fonts: Inter/Montserrat for body text, Playfair Display for serif accents

**State Management**
- Local React state for UI interactions (cart drawer, image selection)
- LocalStorage for cart persistence across sessions
- TanStack Query for API response caching with infinite stale time (no automatic refetching)
- Context providers for toast notifications and tooltips

**Design System - Rose-Gold Theme** (Updated October 2025)
- **Rose-Gold Core Palette** (easily customizable at top of index.css):
  - Soft blush pink (#e9b3b7) for accents and gradients
  - Warm brushed gold (#caa55b) for primary actions and highlights
  - Deeper rose (#d78895) and gold (#a8832f) for contrast and shadows
  - Warm charcoal (#3a362f) for text, warm muted (#6f6a60) for secondary text
  - Off-white card backgrounds (#fbf8f3) with warm borders (#ece6dc)
  - Clean white (#ffffff) base background
- **Gradient Accents**: Rose-to-gold gradient used for:
  - Announcement bar (90deg gradient)
  - Primary CTA buttons (Shop Collection, Add to Cart, Apply Filters, Place Order) with 135deg gradient
  - Cart count badge uses solid gold (#caa55b) with dark charcoal text for proper contrast
- **Accessibility**: All gradient CTAs meet WCAG AA contrast requirements (≥4.5:1)
  - Hero/Filter/Checkout buttons: dark charcoal (#2b211b) on rose-gold gradient (≥4.5:1)
  - Cart badge: warm charcoal (#3a362f) on gold background (≈5.6:1)
- **Typography**: Serif headings (Playfair Display) with bold weight, sans-serif body (Inter)
  - Product card titles use serif font at text-lg for luxury hierarchy
- **Rounded Elements**: xl border radius (14px) for cards, full rounded buttons for primary CTAs
- **Card Hover Effects**: Lift animation (-translate-y-1) with shadow increase on hover
- **Product Cards**: Show category, serif titles, gradient gold Add to Cart button, hover image swap
- **Footer**: Dark charcoal (#0f0d0b) with warm link colors (#f0e7d6)
- **Filter System**: Type, Sort, Max Price filters with instant results
- Responsive grid layouts using Tailwind breakpoints (sm≤640, md≤768, lg≥1024, xl)
- Elevation system using CSS custom properties (--elevate-1, --elevate-2)
- Mobile-first responsive header with hamburger menu

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript with ES modules for type safety and modern JavaScript features
- Custom middleware for request logging with response timing and JSON capture
- Vite integration in development mode for SSR-like capabilities

**API Design**
- RESTful endpoints under `/api` prefix
- Product CRUD operations: GET all products, GET single product, POST/PUT/DELETE
- Order management: GET all orders, GET single order, POST create order, PATCH update status
- Stripe webhook endpoint for payment confirmation with raw body verification
- Validation using Zod schemas derived from Drizzle ORM table definitions

**Data Storage Strategy**
- In-memory storage implementation (MemStorage class) for development/demo purposes
- Interface-based storage abstraction (IStorage) allowing future database implementation
- Sample product data initialization with realistic jewelry items
- UUID generation for entity identifiers

**Security Implementation** (Added October 2025)
- Helmet middleware for security headers protecting against common web vulnerabilities
- Content Security Policy (CSP) configured to allow Stripe domains while blocking unauthorized resources
  - Stripe domains whitelisted: js.stripe.com, m.stripe.com, m.stripe.network, hooks.stripe.com
  - Google Fonts, local resources, and data URIs permitted for styling
- Rate limiting with two-tier approach:
  - General API endpoints: 100 requests per 15 minutes per IP
  - Payment endpoints: 10 requests per 15 minutes per IP (stricter protection)
- Visual security indicators on checkout page (lock icons, SSL badges, Stripe branding)
- Security headers include XSS protection, clickjacking prevention, and MIME-type sniffing protection

### Database & ORM

**ORM Configuration**
- Drizzle ORM for type-safe database queries and schema management
- PostgreSQL as the target database dialect (via @neondatabase/serverless)
- Schema-first approach with TypeScript inference for types
- Drizzle Kit for migration generation in `./migrations` directory

**Schema Design**
- **Products Table**: Core product information with pricing (regular and sale), images (primary and secondary), category, inventory tracking
- **Orders Table**: Customer information, shipping address, order items (stored as JSON), payment tracking (Stripe payment intent ID), order status, shipping label data (tracking number, label URL, carrier), timestamps
- Decimal precision for monetary values (10 digits, 2 decimal places)
- UUID primary keys using PostgreSQL's `gen_random_uuid()`
- Default values for boolean flags and timestamps

**Type Safety**
- Zod schemas generated from Drizzle table definitions using `createInsertSchema`
- Exported TypeScript types for Product, InsertProduct, Order, InsertOrder
- CartItem interface combining Product with quantity for shopping cart

### External Dependencies

**Payment Processing**
- Stripe integration for payment processing (API version 2025-10-29.clover)
- Client-side: @stripe/stripe-js and @stripe/react-stripe-js for payment UI
- Server-side: Stripe Node.js SDK for payment intent creation and webhook handling
- Environment-based initialization (graceful degradation if STRIPE_SECRET_KEY not provided)
- Payment Elements for modern, responsive payment form
- Webhook signature verification for secure payment confirmation

**Database Service**
- Neon serverless PostgreSQL (@neondatabase/serverless package)
- Connection via DATABASE_URL environment variable
- WebSocket-based connections for serverless deployment compatibility

**Session Management**
- connect-pg-simple for PostgreSQL-backed session storage
- Session data persisted in database for stateful authentication (prepared for future implementation)

**UI Libraries**
- Radix UI primitives for 20+ accessible component patterns (dialogs, dropdowns, popovers, etc.)
- Lucide React for consistent icon set
- class-variance-authority (CVA) for component variant management
- clsx and tailwind-merge for conditional class name composition
- cmdk for command palette functionality
- date-fns for date formatting and manipulation
- react-day-picker for calendar/date selection
- vaul for mobile-friendly drawer components
- embla-carousel-react for image carousels

**Development Tools**
- @replit/vite-plugin-runtime-error-modal for error overlay in Replit environment
- @replit/vite-plugin-cartographer for file system visualization
- @replit/vite-plugin-dev-banner for development environment indicator
- tsx for running TypeScript directly in development
- esbuild for production server bundling

**Shipping & Email Services** (Added November 2025)
- **Shippo API Integration**: Shipping label generation for USPS, UPS, FedEx, DHL
  - Automatic rate comparison and selection of cheapest carrier
  - PDF shipping labels printable on regular or thermal printers
  - Tracking number generation and storage
  - API key required: SHIPPO_API_KEY (stored in secrets)
  - Ship-from address configurable via environment variables (SHIP_FROM_ADDRESS, SHIP_FROM_CITY, SHIP_FROM_STATE, SHIP_FROM_ZIP)
- **SendGrid Email Integration**: Transactional email notifications
  - Customer order confirmation and shipping notification emails
  - Admin notification system (to be implemented)
  - Professional HTML email templates with order details and tracking
  - API key required: SENDGRID_API_KEY (stored in secrets)
  - From email configurable via SENDGRID_FROM_EMAIL environment variable
- **NOTE**: User declined to use Replit's SendGrid connector integration, preferring manual API key management

**Admin Dashboard** (Added November 2025)
- Accessible at `/admin` route for order management
- **Authentication**: Protected by ADMIN_ACCESS_KEY secret (Bearer token authentication)
  - Admin must enter access key to view dashboard
  - All privileged endpoints require valid admin token
  - Prevents unauthorized access to order data and shipping/email operations
- Features:
  - View all orders with customer information and shipping details
  - One-click shipping label generation via Shippo API
  - Download and print labels as PDF (works with regular printers or thermal label printers like DYMO LabelWriter 4XL)
  - Send customer notifications with tracking information
  - Order status tracking (pending → shipped)
  - Tracking number and carrier information display

**Design Assets**
- Google Fonts CDN for Inter, Montserrat, and Playfair Display
- Product images stored in `/attached_assets/generated_images/` directory
- Design guidelines documented in `design_guidelines.md` with references to lalahairbrand.com and Etsy aesthetics