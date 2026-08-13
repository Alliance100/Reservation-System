# Integrated Reservation System

This is a full-stack reservation system built with Next.js (Frontend) and Node.js/Express (Backend).

## Overview
This repository contains the codebase for the reservation platform that allows customers to search, compare, reserve, pay, view orders, and request post-booking actions for various travel products.

## Technology Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **Authentication:** JWT, bcryptjs
- **Payment:** Stripe (Upcoming)

## Prerequisites
- Node.js v18+
- MongoDB instance (Atlas or local)

## Getting Started

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   node server.js
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend `.env`
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `NODE_ENV`

### Frontend `.env.local`
- `NEXT_PUBLIC_API_URL`
