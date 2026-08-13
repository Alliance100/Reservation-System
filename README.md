# EcoTravel - Integrated Reservation System

This is a full-stack reservation marketplace built with Next.js (Frontend) and Node.js/Express (Backend), focused on eco-friendly travel products including Hotels, EV Buses, Nature Tours, and Flights.

## Overview
This repository contains the codebase for a scalable reservation platform. It allows customers to seamlessly search, compare, and eventually reserve various travel products all within one unified interface.

## Technology Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS v4, Google Fonts (Outfit)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **Authentication:** JWT (JSON Web Tokens), bcryptjs
- **Payment:** Stripe (Upcoming - M4)

---

## 🚀 Features Implemented So Far

### Milestone M-1: Foundation & Authentication
- **Monorepo Architecture:** Clean separation of `frontend` and `backend` in a single repository.
- **Secure Authentication:** Full registration and login workflows with password hashing (`bcryptjs`) and secure JWT generation.
- **Role-Based Access Control (RBAC):** Built-in support for `customer`, `supplier`, and `admin` roles, protected via backend middleware.
- **Session Persistence:** Custom React `AuthProvider` Context that automatically validates and restores user sessions across browser refreshes.

### Milestone M-2: Inventory & Search
- **Data Modeling:** Distinct, robust Mongoose schemas for `Property` (Hotels/Hostels), `Bus`, `Tour`, and `Flight`.
- **Database Seeder:** Automated mock data injection script (`backend/seeder.js`) for instant inventory testing.
- **Global Search API:** A unified backend search controller that filters inventory by type, location, and price ranges.
- **Custom UI/UX Theme:** 
  - Implementation of a custom "Green/White" aesthetic (`emerald` palette).
  - Integration of modern "Outfit" typography.
  - Tabbed Search Hero Section and dynamic `ProductCard` components.
- **Dedicated Detail Pages:** Responsive, unique layouts for Hotel, Bus, Tour, and Flight detail views.

---

## Prerequisites
- Node.js v18+
- MongoDB instance (Atlas or local)

## Getting Started (Single Command Run)

We have configured `concurrently` in the root folder, allowing you to run both the frontend and backend servers simultaneously with one command.

### 1. Environment Setup
**Backend:**
Navigate to `backend/` and copy `.env.example` to `.env`. Ensure your MongoDB connection string is set:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/reservation_system
JWT_SECRET=your_secret_here
```

**Frontend:**
Navigate to `frontend/` and copy `.env.example` to `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies
In the root directory of the project, run:
```bash
npm run install-all
```
*(This command will install root dependencies, then install backend and frontend dependencies automatically).*

### 3. Seed the Database
To populate your MongoDB with the mock travel inventory for testing:
```bash
cd backend
node seeder.js
cd ..
```

### 4. Start the Application
In the root directory, simply run:
```bash
npm run dev
```
- The **Frontend** will be available at: `http://localhost:3000`
- The **Backend API** will be available at: `http://localhost:5000`

---

## Project Structure
```text
/
├── backend/
│   ├── config/          # DB connections
│   ├── controllers/     # Route logic (Auth, Search)
│   ├── middleware/      # JWT protection & Role validation
│   ├── models/          # Mongoose Schemas (User, Property, Bus, Tour, Flight)
│   ├── routes/          # Express Routers
│   ├── seeder.js        # Data seeding script
│   └── server.js        # Express entry point
├── frontend/
│   ├── src/app/         # Next.js App Router pages (Search, Auth, Detail pages)
│   ├── src/components/  # Reusable UI components (Navbar, AuthProvider)
│   └── ...
└── package.json         # Root workspace commands
```
