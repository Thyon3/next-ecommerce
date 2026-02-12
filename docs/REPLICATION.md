# Thyonx Project Migration

## Overview
This project "Thyonx" is a migration/rebrand of the "Bitex" e-commerce platform.

## Features Replicated
The following features have been successfully replicated from the original `bitex-main` codebase:

### 1. Product Detail Page
- Full product information display
- Image gallery with zoom functionality
- Product specifications
- User reviews section
- Similar products recommendation
- Responsive layout

### 2. Shopping Cart (Checkout)
- Redux-based state management (`shoppingCart.ts`)
- Cart drawer with animation
- Add to Cart functionality
- Quantity management
- Local storage persistence

### 3. Product List & Search
- Category filtering
- Brand filtering
- Price range filtering
- Sorting options
- Search functionality (Enhanced in Thyonx)

### 4. Design & Branding
- Updated logo to "Thyonx"
- Consistent font usage (Outfit)
- Responsive navigation bar and footer
- "Thyonx" branding across all metadata and UI elements

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS (v4)
- Redux Toolkit
- Prisma (MongoDB)

## Setup
1. Configure `.env` with `DATABASE_URL`, `NEXTAUTH_SECRET`, `IMG_URL`.
2. Run `npm install`.
3. Run `npx prisma db push` and `npx prisma db seed`.
4. Start dev server: `npm run dev`.
