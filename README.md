# PromptLens - AI Product Photography Marketplace

A premium marketplace for AI-powered product photography prompts. Buyers can purchase expert-crafted prompts to transform their product photos, while sellers can monetize their prompt engineering expertise.

![PromptLens](https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- A PostgreSQL database (we recommend [Supabase](https://supabase.com) - free tier available)

### 1. Install Dependencies

```bash
cd promptlens
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# REQUIRED: Supabase Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"

# REQUIRED: NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-32-character-string"

# OPTIONAL: Image Generation (Gemini 3 Pro Image / Nano Banana Pro)
GEMINI_API_KEY="your-api-key"

# OPTIONAL: Stripe Payments
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with sample data (optional)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📋 Feature Checklist

### ✅ Completed

| Feature | Description |
|---------|-------------|
| **Landing Page** | Premium hero, stats, features, testimonials |
| **Marketplace** | Browse prompts with filters, search, sorting |
| **Prompt Detail** | Full details, reviews, add to cart |
| **Shopping Cart** | Zustand store, sidebar, checkout |
| **AI Studio** | Image upload, prompt selection, generation |
| **Authentication** | Sign in/up with email + Google OAuth |
| **Dashboard** | User stats, quick actions, activity |
| **Sell Prompts** | Multi-step creation wizard |
| **API Routes** | Auth, Prompts, Checkout, Generation |
| **Dark Mode** | Theme toggle with persistence |

### 🔧 Configuration Required

| Feature | How to Enable |
|---------|---------------|
| **Database** | Set `DATABASE_URL` to your Supabase connection string |
| **Payments** | Set `STRIPE_SECRET_KEY` and configure Stripe |
| **Image Generation** | Get API key from Google AI Studio and set `GEMINI_API_KEY` |
| **Google OAuth** | Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` |

---

## 🗄️ Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings → Database**
4. Copy the **Connection String** (URI format)
5. Replace `[YOUR-PASSWORD]` with your database password
6. Paste into `.env.local` as `DATABASE_URL`

---

## 🎨 Image Generation Setup (Gemini 3 Pro Image / Nano Banana Pro)

**Gemini 3 Pro Image** (code name: Nano Banana Pro) is Google's state-of-the-art image generation model with advanced reasoning capabilities.

### Quick Setup (Recommended for Development)

1. **Get Your API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/apikey)
   - Sign in with your Google account
   - Click **"Get API Key"** or **"Create API Key"**
   - Copy your API key (starts with `AIza...`)

2. **Add to `.env.local`:**
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```

That's it! No billing setup required for initial testing (comes with free quota).

### Features of Gemini 3 Pro Image:
- **Advanced Text Rendering**: Best-in-class for creating images with legible text, perfect for infographics and marketing
- **Enhanced Reasoning**: Uses Gemini 3's reasoning to create more contextually accurate images
- **Google Search Grounding**: Can connect to real-time web content for data-driven outputs
- **High Resolution**: Supports 2K and 4K resolution for professional production
- **SynthID Watermarking**: All images include invisible watermarks to denote AI origin

### For Production (Vertex AI)
For enterprise features with higher quotas, use Vertex AI:
- Go to [Google Cloud Console](https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemini-3-pro-image-preview)
- Enable the Vertex AI API
- Set up billing
- Use your service account credentials

---

## 💳 Stripe Setup (Payments)

1. Go to [stripe.com](https://stripe.com) and create an account
2. Get your API keys from the Dashboard
3. Add to `.env.local`:
   ```env
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```
4. For webhooks, use Stripe CLI during development:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

---

## 🔐 Test Accounts

After running `npm run db:seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@promptlens.ai | Password123 |
| Seller | sarah@example.com | Password123 |
| Seller | marcus@example.com | Password123 |
| Buyer | buyer@example.com | Password123 |

---

## 📁 Project Structure

```
promptlens/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Sample data
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── marketplace/   # Browse prompts
│   │   ├── studio/        # AI generation
│   │   ├── dashboard/     # User dashboard
│   │   ├── sell/          # Create prompts
│   │   ├── cart/          # Shopping cart
│   │   ├── sign-in/       # Authentication
│   │   └── sign-up/
│   ├── components/
│   │   ├── layout/        # Navbar, Footer, Cart
│   │   ├── marketplace/   # Prompt cards, filters
│   │   └── ui/            # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts        # NextAuth config
│   │   ├── prisma.ts      # Database client
│   │   ├── stripe.ts      # Payment utils
│   │   └── validations.ts # Zod schemas
│   ├── stores/
│   │   └── cart-store.ts  # Zustand cart
│   └── types/
│       └── index.ts       # TypeScript types
└── .env.example           # Environment template
```

---

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Push schema to database
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production

```env
DATABASE_URL=your_production_database_url
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-new-secret
STRIPE_SECRET_KEY=sk_live_...
REPLICATE_API_TOKEN=r8_...
```

---

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

Built with ❤️ using Next.js, Prisma, Stripe, and Replicate.
