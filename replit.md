# WOW Jewelry E-Commerce Platform

## Overview
WOW Jewelry (WOW by Dany) is a full-stack e-commerce platform for handmade artisan jewelry. It allows customers to browse collections, add items to a cart, and complete purchases. The platform emphasizes elegant design, product photography, and a smooth checkout experience, aiming to provide a high-quality online shopping experience for unique handcrafted jewelry.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (November 30, 2025)
### Bead Size Management System (COMPLETED)
- **Size Field in Database**: Added `size` field to bracelet_beads table to support multiple size variants per bead type
- **Separate Size Entries**: Each bead size is a separate database entry with its own price and inventory (e.g., "Basic Gold Bead" with size="4mm" at $1.00, "5mm" at $1.50, "6mm" at $2.00)
- **Admin Management**: Admin can edit prices and inventory for each bead size independently through the Inventory tab
- **Dynamic Pricing**: BraceletBuilder pulls bead sizes and prices directly from the database instead of using hardcoded values
- **Size Selector**: Beads are grouped by name/color with a dropdown to select size, showing price for each option
- **Cart Integration**: Selected bead sizes are correctly added to cart with proper pricing

## Previous Changes (November 29, 2025)
### Alternative Payment Methods (COMPLETED)
- **Zelle Payment Option**: Customers can choose to pay via Zelle at checkout with instructions to send payment to phone number 201-908-1726
- **Cash Payment Option**: Available only for Local Pickup orders, customers can pay in cash when picking up their order
- **Payment Status Tracking**: New database fields `paymentMethod` (stripe/zelle/cash) and `paymentStatus` (pending/paid/pending_payment) track payment state
- **Admin Payment Confirmation**: Admin dashboard shows pending payment orders with prominent "Confirm Payment Received" button
- **Payment Method Badges**: Orders display payment method (Zelle/Cash icons) and payment status badges in admin dashboard
- **Order Flow**: Zelle and Cash orders are created with "pending_payment" status, admin confirms when payment is received which updates status to "paid" and order status to "confirmed"

## Previous Changes (November 24, 2025)
### Gmail Integration for Order Notifications (COMPLETED)
- **Gmail API Integration**: Connected Gmail API to send order notifications directly from client's Gmail account
- **Automatic Email Notifications**: Emails sent automatically when orders are placed through ANY payment method
- **Comprehensive Order Details**: Notifications include customer info, items ordered, shipping details, and order total
- **Test Endpoint**: Added `/api/test-email` for admins to verify email functionality is working

### Stripe Webhook Integration (COMPLETED)
- **Webhook Endpoint**: Added `/api/stripe-webhook` endpoint to automatically create orders for ALL Stripe payment methods
- **Universal Payment Support**: Now captures payments from CashApp, payment links, manual dashboard payments, and any other Stripe payment method
- **Cart in Metadata**: Payment intents now include full cart items in metadata for accurate order creation
- **Duplicate Prevention**: Webhook processes each payment intent only once
- **Automatic Coupon Tracking**: Webhook increments coupon usage count when orders are created
- **Tax Fix**: Corrected tax retrieval from payment intent metadata (was incorrectly looking at Stripe automatic tax field)

## Previous Changes (November 23, 2025)
### Coupon Management System (COMPLETED)
- **Database-Driven Coupons**: Replaced hardcoded discounts with full database-backed coupon management system
- **Secure Stripe Integration**: Server-side coupon validation and discount calculation prevents price manipulation. Coupon metadata sent to Stripe for tracking and reconciliation
- **Admin Dashboard**: New Coupons tab with full CRUD operations (create, read, update, delete) for managing discount codes
- **Coupon Features**: Support for percentage and fixed discounts, minimum purchase requirements, usage limits, expiry dates, and active/inactive status
- **Order Tracking**: Orders now store coupon code and discount amount for reporting and auditing
- **Security**: All discount calculations done server-side in payment intent creation to prevent client-side manipulation

### Previous Changes (November 7, 2025)
- **Cart Removal Fix**: Implemented robust cart data sanitization on app load to filter out corrupted items missing proper IDs. Added try-catch error handling for localStorage parsing.
- **Clear Cart Feature**: Added "Clear Cart" button with shadcn AlertDialog confirmation to prevent accidental deletion. Uses dedicated handler with single toast notification.
- **Checkout Payment Form - Circular Dependency Fix**: Fixed critical bug where payment form never appeared. Added useEffect in parent Checkout component (lines 372-381) that automatically sets `addressComplete` when all 5 address fields are filled, breaking the circular dependency where payment intent required addressComplete but addressComplete was only set inside the form that needed clientSecret.
- **Fixed Sales Tax Implementation**: Implemented 8.75% fixed sales tax on all orders. Tax is calculated on subtotal + shipping, displayed as separate line item in checkout, included in payment total, and saved with each order. Replaced Stripe automatic tax (incompatible with Payment Intents API) with reliable client-side calculation.
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