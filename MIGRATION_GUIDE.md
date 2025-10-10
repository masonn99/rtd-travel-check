# Next.js + Neon DB Migration Guide

Your project has been successfully migrated from **React + Vite + Firebase** to **Next.js + Neon PostgreSQL**!

## What Changed

### ✅ Before (Old Stack)
- React + Vite (frontend only)
- Firebase/Firestore (database)
- Client-side database queries
- Exposed Firebase credentials

### ✅ After (New Stack)
- Next.js 15 (frontend + backend)
- Neon PostgreSQL (database)
- Server Actions for secure database operations
- No exposed credentials

## Setup Instructions

### 1. Get Your Neon Database URL

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project (or create a new one)
3. Click "Connection Details"
4. Copy your connection string (it looks like):
   ```
   postgres://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Configure Environment Variables

1. Create a `.env.local` file in the project root:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Neon database URL:
   ```env
   DATABASE_URL="your-neon-connection-string-here"
   ```

### 3. Initialize the Database

Run this command to create the necessary tables:

```bash
npx tsx scripts/init-db.ts
```

This will create:
- `countries` table - for RTD-supported countries
- `experiences` table - for user travel experiences

### 4. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## Key Files

### Server-Side Code (Secure)
- `app/lib/db.ts` - Database connection
- `app/actions/experiences.ts` - Server Actions for database operations

### Client-Side Code
- `app/page.tsx` - Main page
- `app/components/` - React components
- `app/layout.tsx` - Root layout with metadata

## Architecture

```
User's Browser (Client)
        ↓
Next.js Server Actions (app/actions/)
        ↓
Database Connection (app/lib/db.ts)
        ↓
Neon PostgreSQL Database
```

## Benefits

### 🔒 **Security**
- No database credentials exposed to the browser
- Server-side validation and rate limiting
- SQL injection protection via parameterized queries

### ⚡ **Performance**
- Server-side rendering (SSR)
- Automatic code splitting
- Optimized images and fonts

### 💰 **Cost**
- Neon free tier: 0.5 GB storage, 10 GB transfer
- Vercel free tier: 100 GB bandwidth

### 🔧 **Developer Experience**
- Type-safe with TypeScript
- Hot module replacement
- One codebase for frontend + backend

## Deployment to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `DATABASE_URL` environment variable in Vercel settings
4. Deploy!

Vercel will automatically:
- Detect Next.js
- Run `npm run build`
- Deploy to production

## Database Schema

### `experiences` table
```sql
id              SERIAL PRIMARY KEY
country_code    VARCHAR(2)
country_name    VARCHAR(255)
experience_type VARCHAR(50)
title           TEXT
description     TEXT
author_name     VARCHAR(255)
author_email    VARCHAR(255)
helpful_count   INTEGER DEFAULT 0
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

## Migrating Existing Firebase Data (Optional)

If you have existing data in Firebase, you'll need to export and import it:

1. Export Firebase data (use Firebase Console)
2. Transform the JSON format to match PostgreSQL schema
3. Use `INSERT` statements or a migration script

Need help? Check the Next.js docs: https://nextjs.org/docs

## Troubleshooting

### "DATABASE_URL is not set" error
- Make sure `.env.local` exists and contains your Neon URL
- Restart the dev server after adding environment variables

### Connection timeout
- Check if your Neon database is active
- Verify the connection string is correct
- Ensure your IP isn't blocked (Neon allows all IPs by default)

### TypeScript errors
- Run `npm install` to ensure all types are installed
- Check `tsconfig.json` is present

## Next Steps

1. ✅ Test the application locally
2. ✅ Initialize database with `npx tsx scripts/init-db.ts`
3. ✅ Add environment variables
4. ✅ Deploy to Vercel
5. ✅ Remove Firebase dependency (optional): `npm uninstall firebase`

---

**Questions?** Check:
- [Next.js Docs](https://nextjs.org/docs)
- [Neon Docs](https://neon.tech/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
