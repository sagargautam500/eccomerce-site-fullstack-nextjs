
## Folder Structure:

📦 e-commerce/
├── 📁 prisma/
│   ├── schema.prisma           # Prisma schema definition
│   ├── migrations/             # Auto-generated migrations
│
├── 📁 src/
│   ├── 📁 app/
│   │   ├── layout.tsx          # Root layout (common UI)
│   │   ├── page.tsx            # Homepage
│   │   ├── 📁 (auth)/          # Group routes for authentication
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── 📁 (shop)/          # Public shop routes
│   │   │   ├── page.tsx        # Product listing
│   │   │   └── [productId]/page.tsx  # Single product page
│   │   ├── 📁 (cart)/page.tsx  # Cart page (client-side, Zustand)
│   │   ├── 📁 (checkout)/page.tsx  # Payment checkout page
│   │   ├── 📁 (profile)/page.tsx   # User profile (requires NextAuth)
│   │   ├── 📁 admin/               # Admin panel routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── 📁 products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit.tsx
│   │   │   └── 📁 orders/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts   # NextAuth setup
│   │   │   ├── products/route.ts             # CRUD endpoints
│   │   │   ├── orders/route.ts               # Order handling
│   │   │   ├── payment/route.ts              # Stripe/Khalti webhook
│   │   │   └── users/route.ts                # Admin user routes
│   │   └── proxy.ts                          # For API route proxy (replacing middleware)
│   │
│   ├── 📁 components/
│   │   ├── ui/               # Reusable UI components (buttons, modals, inputs)
│   │   ├── layout/           # Navbar, Footer, Sidebar, Header
│   │   ├── cart/             # Cart-related UI components
│   │   ├── product/          # Product card, product filter, product list
│   │   └── admin/            # Admin dashboard components
│   │
│   ├── 📁 hooks/
│   │   ├── useCart.ts        # Cart logic with Zustand
│   │   ├── useUser.ts        # Current user data
│   │   └── useFilter.ts      # Product filter logic
│   │
│   ├── 📁 lib/
│   │   ├── prisma.ts         # Prisma client instance
│   │   ├── auth.ts           # NextAuth config helper
│   │   ├── payment.ts        # Payment helper (Stripe/Khalti)
│   │   ├── utils.ts          # General utility functions
│   │   └── constants.ts      # App constants
│   │
│   ├── 📁 store/
│   │   ├── cartStore.ts      # Zustand store for cart
│   │   ├── filterStore.ts    # Zustand store for product filters
│   │   ├── themeStore.ts     # Zustand store for light/dark mode
│   │   └── userStore.ts      # Zustand store for current user session (optional)
│   │
│   ├── 📁 types/
│   │   ├── product.ts        # Product-related types
│   │   ├── user.ts           # User-related types
│   │   ├── order.ts          # Order-related types
│   │   └── index.ts
│   │
│   ├── 📁 styles/
│   │   ├── globals.css       # Tailwind global styles
│   │   └── admin.css         # Admin panel custom styles
│   │
│   └── 📁 config/
│       ├── siteConfig.ts     # App-wide metadata, titles, SEO
│       └── env.ts            # Environment variables (safe config)
│
├── .env                      # Environment variables (DB_URL, NEXTAUTH_SECRET, etc.)
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
├── package.json
└── README.md

