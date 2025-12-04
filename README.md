# 🛍️ E-Commerce Platform

A full-stack e-commerce platform built with Next.js 15, featuring a comprehensive admin panel, multiple payment integrations, and modern state management.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-316192)

## ✨ Features

### 🛒 Customer Features
- **Product Browsing**: Browse products by categories and subcategories
- **Shopping Cart**: Real-time cart management with Zustand
- **Wishlist**: Save favorite products for later
- **Multiple Payment Options**:
  - Stripe (International payments)
  - eSewa (Nepal)
  - Khalti (Nepal)
- **User Authentication**:
  - Email/Password login
  - Google OAuth integration
- **Order Tracking**: View order history and status

### 🎛️ Admin Panel
- **Dashboard**: Overview of sales, orders, and analytics
- **User Management**: View and manage customer accounts
- **Product Management**: 
  - Add, edit, and delete products
  - Upload product images
  - Manage inventory
- **Category Management**: Create and organize product categories
- **Subcategory Management**: Manage product subcategories
- **Order Management**: 
  - View all orders
  - Update order status
  - Process refunds

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React

### Backend
- **Database**: PostgreSQL
- **ORM**: Prisma 6
- **Authentication**: NextAuth v5
- **API**: Next.js API Routes

### Payment Integration
- **Stripe**: International credit/debit cards
- **eSewa**: Nepal digital wallet
- **Khalti**: Nepal digital wallet

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL
- npm or yarn or pnpm

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/sagargautam500/eccomerce-site-fullstack-nextjs.git
cd ecommerce-site
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# eSewa
ESEWA_MERCHANT_ID="your-esewa-merchant-id"
ESEWA_SECRET_KEY="your-esewa-secret"

# Khalti
KHALTI_PUBLIC_KEY="your-khalti-public-key"
KHALTI_SECRET_KEY="your-khalti-secret-key"
```

4. **Setup Database**
```bash
# Generate Prisma Client
npx prisma generate

# push
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

5. **Run Development Server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
ecommerce-site/
├── prisma/
│   ├── schema.prisma
│   
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── admin/
│   │   │   ├── categories/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   ├── subcategories/
│   │   │   └── users/
│   │   ├── api/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── products/
│   │   ├── profile/
│   │   └── wishlist/
│   ├── components/
│   │   ├── admin/
│   │   └── ui/
│   ├── lib/
│   ├── store/
│   └── types/
├── .env
├── .env.local
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🔐 Authentication

### Email/Password
Users can register and login using email and password. Passwords are securely hashed using bcrypt.

### Google OAuth
One-click login with Google account integration via NextAuth v5.

## 💳 Payment Integration

### Stripe
For international customers accepting credit/debit cards worldwide.

### eSewa
Popular digital wallet in Nepal. Supports bank transfers and eSewa balance.

### Khalti
Another popular payment gateway in Nepal with wide merchant acceptance.

## 🎨 Admin Panel Access

Access the admin panel at `/admin`
```
admin panel require email and password.which is contact need to developer
```

## 🛠️ Development

### Build for Production
```bash
npm run build
npm start
```

## 📝 API Routes

### Public APIs
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get product by ID
- `GET /api/categories` - Get all categories
- `POST /api/auth/register` - Register new user
- `POST /api/checkout` - Process payment

### Protected APIs (Require Authentication)
- `POST /api/cart` - Manage cart items
- `POST /api/wishlist` - Manage wishlist
- `GET /api/orders` - Get user orders
- `GET /api/user/profile` - Get user profile

### Admin APIs (Require Admin Role)
- all are server action.not make to api for admin panel

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
The application can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- AWS
- DigitalOcean

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Sagar Gautam**
- GitHub: [@sagargautam500](https://github.com/sagargautam500)
- Gmail: sagargautam389@gmail.com

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Stripe Documentation](https://stripe.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

## 📞 Support

For support, email your.email@example.com or create an issue in the repository.

---

⭐ If you find this project helpful, please give it a star!