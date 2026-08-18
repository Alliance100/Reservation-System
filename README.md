# EcoTravel Reservation System

EcoTravel is an enterprise-grade, full-stack sustainable travel and reservation platform. The system operates as a unified monorepo containing three dedicated Next.js web applications and a centralized Node.js/Express REST API.

---

## Live Deployments

| Component | Production URL | Description |
| :--- | :--- | :--- |
| **Customer Portal** | https://ecotravel-reservation-system.vercel.app | Public-facing customer reservation and booking platform |
| **Supplier Portal** | https://supplier-ecotravel.vercel.app | Partner operations portal for inventory and listing management |
| **Admin Portal** | https://admin-ecotravel.vercel.app | Master administrative control panel and platform governance |
| **REST API Server** | https://reservation-api-nine.vercel.app | Centralized REST API engine and database gateway |

---

## Monorepo Architecture

```
Reservation System/
├── apps/
│   ├── customer/        # Customer Portal (Next.js App Router, Port 3000)
│   ├── supplier/        # Supplier Operations Portal (Next.js App Router, Port 3001)
│   └── admin/           # Administrative Control Center (Next.js App Router, Port 3002)
├── backend/             # Centralized REST API (Node.js/Express, Port 5000)
│   ├── config/          # Database connection and environment orchestration
│   ├── controllers/     # Business logic handlers
│   ├── middleware/      # Authentication, authorization, and validation middleware
│   ├── models/          # Mongoose database schemas
│   ├── routes/          # API endpoint routers
│   ├── utils/           # Helper utilities and email transport
│   ├── server.js        # Express application entrypoint
│   └── vercel.json      # Vercel serverless deployment specification
├── docker-compose.yml   # Multi-container local orchestration
└── README.md            # System documentation
```

---

## Technology Stack

### Frontend Applications
- **Framework**: Next.js 15/16 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS with custom responsive design tokens
- **Typography**: Google Outfit and Inter font families
- **Icons & Visuals**: Inline SVG icon systems and CSS glassmorphism
- **State Management**: React Context API (`AuthProvider`, `CartProvider`, `WishlistProvider`) with persistent storage

### Backend API
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) with Bcrypt password hashing
- **File & Media Storage**: Cloudinary integration
- **Email Delivery**: Nodemailer with HTML transactional email templates
- **Deployment Adapter**: Vercel Serverless Functions (`@vercel/node`)

---

## System Portals and Functional Specifications

### 1. Customer Portal (`apps/customer`)
- **Global Search & Filter Engine**: Multi-category search querying hotels, flights, tours, and buses simultaneously with filters for price ranges, destination, dates, and ratings.
- **Dynamic Product Pages**: Dedicated detail views for each vertical with image galleries, amenities, interactive OpenStreetMap location views, and real-time availability checks.
- **Persistent Cart & Wishlist**: Slide-over cart drawer and persistent wishlist storage supporting cross-category multi-item checkout.
- **Unified Checkout System**: Multi-step checkout with coupon validation, dynamic tax and carbon offset calculations, and simulated payment gateway processing.
- **Booking Management**: Comprehensive reservation dashboard displaying upcoming and historical bookings with cancellation workflows and inventory restoration.
- **Single-Page PDF Vouchers**: Print-optimized travel vouchers and receipts with official itinerary details, passenger metadata, and verification QR codes.
- **Verified Customer Reviews**: 5-star rating and commentary system restricted to verified travelers who have completed bookings.
- **Carbon Offset Tracker**: Real-time carbon savings indicator ($kg\text{ CO}_2$ offset) and customer eco-tier ranking badges.

### 2. Supplier Partner Portal (`apps/supplier`)
- **Partner Registration & Governance**: Dedicated onboarding flow requiring account verification by platform administrators before activation.
- **Multi-Category Inventory Management**: Complete CRUD operations for:
  - Eco Hotels (room types, capacities, nightly rates, verified green amenities)
  - EV Buses (operators, schedules, route origins/destinations, seat layouts)
  - Nature Tours (multi-day itineraries, group sizes, guides, pickup points)
  - Green Flights (airlines, flight numbers, fare classes, emissions ratings)
- **Reservation Operations**: Real-time order queue with status update controls (Pending, Confirmed, Completed, Cancelled).
- **Audio Notification Dispatcher**: Web Audio API chime that sounds upon receiving new bookings in real time.
- **Analytics & Revenue Reporting**: Trajectory charts, occupancy metrics, and CSV data export capabilities.

### 3. Administrative Control Panel (`apps/admin`)
- **System Dashboard**: High-level platform analytics including gross merchandise value (GMV), active bookings, supplier metrics, and category distributions.
- **Supplier Verification Management**: Review queue for pending supplier applications with instant approve/reject capabilities and reason logging.
- **User Governance**: Searchable user directory with role inspection (`customer`, `supplier`, `admin`) and status toggling.
- **Universal Order Management**: Platform-wide booking audit with status override permissions and customer receipt generation.
- **Coupon & Promotion Management**: Creation, configuration, and expiration management for percentage and fixed-amount discount codes.
- **Data Export Engine**: One-click CSV export for bookings, inventory catalogs, and user databases.

---

## Domain Modules and Inventory Categories

### Stays and Accommodations
- Schema supports property classification, room configurations, max guest capacity, pricing per night, location coordinates, and sustainable amenities (solar power, greywater recycling, zero-waste dining).

### Aviation and Flights
- Schema supports flight numbers, carrier airlines, origin/destination airport codes, departure/arrival timestamps, aircraft type, seat class options, and carbon offset calculations.

### Tours and Guided Experiences
- Schema supports multi-day itineraries, difficulty ratings, certified eco-guides, group capacity thresholds, equipment provisions, and designated meeting points.

### Intercity Ground Transit
- Schema supports electric vehicle bus operators, route corridors, boarding/drop-off stops, departure schedules, seat availability, and charging checkpoint intervals.

---

## Security, Authorization and Validation Architecture

- **Role-Based Access Control (RBAC)**: Enforces strict route-level and API-level separation between `customer`, `supplier`, and `admin` roles via JWT verification middleware.
- **Supplier Verification Gate**: Unverified supplier accounts cannot log in or manage inventory until approved by an administrator (`isVerified: true`, `verificationStatus: 'approved'`).
- **Dynamic CORS Policy**: Configured to dynamically authorize local development environments and all `*.vercel.app` production and preview deployments, preventing unauthorized cross-origin requests.
- **Request Boundary Protection**: JSON and URL-encoded body limits restricted to 2MB to prevent denial-of-service payload attacks.
- **Input Validation**: Strict schema-level validation, numerical bounds checking on quantities (1 to 20), rating bounds (1 to 5), phone number format enforcement, and booking status enum checks.
- **Inventory Safety**: Cancellation handlers automatically replenish room and seat counts across all inventory categories.

---

## Database Schemas

The application utilizes MongoDB with the following Mongoose schemas:

- **User**: Name, email, hashed password, role (`customer`, `supplier`, `admin`), phone, company name, verification status (`pending`, `approved`, `rejected`), timestamps.
- **Hotel**: Title, supplier reference, location, address, coordinates, description, amenities, images, rating, review count, room types (name, price, capacity, total rooms, available rooms).
- **Flight**: Flight number, airline, supplier reference, origin, destination, departure time, arrival time, duration, price, total seats, available seats, aircraft, cabin class.
- **Tour**: Title, supplier reference, destination, duration, price, max group size, available spots, difficulty, inclusions, itinerary, images, rating.
- **Bus**: Operator, bus number, supplier reference, origin, destination, departure time, arrival time, price, total seats, available seats, amenities, bus type.
- **Booking**: Customer reference, item category, item reference, booking details (dates, room type, seats, passengers), contact information, pricing breakdown (subtotal, discount, tax, total), status (`pending`, `confirmed`, `completed`, `cancelled`), payment status, reference code.
- **Coupon**: Code, discount type (`percentage`, `fixed`), discount value, minimum purchase amount, expiration date, active state, usage count.
- **Review**: User reference, target item ID, target model (`Hotel`, `Tour`), rating (1-5), comment, timestamps.

---

## REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new customer or apply as a supplier
- `POST /api/auth/login` - Authenticate user, verify status, and issue JWT
- `GET /api/auth/me` - Retrieve current authenticated user profile
- `PUT /api/auth/profile` - Update user profile details

### Search & Discovery (`/api/search`)
- `GET /api/search` - Unified multi-category search with filters
- `GET /api/search/suggestions` - Auto-complete destination suggestions

### Commerce & Checkout (`/api/commerce`)
- `POST /api/commerce/validate-coupon` - Validate promotional coupon code

### Bookings (`/api/bookings`)
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/my-bookings` - Retrieve authenticated customer bookings
- `GET /api/bookings/:id` - Retrieve individual booking details
- `PUT /api/bookings/:id/cancel` - Cancel booking and restore inventory

### Supplier Operations (`/api/supplier`)
- `GET /api/supplier/listings` - Retrieve listings owned by authenticated supplier
- `POST /api/supplier/listings` - Create new listing
- `PUT /api/supplier/listings/:id` - Update existing listing
- `DELETE /api/supplier/listings/:id` - Remove listing
- `GET /api/supplier/bookings` - Retrieve supplier customer orders
- `PUT /api/supplier/bookings/:id/status` - Update booking status

### Administration (`/api/admin`)
- `GET /api/admin/stats` - Platform statistical summary
- `GET /api/admin/users` - User directory
- `PUT /api/admin/users/:id/verify` - Approve or reject supplier verification
- `GET /api/admin/bookings` - Global booking directory
- `PUT /api/admin/bookings/:id/status` - Administrative status override
- `GET /api/admin/coupons` - List promotional coupons
- `POST /api/admin/coupons` - Create new coupon
- `DELETE /api/admin/coupons/:id` - Delete coupon

### Reviews (`/api/reviews`)
- `POST /api/reviews` - Submit review for completed booking
- `GET /api/reviews/:itemId` - Retrieve verified reviews for an item

---

## Default Test Accounts

All accounts use the default password `password123`:

| Role | Email | Password | Primary Portal |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@ecotravel.com` | `password123` | https://admin-ecotravel.vercel.app |
| **Verified Supplier** | `supplier@ecotravel.com` | `password123` | https://supplier-ecotravel.vercel.app |
| **Demo Customer** | `customer@ecotravel.com` | `password123` | https://ecotravel-reservation-system.vercel.app |

---

## Local Development and Setup

### Prerequisites
- Node.js (v18.x or later)
- npm (v9.x or later)
- MongoDB instance (local or MongoDB Atlas connection string)

### 1. Installation
Clone the repository and install all workspace dependencies:
```bash
git clone https://github.com/Alliance100/Reservation-System.git
cd Reservation-System
npm run install-all
```

### 2. Configure Local Environment Variables

Create `.env` in `backend/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/reservation_system
JWT_SECRET=your_development_jwt_secret_key
CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud_name>
```

Create `.env.local` in `apps/customer/`, `apps/supplier/`, and `apps/admin/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Seed Database
Populate the database with sample hotels, flights, tours, buses, coupons, and test users:
```bash
npm run seed
```

### 4. Run Development Servers
Start all four services simultaneously:
```bash
npm run dev
```

Or start services individually:
```bash
# Backend API (Port 5000)
cd backend && npm run dev

# Customer Portal (Port 3000)
cd apps/customer && npm run dev

# Supplier Portal (Port 3001)
cd apps/supplier && npm run dev

# Admin Portal (Port 3002)
cd apps/admin && npm run dev
```

---

## Production Deployment on Vercel

The monorepo deploys to Vercel as four independent projects linked to the same repository:

### 1. Deploy Backend API
- **Project Name**: `reservation-api`
- **Root Directory**: `backend`
- **Framework Preset**: `Other`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `MONGO_URI`: MongoDB Atlas connection string
  - `JWT_SECRET`: Production secret key
  - `CLOUDINARY_URL`: Cloudinary API string
  - `FRONTEND_URL_CUSTOMER`: `https://ecotravel-reservation-system.vercel.app`
  - `FRONTEND_URL_SUPPLIER`: `https://supplier-ecotravel.vercel.app`
  - `FRONTEND_URL_ADMIN`: `https://admin-ecotravel.vercel.app`

### 2. Deploy Customer Portal
- **Project Name**: `ecotravel-reservation-system`
- **Root Directory**: `apps/customer`
- **Framework Preset**: `Next.js`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: `https://reservation-api-nine.vercel.app/api`

### 3. Deploy Supplier Portal
- **Project Name**: `supplier-ecotravel`
- **Root Directory**: `apps/supplier`
- **Framework Preset**: `Next.js`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: `https://reservation-api-nine.vercel.app/api`

### 4. Deploy Admin Portal
- **Project Name**: `admin-ecotravel`
- **Root Directory**: `apps/admin`
- **Framework Preset**: `Next.js`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: `https://reservation-api-nine.vercel.app/api`

---

## License

This project is licensed under the ISC License.
