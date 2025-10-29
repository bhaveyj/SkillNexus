# SkillNexus

A modern skill development and learning platform built with Next.js, NextAuth.js, Prisma, and PostgreSQL.

## Features

- 🔐 **Authentication**: NextAuth.js with multiple providers (Google, GitHub, Credentials)
- 💾 **Database**: PostgreSQL with Prisma ORM
- 🎨 **UI**: Modern interface with Tailwind CSS and Radix UI components
- 🚀 **Deployment**: Automated CI/CD with GitHub Actions and Vercel
- 🔒 **Security**: Protected routes with middleware
- 📱 **Responsive**: Mobile-first design

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma, PostgreSQL
- **Authentication**: NextAuth.js with JWT sessions
- **Deployment**: Vercel with GitHub Actions CI/CD
- **Database**: PostgreSQL (local development and production)

## Getting Started

### Prerequisites

- Node.js 20 or later
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skillnexus.git
   cd skillnexus
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database URL and authentication secrets:
   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/skillnexus?schema=public"
   NEXTAUTH_SECRET="your-nextauth-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Optional: OAuth provider credentials
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Create and run migrations
   npm run db:migrate
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Default Users

After seeding the database, you can use these test accounts:

- **Admin**: admin@skillnexus.com / admin123
- **Instructor**: instructor@skillnexus.com / instructor123  
- **User**: user@skillnexus.com / user123

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Create new migration
npm run db:migrate

# Deploy migrations to production
npm run db:deploy

# Reset database (development only)
npm run db:reset

# Seed database with sample data
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## Deployment

### Vercel Deployment

1. **Connect to Vercel**
   - Push your code to GitHub
   - Import the repository in Vercel

2. **Set Environment Variables in Vercel**
   - `DATABASE_URL`: Your production PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate a secure secret
   - `NEXTAUTH_URL`: Your production URL
   - OAuth provider credentials (if using)

3. **Add GitHub Secrets for CI/CD**
   Go to your GitHub repository settings → Secrets and add:
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID
   - `DATABASE_URL`: Production database URL
   - `NEXTAUTH_SECRET`: NextAuth secret
   - `NEXTAUTH_URL`: Production URL

4. **Deploy**
   - Push to main branch to trigger automatic deployment
   - Or run manual deployment workflow

### Database Setup for Production

1. Set up PostgreSQL database (recommended: Railway, Supabase, or PlanetScale)
2. Run migrations: `npm run db:deploy`
3. Optionally seed production data

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication API routes
│   │   └── user/          # User management API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard
│   └── layout.tsx         # Root layout with providers
├── components/
│   ├── ui/                # Reusable UI components
│   └── landingpage/       # Landing page components
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding script
├── types/
│   └── next-auth.d.ts     # NextAuth type extensions
└── middleware.ts          # Route protection middleware
```

## API Routes

- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints
- `GET/PUT /api/user/profile` - User profile management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
