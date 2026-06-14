# Ecommerce Platform

A full-stack ecommerce application with separate buyer and seller experiences — buyers can browse and purchase products, while sellers can manage their own product catalog, orders, and earnings.

**Live App:** [https://ecommerce-frontend-dp4t.onrender.com/](https://ecommerce-frontend-dp4t.onrender.com/)

## Tech Stack

### Frontend
- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS v4** for styling
- **Zustand** for state management (cart, auth, etc.)
- **React Hook Form** + **Zod** for form handling and validation
- **Axios** for API requests
- **Firebase** (client SDK) for authentication

### Backend
- **NestJS 11** (Node.js) with **TypeScript**
- **MongoDB** with **Mongoose** for data persistence
- **Firebase Admin SDK** for authentication/authorization
- **Passport** (Bearer strategy) for guarding protected routes
- **Cloudinary** for product image storage
- **Razorpay** for payment processing
- **Multer** for handling multipart/form-data file uploads
- **class-validator** / **class-transformer** for DTO validation

### Deployment
- Hosted on **Render** (separate web services for frontend and backend, configured via `render.yaml`)

## Tools Used

- **Firebase Authentication** — email/password and session management for buyers and sellers
- **Firebase Admin SDK** — server-side token verification
- **Cloudinary** — image hosting/CDN for product photos
- **Razorpay** — payment gateway (cards, UPI, netbanking, wallets, EMI, and Cash on Delivery)
- **MongoDB Atlas** — cloud-hosted database
- **Git/GitHub** — version control with feature-branch workflow
- **Claude Code** - ran a claude code session to build the frontend

## Features

### Buyer
- Browse products with search, category filters, and sorting
- Product detail pages with images, ratings, and stock info
- Shopping cart with quantity management
- Checkout flow with shipping address and multiple payment methods (UPI, card, netbanking, wallet, EMI, Cash on Delivery) via Razorpay
- Order history with order status tracking and order cancellation
- Toast notifications for order confirmation and key actions
- Buyer profile management

### Seller
- Seller registration with bank account/payout details
- Seller dashboard with sales overview
- Product management — create, edit, and delete products
  - Inline category creation (no need to pre-define categories)
  - Multi-image upload (stored on Cloudinary) instead of pasting image URLs
- Order management for products sold
- Earnings tracking with platform fee breakdown (gross amount, fees, net payout)
- Seller settings (bank/payout details)

### General
- Role-based access (buyer vs. seller) backed by Firebase Auth + guarded API routes
- Responsive UI built with Tailwind CSS
- Category browsing across the storefront

## Project Structure

```
ecommerce/
├── backend/   # NestJS API (auth, products, categories, orders, payments, earnings, checkout)
└── frontend/  # Next.js app (buyer & seller experiences)
```

```
This application is deployed on **Render**
```