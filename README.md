# Ecomm Platform

A full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js), featuring secure authentication, payment processing with Stripe, and a comprehensive admin dashboard.

## Features

- **User Authentication**: Secure signup and login using JWT and Google OAuth.
- **Product Management**: Browse, search, and filter products.
- **Shopping Cart**: Real-time cart management.
- **Checkout Process**: Secure payments integration with Stripe.
- **Admin Dashboard**: Manage products, orders, and view analytics.
- **Responsive Design**: Modern UI built with Tailwind CSS.

## Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS, CSS Modules
- **State Management**: Context API
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Payments**: Stripe.js & React Stripe.js

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose), PostgreSQL (via pg)
- **Authentication**: Passport.js (Google OAuth), JWT (JSON Web Tokens)
- **Security**: Helmet, Express Rate Limit, BCryptJS
- **Payments**: Stripe API

## Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [PostgreSQL](https://www.postgresql.org/) (If utilized for specific modules)

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/ecomm
POSTGRES_URL=postgresql://user:password@localhost:5432/ecomm

# Authentication (JWT)
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Client URL (CORS)
CLIENT_URL=http://localhost:5173

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=/api/auth/google/callback
```

Create a `.env` file in the `frontend` directory:

```env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ecomm
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file as shown above
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Create .env file as shown above
   npm run dev
   ```

## Running the Application

- **Backend**: Runs on `http://localhost:5000` (default)
- **Frontend**: Runs on `http://localhost:5173` (Vite default)

## Scripts

### Root
- No scripts defined in root currently.

### Backend
- `npm run dev`: Start server with Nodemon
- `npm start`: Start server in production mode
- `npm run lint`: Run ESLint

### Frontend
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
