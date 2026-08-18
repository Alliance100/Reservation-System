# EcoTravel - Integrated Sustainable Travel & Reservation Platform

EcoTravel is a full-stack, eco-conscious travel reservation platform that brings together sustainable travel options—including Eco Hotels, EV Buses, Nature Tours, and Green Flights—into a unified monorepo ecosystem.

---

## 🏛️ Architecture and Monorepo Structure

The platform is structured into dedicated frontend applications and a centralized REST API:

```
Reservation System/
├── apps/
│   ├── customer/        # Customer Portal & Booking Center (Next.js - Port 3000)
│   ├── supplier/        # Supplier Workspace & Listing Operations (Next.js - Port 3001)
│   └── admin/           # Admin Master Control Panel (Next.js - Port 3002)
├── backend/             # RESTful API Server (Node.js/Express - Port 5000)
│   ├── config/          # MongoDB Connection & Configurations
│   ├── controllers/     # API Route Controllers (Auth, Search, Booking, Commerce, Admin, Supplier, Review)
│   ├── middleware/      # Auth (JWT) & Role-based Authorization Middleware
│   ├── models/          # Mongoose Schemas (User, Property, Bus, Tour, Flight, Booking, Coupon, Review)
│   ├── routes/          # Express Endpoints
│   └── utils/           # Email Service & Helper Utilities
├── docker-compose.yml   # Multi-Container Orchestration (Mongo, Backend, 3 Frontend Portals)
└── README.md
```

---

## 🚀 Technology Stack

- **Frontend**: Next.js 14 / App Router, React, Tailwind CSS, Google Outfit Typography
- **Backend**: Node.js, Express.js, Nodemailer
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens), Bcrypt password hashing, Role-Based Access Control (`customer`, `supplier`, `admin`)
- **State Management**: React Context API (`AuthProvider`, `CartProvider`, `WishlistProvider`) with persistent storage
- **Containerization**: Docker, Docker Compose

---

## 📦 Test Credentials

All test accounts share the standard password `password123`:

| Role | Email | Password | Primary Portal |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ecotravel.com` | `password123` | [http://localhost:3002](http://localhost:3002) |
| **Supplier** | `supplier@ecotravel.com` | `password123` | [http://localhost:3001](http://localhost:3001) |
| **Customer** | `customer@ecotravel.com` | `password123` | [http://localhost:3000](http://localhost:3000) |

---

## ✨ Complete Feature Matrix & Implemented Milestones

### 1. Multi-Role Authentication & Security
- **Secure Registration & Login**: Multi-role support (`customer`, `supplier`, `admin`).
- **Privilege Hardening**: Client-side role tampering prevented; role field strictly sanitized on user registration and profile updates.
- **Session Persistence**: JWT-based session management across page refreshes with race-condition prevention in Next.js router.
- **Role-Aware Navigation**: Adaptive navbars customized for each role.

### 2. Multi-Category Inventory & Dynamic Search
- **4 Core Inventory Categories**:
  - **Eco Hotels & Hostels**: Multi-room configuration, capacity, nightly pricing, and verified green amenities.
  - **EV Buses**: Operators, routes (origin/destination), schedules, seat capacity, and charging stops.
  - **Nature Tours**: Multi-day itineraries, group capacities, inclusions, and pickup points.
  - **Carbon-Offset Flights**: Airlines, flight numbers, origins/destinations, flight duration, and fare classes.
- **Dynamic Search & Filtering**: Real-time multi-category search with price range filtering and sorting (price asc/desc, rating).
- **Search Suggestions**: Instant destination autocomplete populated dynamically from active database inventory.

### 3. Cart, Commerce & Discount Engine
- **Persistent Slide-Over Cart**: Add to cart across different categories, adjust quantities, and remove items with real-time subtotal calculation.
- **Promo Code & Discount Engine**: Percentage (%) and fixed amount ($) coupon discounts with validation and expiration checks. Editable and toggleable by admins.
- **Simulated Payment Gateway**: Card number validation (gateway simulation) and order generation.

### 4. Verified Reviews & Ratings
- **Post-Travel Reviews**: Review submission restricted to users with completed bookings only.
- **Interactive 5-Star Rating Picker**: Star display and comment form on detail pages.
- **Duplicate Review Prevention**: One review per user per item enforced at both database and API level.
- **Automated Recalculation**: Parent item's rating field is updated automatically after every new review.

### 5. Live Notifications & Audio Chime
- **Navbar Notification Bell**: Persistent notification center in Admin and Supplier navbars with unread badge counter.
- **Web Audio Notification Chime**: Synthesized audio chime plays automatically when a new booking arrives in the background.
- **Floating Arrival Banner**: Top-right animated alert with 1-click navigation directly to the booking.

### 6. PDF Travel Voucher & Invoice Generator
- **Printable & Downloadable Travel Ticket**: 1-click generation on the `/bookings` page.
- **Official Itinerary Header**: Includes EcoTravel branding, booking reference ID, lead passenger details, itemized schedule, and price summary.
- **Simulated QR Verification Code**: Scannable QR code for instant check-in at hotels or EV bus boarding.
- **Print-Optimized Layout**: Clean print CSS (`@media print`) for PDF saving and printing.

### 7. Interactive Eco Maps (OpenStreetMap)
- **Live Location Map**: Embedded map view on Hotel (`/hotel/[id]`) and Tour (`/tour/[id]`) detail pages.
- **Nearby Green Transit & Amenities**: Displays nearby EV charging stations, solar bike share stations, organic farm markets, and trailheads.
- **Live Navigation Button**: 1-click link to Google Maps / Apple Maps directions.

### 8. Saved Wishlist / Favorites (❤️)
- **Wishlist Provider**: Persistent bookmarking engine saving favorites to local storage.
- **Quick Heart Toggle**: Bookmark stays, flights, buses, and tours directly from search results.
- **Slide-Over Wishlist Drawer**: View and book saved adventures anytime from the top navbar.

### 9. Carbon Offset Impact Calculator & Badges
- **CO₂ Savings Tracker**: Real-time carbon offset calculation ($kg\text{ CO}_2\text{ saved}$) on bookings and customer profile.
- **Eco-Rank Badges**: Tiered achievement badges (*"Green Explorer"*, *"Eco Voyager"*, *"Earth Guardian"*) based on lifetime carbon savings.

### 10. Visual Analytics & SVG Charts
- **Revenue Trajectory Curve**: Visual SVG revenue chart with gradient curves on Supplier and Admin dashboards.
- **Category & Status Distribution**: Real-time breakdown of listing volume and booking fulfillment states.

### 11. 1-Click CSV / Excel Data Export
- **Export Bookings CSV**: Export customer order records with totals and timestamps.
- **Export Inventory CSV**: Export active supplier listings.
- **Export Users & Coupons CSV**: Complete admin spreadsheet export.

### 12. Automated Transactional Emails
- **Nodemailer Integration (`backend/utils/emailService.js`)**:
  - HTML Booking Confirmation receipt sent to customer upon checkout.
  - Booking status update alerts sent to customer when status changes to Confirmed, Completed, or Cancelled.
  - Safe development fallback with simulated console preview.

### 13. Docker & Docker Compose Containerization
- **Multi-Container Orchestration**:
  - `mongodb`: MongoDB database on port 27017 with persistent volume `mongo_data`.
  - `backend`: REST API on port 5000.
  - `customer`: Customer portal on port 3000.
  - `supplier`: Supplier portal on port 3001.
  - `admin`: Admin portal on port 3002.

---

## 🛠️ Getting Started & Installation

### Option A: Local Development

#### 1. Install Dependencies
```bash
npm run install-all
```

#### 2. Seed Initial Database (Optional)
```bash
npm run seed
```

#### 3. Start All Services
```bash
# Terminal 1: Backend API (Port 5000)
cd backend && npm run dev

# Terminal 2: Customer Portal (Port 3000)
cd apps/customer && npm run dev

# Terminal 3: Supplier Workspace (Port 3001)
cd apps/supplier && npm run dev

# Terminal 4: Admin Control Center (Port 3002)
cd apps/admin && npm run dev
```

---

### Option B: Docker Compose

Launch the entire ecosystem with a single command:
```bash
docker compose up --build
```
- Customer Portal: [http://localhost:3000](http://localhost:3000)
- Supplier Portal: [http://localhost:3001](http://localhost:3001)
- Admin Portal: [http://localhost:3002](http://localhost:3002)
- Backend API: [http://localhost:5000](http://localhost:5000)
