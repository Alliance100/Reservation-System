# EcoTravel - Integrated Sustainable Reservation Platform

EcoTravel is a full-stack, eco-conscious travel reservation platform that brings together sustainable travel options—including Eco Hotels, EV Buses, Nature Tours, and Green Flights—into a unified monorepo ecosystem.

---

## Architecture and Monorepo Structure

The platform is structured into dedicated frontend applications and a centralized REST API:

```
Reservation System/
├── apps/
│   ├── customer/        # Customer Portal (Next.js - Port 3000)
│   ├── supplier/        # Supplier Dashboard (Next.js - Port 3001)
│   └── admin/           # Admin Management Panel (Next.js - Port 3002)
├── backend/             # RESTful API Server (Node.js/Express - Port 5000)
│   ├── config/          # MongoDB Connection & Configurations
│   ├── controllers/     # API Route Controllers (Auth, Search, Booking, Commerce, Admin, Supplier)
│   ├── middleware/      # Auth (JWT) & Role-based Authorization Middleware
│   ├── models/          # Mongoose Schemas (User, Property, Bus, Tour, Flight, Booking, Coupon)
│   └── routes/          # Express Endpoints
└── README.md
```

---

## Technology Stack

- Frontend: Next.js 14 (App Router), React, Tailwind CSS, Google Outfit Typography
- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose ODM)
- Authentication: JWT (JSON Web Tokens), Bcrypt password hashing, Role-Based Access Control (customer, supplier, admin)
- State Management: React Context API (AuthProvider, CartProvider) with localStorage persistence

---

## Milestone Progress and Implemented Features

### Milestone 1: Foundation and Authentication (Completed)
- Multi-Role Authentication: Secure registration and login for customer, supplier, and admin roles.
- Security and Privilege Hardening: Client-side role tampering prevented; role field sanitized on registration and profile update.
- Session Persistence: JWT-based session management across page refreshes with race-condition prevention in Next.js router.
- Role-Based Routing: Protected routes and role-aware navigation headers.

### Milestone 2: Multi-Category Inventory and Dynamic Search (Completed)
- 4 Core Inventory Categories:
  - Eco Hotels and Hostels: Multi-room configuration, capacity, nightly pricing, and amenities.
  - EV Buses: Operators, routes (origin/destination), schedules, seat capacity, and amenities.
  - Nature Tours: Multi-day itineraries, group capacities, inclusions, and pickup points.
  - Carbon-Offset Flights: Airlines, flight numbers, origins/destinations, flight duration, and fare classes.
- Dynamic Search and Filtering: Real-time search across categories by destination/location, price range, and sorting options (price asc/desc, rating).
- Search Suggestions: Instant destination autocomplete populated dynamically from active database inventory.
- Product Detail Pages: Dynamic individual detail views for each inventory category with rich information display.

### Milestone 3: UI and Eco-Branding (Completed)
- EcoTravel Brand Identity: Clean green theme with glassmorphism touches and responsive layout.
- Hero Search Widget: Category switcher tabs and fast destination search.
- Context-Aware Pricing: Dynamic label formatting (per night, per seat, per person, per ticket).
- Responsive Layout: Mobile-friendly navigation, sticky search headers, and unified footer.

### Milestone 4: Cart and Booking Flow (Completed)
- Persistent Slide-Over Cart: Add to cart across different categories, adjust quantities, and remove items with real-time subtotal calculation.
- Server-Side Validation: Atomic inventory check and validation prior to reservation.
- Customer Bookings Dashboard (/bookings): Real-time order tracking, booking reference IDs, status badges (pending, confirmed, completed, cancelled), and instant booking cancellation with inventory replenishment.

### Milestone 5: Commerce Rules and Checkout (Completed)
- Promo Code and Discount Engine: Percentage (%) and fixed amount ($) coupon discounts with validation and expiration checks.
- Simulated Payment Gateway: Card number validation (mock 4242 gateway simulation) and order generation.
- Customer Profile (/profile): Manage personal profile information and travel details.

### Milestone 6: Supplier and Admin Dashboards (Completed)
- Supplier Portal (apps/supplier - Port 3001):
  - Inventory Overview: Track active listings and metrics.
  - Full Inventory CRUD: Create, read, update, and delete listings for Hotels, Buses, Tours, and Flights.
  - Form Enhancements: Departure/arrival datetime scheduling and real-time image upload preview.
  - Booking Management: View and manage customer reservations for supplier-owned inventory.
- Admin Management Panel (apps/admin - Port 3002):
  - System Overview: Global metrics for total revenue, platform bookings, registered users, and active coupons.
  - User Management: View all users, change user roles (customer <-> supplier <-> admin), and delete accounts.
  - Global Booking Control: Comprehensive order status management (confirmed, completed, cancelled).
  - Coupon Management: Create new discount codes with expiration dates and delete existing coupons.

---

## Remaining Roadmap and Future Enhancements (Milestone 7+)

The following features and enhancements are planned for future development:

### 1. Payment Gateway and Invoicing
- [ ] Integration with real payment processors (Stripe / PayPal SDKs and Webhooks).
- [ ] Automated PDF invoice and ticket generation downloadable from the Customer Dashboard.

### 2. Cloud Media Storage
- [ ] Direct file upload integration with cloud storage (AWS S3 / Cloudinary / Firebase Storage) replacing local base64 images.

### 3. Notifications and Email Alerts
- [ ] Automated transactional emails for booking confirmations, cancellations, and status changes via Nodemailer / SendGrid.
- [ ] In-app notification center for real-time order updates.

### 4. Verified Reviews and Ratings
- [ ] Post-travel review and star rating submission restricted to users with completed bookings.
- [ ] Average rating recalculation and customer feedback display on product pages.

### 5. Maps and Geolocation
- [ ] Interactive map view (Mapbox / Leaflet / Google Maps) on Hotel and Tour detail pages.
- [ ] Geolocation-based nearby eco-stays and route visualization for buses.

### 6. Testing and DevOps
- [ ] End-to-end (E2E) automated testing suite using Cypress / Playwright.
- [ ] Unit and integration test coverage for backend API controllers using Jest and Supertest.
- [ ] Docker containerization (Dockerfile, docker-compose.yml) for multi-container deployment.
- [ ] CI/CD pipeline setup via GitHub Actions.

---

## Getting Started and Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB database (local or MongoDB Atlas cluster)

### 1. Environment Setup
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Create a `.env.local` file in each app directory (`apps/customer/`, `apps/supplier/`, `apps/admin/`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies
Run from the root directory:
```bash
npm run install-all
```

### 3. Seed Initial Inventory and Coupons (Optional)
To populate sample data across categories:
```bash
npm run seed
```

### 4. Run the Platform
Start the backend and all frontend portals concurrently:
```bash
npm run dev
```

- Customer Portal: `http://localhost:3000`
- Supplier Portal: `http://localhost:3001`
- Admin Panel: `http://localhost:3002`
- API Server: `http://localhost:5000`

---

## Default Test Accounts

| Role | Email | Password | Portal |
|---|---|---|---|
| Admin | admin@ecotravel.com | password123 | http://localhost:3002 |
| Supplier | supplier@ecotravel.com | password123 | http://localhost:3001 |
| Customer | customer@ecotravel.com | password123 | http://localhost:3000 |

