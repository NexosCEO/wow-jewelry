# WOW Jewelry E-Commerce Platform

## Overview
WOW Jewelry (WOW by Dany) is a full-stack e-commerce platform for handmade artisan jewelry. It allows customers to browse collections, add items to a cart, and complete purchases. The platform emphasizes elegant design, product photography, and a smooth checkout experience, aiming to provide a high-quality online shopping experience for unique handcrafted jewelry.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (November 7, 2025)
### Bug Fixes - Cart and Checkout (COMPLETED & VERIFIED)
- **Cart Removal Fix**: Implemented robust cart data sanitization on app load to filter out corrupted items missing proper IDs. Added try-catch error handling for localStorage parsing.
- **Clear Cart Feature**: Added "Clear Cart" button with shadcn AlertDialog confirmation to prevent accidental deletion. Uses dedicated handler with single toast notification.
- **Checkout Payment Form - Circular Dependency Fix**: Fixed critical bug where payment form never appeared. Added useEffect in parent Checkout component (lines 372-381) that automatically sets `addressComplete` when all 5 address fields are filled, breaking the circular dependency where payment intent required addressComplete but addressComplete was only set inside the form that needed clientSecret.
- **Stripe Payment Intent API Fix**: Removed unsupported `automatic_tax` parameter from payment intent creation that was causing 500 errors. Tax calculations disabled until Stripe Tax is manually configured in Stripe Dashboard.
- **Error Handling**: Enhanced null safety checks throughout cart operations with proper optional chaining and validation.

## System Architecture

### Frontend
- **Frameworks**: React 18 with TypeScript, Vite for bundling, Wouter for routing, TanStack Query for server state.
- **UI/UX**: Shadcn/ui (Radix UI based) with Tailwind CSS for styling, "new-york" style variant, CSS variables for theming (light/dark mode), custom fonts (Inter/Montserrat, Playfair Display).
- **State Management**: Local React state, LocalStorage for cart persistence, TanStack Query for API caching, Context for notifications.
- **Design System**: Rose-Gold theme with a core palette of blush pink, warm gold, and charcoal. Features include gradient accents for CTAs, WCAG AA accessibility, serif headings, rounded elements, card hover effects, product card design with image swap, responsive layouts, and a mobile-first header.

### Backend
- **Server**: Express.js with TypeScript and ES modules.
- **API**: RESTful endpoints for product CRUD, order management, and Stripe webhooks, validated using Zod schemas.
- **Data Storage**: PostgreSQL (Neon serverless) for persistent storage, with Drizzle ORM for type-safe queries. Sample data seeding via `server/seed.ts`.
- **Security**: Helmet middleware, Content Security Policy (CSP) whitelisting Stripe domains, two-tier rate limiting (100 req/15 min general, 10 req/15 min payment), visual security indicators on checkout.

### Database & ORM
- **ORM**: Drizzle ORM for PostgreSQL.
- **Schema**: Tables for Products (pricing, images, inventory) and Orders (customer info, shipping, payment tracking, order status, shipping details, tax amount). Uses UUID primary keys and decimal precision for monetary values.
- **Shipping**: Mandatory $5.99 shipping fee for standard orders; free local pickup option. Shipping method selection at checkout dynamically updates payment intent.
- **Type Safety**: Zod schemas and TypeScript types generated from Drizzle definitions.

### Admin Dashboard
- **Access**: `/admin` route protected by `ADMIN_ACCESS_KEY` (Bearer token).
- **Features**:
    - **Orders Tab**: View and manage orders, generate shipping labels via Shippo, send customer notifications, track order status.
    - **Inventory Tab**: Real-time product stock management with increment/decrement, visual stock indicators, and automatic inventory deduction on order placement.

## External Dependencies

### Payment Processing
- **Stripe**: `@stripe/stripe-js` and `@stripe/react-stripe-js` for client-side UI, Stripe Node.js SDK for server-side logic, Payment Elements for forms, webhook signature verification.
- **Stripe Tax**: Automatic sales tax calculation based on customer shipping address. Tax amount displayed in checkout summary and stored in orders. Requires Stripe Tax to be enabled in Stripe Dashboard (Settings → Tax) with business location and tax registrations configured.

### Database Service
- **Neon serverless PostgreSQL**: `@neondatabase/serverless` package for database connection.

### Session Management
- **connect-pg-simple**: For PostgreSQL-backed session storage (future authentication).

### UI Libraries
- **Radix UI**: Accessible component primitives.
- **Lucide React**: Icon set.
- **class-variance-authority (CVA)**: Component variant management.
- **clsx**, **tailwind-merge**: Conditional class name utilities.
- **cmdk**: Command palette.
- **date-fns**: Date manipulation.
- **react-day-picker**: Calendar component.
- **vaul**: Mobile-friendly drawers.
- **embla-carousel-react**: Image carousels.

### Shipping & Email Services
- **Shippo API**: Integration for shipping label generation (USPS, UPS, FedEx, DHL), rate comparison, tracking number generation. Configurable via `SHIPPO_API_KEY` and ship-from address environment variables.
- **SendGrid API**: Transactional email notifications (order confirmation, shipping notifications). Configurable via `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`.

### Development Tools
- Replit-specific Vite plugins: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`.
- **tsx**: TypeScript execution.
- **esbuild**: Production server bundling.

### Design Assets
- **Google Fonts CDN**: Inter, Montserrat, Playfair Display.
- **Product Images**: Stored in `/attached_assets/generated_images/`. Requires `./deploy.sh` to copy to `dist/attached_assets/` for production.