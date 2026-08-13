# Integrated Reservation System

This is a reservation platform that brings several travel products into one application. Customers can search, compare, and reserve different types of travel options like hotels, buses, tours, and flights.

## Technology Stack

The project is built using a modern JavaScript stack:
- Frontend: Next.js with Tailwind CSS for styling.
- Backend: Node.js and Express.
- Database: MongoDB.
- Authentication: JWT and bcrypt.

## Current Progress

We are building this project in phases. So far, we have completed the first two milestones:

Milestone 1: Foundation
We set up the project structure, separating the frontend and backend. We also implemented a complete authentication system with registration and login, including role-based access control for customers, suppliers, and admins. The frontend now has a layout with navigation and secure session handling.

Milestone 2: Inventory and Search
We created the database models for our four main travel categories: properties (hotels), buses, tours, and flights. We added a script to populate the database with realistic sample data. We also built the search API and the corresponding frontend pages to search and view detailed information for each travel product.

## Upcoming Work

- Milestone 3: Cart and Booking. We will build the checkout flow for reserving items.
- Milestone 4: Commerce Rules. We will add promo codes, payments, and order tracking.
- Milestone 5: Operations. We will build the admin and supplier dashboards.
- Milestone 6: Quality Assurance. Final testing and deployment preparation.

## How to Run the Project

You will need Node.js and a MongoDB database to run this project.

1. First, make sure you have your environment variables set up. 
In the backend folder, create a .env file based on .env.example with your MongoDB connection string and a secret key for JWT. 
In the frontend folder, create a .env.local file based on .env.example.

2. Install all dependencies from the root of the project:
npm run install-all

3. If this is your first time, you should populate the database with sample data:
cd backend
node seeder.js
cd ..

4. Start both the frontend and backend servers at the same time:
npm run dev

The frontend will be running on port 3000 and the backend API will be running on port 5000.

## Testing User Roles

The system supports customer, supplier, and admin roles. The dedicated admin panel will be built in a later milestone, but you can prepare an admin account now. Just register a normal account on the frontend, then open your MongoDB database and manually change your user's role field from "customer" to "admin".
