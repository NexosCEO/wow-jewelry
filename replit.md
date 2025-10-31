# WOW Jewelry E-Commerce Platform

## Overview

WOW Jewelry is a handmade artisan jewelry e-commerce platform built as a full-stack web application. The platform enables customers to browse a curated collection of handcrafted jewelry pieces including necklaces, earrings, bracelets, and rings, add items to a shopping cart, and complete purchases through integrated payment processing. The application features a clean, elegant design inspired by modern e-commerce aesthetics, with a focus on showcasing product photography and providing a smooth checkout experience.

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

**Design System** (Updated October 2025)
- Warm luxury color palette: champagne/beige backgrounds (hsl 33 42% 96%) instead of stark white
- Responsive grid layouts using Tailwind breakpoints (sm≤640, md≤768, lg≥1024, xl)
- Elevation system using CSS custom properties (--elevate-1, --elevate-2)
- Consistent spacing scale based on Tailwind units (2, 4, 8, 12, 16, 24)
- Custom border radius values (sm: 3px, md: 6px, lg: 9px)
- Hover and active state treatments with backdrop filters and opacity changes
- Mobile-first responsive header with hamburger menu (80-96px height)
- Compact logo sizing (40-48px height) for professional appearance
- Hero section with warm gradient (champagne-to-cream) and prominent CTA button

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
- **Orders Table**: Customer information, shipping address, order items (stored as JSON), payment tracking (Stripe payment intent ID), order status, timestamps
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

**Design Assets**
- Google Fonts CDN for Inter, Montserrat, and Playfair Display
- Product images stored in `/attached_assets/generated_images/` directory
- Design guidelines documented in `design_guidelines.md` with references to lalahairbrand.com and Etsy aesthetics