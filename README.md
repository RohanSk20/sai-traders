# 🌿 Sai Traders – Premium Grocery Ecommerce Website

> **High-Performance Grocery Storefront with WhatsApp Business Ordering & Supabase Admin Panel**
> Built with Next.js (App Router, Turbopack) + TypeScript + Tailwind CSS + Supabase.

---

## 🌟 Key Features

### 🛒 Customer Storefront
- **Direct WhatsApp Ordering:** Customers curate their basket, provide their address and delivery slot, and checkout directly via an automated WhatsApp message to the store owner (`wa.me/91XXXXXXXXXX`).
- **Zero Payment Friction:** 100% Cash on Delivery (COD) / UPI on delivery. No forced user logins, passwords, or credit card forms.
- **Organic Visual Design System:** Dark forest green (`#1a6b3a`), organic accent yellow (`#f5c842`), warm cream background (`#fdfbf5`), editorial Playfair Display serif headings, and Inter body text.
- **Category & Listing Pages:** Filter by price range, organic badge, stock status, and sale discounts with shareable URL parameters.
- **Product Detail Pages:** High-resolution zoom gallery, variant selector, quantity stepper, info tabs (storage & origin), and sticky mobile checkout bar.
- **Pincode & Delivery Logic:** Real-time serviceable pincode verification and same-day delivery eligibility checking (2:00 PM cutoff).
- **Core Web Vitals Optimized:** Zero layout shift, next/image optimization, semantic HTML5, and full WCAG AA contrast.
- **SEO & Structured Data:** JSON-LD for Organization, LocalBusiness, WebSite (with SearchAction), ItemList, and Product with prices in INR (`₹`). Auto-generated `sitemap.xml` and `robots.txt`.

### 🛡️ Owner Admin Management (`/admin`)
- **Dashboard Overview:** Real-time counts of products, active departments, out-of-stock items, and incoming WhatsApp orders.
- **Product Inventory:** Live search, category & stock filters, add/edit form with multi-image support, price vs sale price validation, and instant one-click stock status toggles.
- **Category Management:** Curate store departments, upload thumbnails, manage sort order, and toggle visibility.
- **Bulk CSV Importer:** Upload products via CSV with a downloadable starter template, row validation, and error reporting.
- **Order Management:** Inspect incoming orders, view itemized totals & delivery slots, update status (new, confirmed, delivered, cancelled), and click **Reply on WhatsApp** to message the customer directly.

---

## 🏗️ Project Architecture

```
sai-traders/
├── public/                 # Static assets & icons
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx            # Homepage with hero, trust strip, FAQs, featured items
│   │   │   ├── shop/page.tsx       # Full catalog with desktop sidebar & mobile drawer
│   │   │   ├── category/[slug]/    # Department browse with custom intro banner
│   │   │   ├── search/page.tsx     # Full-text search with popular keyword suggestions
│   │   │   ├── product/[slug]/     # Product detail with gallery, variants & tabs (ISR 60s)
│   │   │   ├── cart/page.tsx       # Cart, delivery slot selector, & WhatsApp redirect
│   │   │   ├── design-system/      # Visual token & component preview showcase
│   │   │   ├── about/page.tsx      # Brand story & farmer partnerships
│   │   │   ├── contact/page.tsx    # Phone, WhatsApp, map, and store hours
│   │   │   ├── privacy/page.tsx    # Privacy policy
│   │   │   ├── terms/page.tsx      # Terms of service
│   │   │   └── refund/page.tsx     # Delivery timelines & replacement guarantee
│   │   ├── admin/
│   │   │   ├── page.tsx            # Dashboard overview with KPI stat cards
│   │   │   ├── login/page.tsx      # Supabase email & password authentication
│   │   │   ├── products/page.tsx   # Inventory table, modal form, CSV import
│   │   │   ├── categories/page.tsx # Department CRUD & sort ordering
│   │   │   ├── orders/page.tsx     # Order history, details modal, WhatsApp reply
│   │   │   └── layout.tsx          # Responsive admin sidebar & navigation
│   │   ├── api/
│   │   │   ├── search/route.ts     # Debounced autocomplete suggestions API
│   │   │   └── orders/route.ts     # Order persistence endpoint
│   │   ├── layout.tsx              # Root layout with fonts, GA4 & GSC tags
│   │   ├── sitemap.ts              # Dynamic XML sitemap generator
│   │   ├── robots.ts               # Robots.txt configuration
│   │   ├── not-found.tsx           # Custom 404 page
│   │   ├── loading.tsx             # Shimmer skeleton fallback
│   │   └── error.tsx               # Error boundary
│   ├── components/
│   │   ├── ui/                     # Button, Input, Badges, Stepper, Toast, etc.
│   │   ├── layout/                 # Sticky Header, Footer, CartDrawer
│   │   └── product/                # ProductCard, ProductFilters, ProductDetailView
│   ├── context/
│   │   └── CartContext.tsx         # LocalStorage persistent shopping cart state
│   ├── lib/
│   │   ├── config.ts               # Store configuration, pincodes, fee calculator
│   │   ├── db.ts                   # Supabase client helpers with mock fallback
│   │   ├── mockData.ts             # 24 seed products across 6 departments
│   │   └── supabase/               # Browser, server, and middleware clients
│   └── types/                      # Comprehensive TypeScript definitions
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  # Full SQL schema, RLS policies & seed data
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18.17+ or 20+
- npm / pnpm / yarn

### 2. Installation
```bash
cd sai-traders
npm install
```

### 3. Environment Variables
Create a `.env.local` file by copying `.env.example`:
```bash
cp .env.example .env.local
```

Configure your parameters:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Store Configuration
NEXT_PUBLIC_STORE_NAME="Sai Traders"
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GSC_VERIFICATION=your-google-verification-token
```

> **Note:** If Supabase environment variables are omitted or kept as placeholder values, the application runs automatically in **Local Fallback Mode**, allowing full inspection of the storefront, catalog, cart, and admin panel with 24 sample products!

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/design-system](http://localhost:3000/design-system) to view the design tokens.

### 5. Production Build Verification
```bash
npm run build
```

---

## 🗄️ Supabase Setup & Database Migration

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Under **Project Settings &gt; API**, copy the `Project URL` and `anon public` key to `.env.local`.

### 2. Run Database Migration
1. In your Supabase dashboard, navigate to the **SQL Editor**.
2. Click **New Query**, open `supabase/migrations/001_initial_schema.sql` from this repository, paste the contents, and click **Run**.
3. This creates:
   - `categories` table with RLS
   - `products` table with tags, full-text index, and stock flags
   - `product_images` table with foreign key cascading
   - `product_variants` table for size/weight options
   - `orders` table capturing customer submissions
   - Row Level Security (RLS) policies allowing public read and authenticated admin write
   - Sample seed records (6 departments + 24 sample items)

### 3. Set Up Storage Bucket
1. Navigate to **Storage &gt; Buckets** in the Supabase dashboard.
2. Create a bucket named `product-images`.
3. Toggle **Public Bucket** to ON so image URLs can be rendered publicly.

### 4. Create Store Owner Admin Account
1. In Supabase, go to **Authentication &gt; Users**.
2. Click **Add User &gt; Create User**.
3. Enter your admin email (e.g. `admin@saitraders.in`) and password.
4. You can now log into `/admin/login` using these credentials.

---

## 📲 WhatsApp Business Ordering Workflow

1. Customer browses `/shop` or `/category/[slug]` and adds fresh items to cart.
2. In the header cart drawer or `/cart` page, customer reviews items and fills:
   - Full Name
   - Indian Mobile Number (10 digits)
   - Delivery Address & Postal Pincode
   - Preferred Delivery Window (Today evening or Tomorrow morning/evening)
   - Optional instructions / landmark
3. Customer clicks **"Order on WhatsApp"**:
   - The order is persisted in the database with reference `ORD-XXXX`.
   - A pre-formatted WhatsApp message is generated with itemized prices, totals, customer delivery info, and order reference.
   - WhatsApp Web or the WhatsApp mobile app opens directly to the store number.
   - Customer confirms order; store owner reviews the order in `/admin/orders` and clicks **Reply on WhatsApp** to acknowledge and dispatch.

---

## 🚢 Deploying to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. In **Environment Variables**, add the keys from `.env.example`.
4. Click **Deploy**. Vercel will compile the Next.js App Router application with Turbopack and deploy to their global Edge network.

---

© 2026 Sai Traders. All rights reserved.
