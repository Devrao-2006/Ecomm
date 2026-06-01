# E-Commerce Backend Codebase Overview

This document provides a comprehensive breakdown of everything your backend codebase does, how it works, and what each function is responsible for.

## Tech Stack & Architecture Overview

Your backend is a **production-ready e-commerce API** built with the following technologies:
- **Node.js & Express.js**: Core web server and routing framework.
- **Prisma**: The ORM (Object-Relational Mapper) used to interact with the **PostgreSQL** database.
- **Redis**: Used for rate-limiting and caching.
- **Stripe**: Integrated for payment processing.
- **Google OAuth 2.0**: Allows users to log in using their Google accounts.
- **JWT (JSON Web Tokens)**: Used for secure authentication and session management.

The codebase follows a **Modular Architecture**, where features are split into distinct, self-contained directories inside `src/modules` (e.g., Auth, Cart, Order, Product, User, Payment, Admin).

---

## 1. Data Models (Database Schema)

Your database is managed by Prisma (`prisma/schema.prisma`) and contains the following entities:

- **User**: Stores user details (name, email, hashed password, roles). Handles local auth and OAuth (`provider`), verification tokens, and admin approval status.
- **Product**: Represents items in the store. Includes details like price, stock, images, category, and whether it is active.
- **Cart & CartItem**: Stores a user's current shopping cart and the specific products/quantities added to it.
- **Order & OrderItem**: Created when a user checks out. Tracks total amount, payment status, and a snapshot of the items purchased (price and quantity).
- **payments & transactions**: Tracks Stripe payment intents, amounts, statuses, and individual transaction events (e.g., charge, refund).
- **audit_logs**: Records significant actions performed in the system for security and tracing.
- **verification_events**: Logs email verification events, blocked logins, and IPs for security auditing.

---

## 2. The Core System (`src/core`)

This directory houses the foundational logic that is reused across all modules.

### Middleware (`src/core/middleware`)
Middlewares intercept requests before they reach the controllers to perform checks:
- **`authMiddleware.js`**: Checks the `accessToken` cookie. If valid, decodes the JWT, finds the user in the database, and attaches user info (id, roles, verification status) to `req.user`.
- **`verifiedMiddleware.js`**: Ensures that the authenticated user has verified their email address and has been approved by an admin (if `requireAdminApproval` is enabled).
- **`adminMiddleware.js`**: (Assuming standard implementation) Checks if `req.user.roles` includes the "admin" role.
- **`rateLimiter.js`**: Uses Redis to limit the number of requests a user/IP can make in a given timeframe to prevent abuse (DDoS or brute force).
- **`validate.js`**: Uses `express-validator` to ensure incoming request bodies match expected schemas.
- **`upload.js`**: Uses `multer` to handle multipart/form-data for file uploads (e.g., product images).

### Utilities (`src/core/utils`)
Helper functions used throughout the application:
- **`jwt.js`**: Contains functions to `signAccessToken`, `signRefreshToken`, and verify them.
- **`password.js`**: Contains `hashPassword` (using bcrypt) and `comparePassword`.
- **`logger.js`**: A logging utility (likely Winston or Pino) used to print formatted info/error messages to the console instead of `console.log`.
- **`emailTemplates.js`**: HTML templates for sending emails (verification, order confirmation).
- **`auditLog.js`**: Functions to write entries into the `audit_logs` and `verification_events` tables.
- **`token.js`**: Generates random cryptographic tokens for email verification.

### Errors (`src/core/errors`)
- **`AppError.js`**: A custom Error class that allows setting HTTP status codes alongside error messages.
- **`errorHandler.js`**: The global error-catching middleware. It formats any thrown `AppError` into a standard JSON response (`{ success: false, message: ... }`).

---

## 3. Modules & Functions (`src/modules`)

Each module handles a specific business domain. A module typically contains:
- **`.routes.js`**: Defines the API endpoints and which middleware/controller to run.
- **`.controller.js`**: Contains the actual business logic (the "functions" handling the request).
- **`.service.js`** (Optional): Complex logic separated from the controller.

### A. Auth Module (`src/modules/auth`)
Handles everything related to user identity.
- **`register`**: Checks if email exists. Hashes password. Creates `User` in DB. Generates verification token. Sends verification email. Returns 202 status.
- **`login`**: Finds user by email. Compares hashed password. Checks if email is verified and admin approved. Generates JWT Access & Refresh tokens. Sets cookies. Returns user data.
- **`verifyEmail`**: Takes a token from the URL, validates it against the database, marks the user as `emailVerified: true`, logs them in (sets cookies), and redirects to the frontend.
- **`resendVerificationHandler`**: Generates a new verification token and resends the email.
- **`adminApproveUserHandler`**: Allows an admin to approve a pending user account.
- **`refreshToken`**: Takes the long-lived refresh token from cookies, validates it, and issues a new access token (keeping the user logged in without requiring a password).
- **`logout`**: Clears the refresh token from the database and deletes the auth cookies from the browser.
- **`handleGoogleCallback`**: Handles the final step of Google OAuth, creating tokens for the Google-authenticated user and setting cookies.

### B. Product Module (`src/modules/product`)
Handles the product catalog.
- **`product.controller.js`**: Contains functions to:
  - Fetch all products (with pagination, filtering, and caching via Redis).
  - Fetch a single product by ID.
  - Create a new product (Admin only).
  - Update a product (Admin only).
  - Delete a product (Admin only).
- **`product.cache.js`**: Logic to interact with Redis to store and retrieve product data quickly without hitting PostgreSQL every time.

### C. Cart Module (`src/modules/cart`)
Manages the user's shopping cart.
- **`cart.controller.js`**:
  - Fetch the user's current cart.
  - Add an item to the cart (checks product stock, creates a `Cart` if one doesn't exist, adds/updates `CartItem`).
  - Update cart item quantities.
  - Remove an item from the cart.
  - Clear the entire cart.

### D. Order Module (`src/modules/order`)
Converts carts into finalized orders.
- **`order.controller.js`**:
  - Create an order from the current cart. Calculates totals, creates `Order` and `OrderItem` records, and clears the cart.
  - Fetch a user's past orders.
  - Fetch order details by ID.
  - Update order status (e.g., from 'pending' to 'shipped') (Admin only).

### E. Payment Module (`src/modules/payment`)
Integrates with Stripe.
- Likely contains functions to create a Stripe Payment Intent (returning a client secret to the frontend), and webhooks to listen for Stripe events (successful payment, failed payment) to update the `Order` and `payments` tables accordingly.

### F. User Module (`src/modules/user`)
Handles user profile management.
- **`user.controller.js`**: Functions to get the current user's profile, update their details (name, etc.), and (for admins) list all users or change user roles.

### G. Admin Module (`src/modules/admin`)
Aggregated administrative actions (dashboard stats, user management).

---

## 4. Initialization & Configuration (`src/config`)

- **`app.js`**: The Express application setup. It configures CORS, helmet (security headers), morgan (logging), cookie parser, initializes Passport (OAuth), and mounts all the module routes under `/api/...`.
- **`server.js`**: The main entry point (`npm run dev`). It imports `app.js`, starts listening on a port (e.g., 5000), and sets up graceful shutdown handlers for closing DB connections if the server stops.
- **`db.prisma.js`**: Initializes the Prisma Client singleton used to query PostgreSQL.
- **`redis.js`**: Connects to the Redis server used for caching and rate limiting.
- **`mailer.js`**: Configures Nodemailer to send emails.
- **`stripe.js`**: Initializes the Stripe SDK with your secret key.
- **`google.js`**: Configures Passport.js with the Google OAuth 2.0 strategy.
- **`env.js`**: Centralizes access to `.env` variables, ensuring they exist and providing defaults.

---

## The Lifecycle of a Request (How it all works together)

Let's look at what happens when a user tries to view their cart:

1. **Client Request**: Frontend sends a `GET /api/cart` request. Because they logged in earlier, the browser automatically includes the `accessToken` cookie.
2. **Server Routing**: `app.js` sees the `/api/cart` route and passes it to the middlewares defined there: `authMiddleware` and `verifiedMiddleware`.
3. **Authentication**: `authMiddleware` reads the cookie, verifies the JWT, finds the user in Prisma, and attaches them to `req.user`.
4. **Verification**: `verifiedMiddleware` checks if `req.user.emailVerified` is true.
5. **Controller Execution**: The request reaches `cart.controller.js` (e.g., `getCart` function).
6. **Database Query**: The controller uses `prisma.cart.findUnique({ where: { userId: req.user.id }, include: { items: true } })` to fetch the cart.
7. **Response**: The controller returns the cart data as JSON to the client.
8. **Error Handling**: If the database crashes during step 6, an error is thrown. The global `errorHandler` catches it, logs it, and returns a clean `500 Internal Server Error` JSON to the frontend instead of crashing the server.
