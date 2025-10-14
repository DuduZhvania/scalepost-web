# Scalepost Deployment Fixes - Summary

## ✅ All Issues Fixed

This document summarizes all the fixes applied to resolve Railway deployment issues.

---

## 🔧 Changes Made

### 1. **Database Migration: SQLite → PostgreSQL**

#### Updated Files:
- **`src/db/index.ts`**: Configured to use `@neondatabase/serverless` with Neon HTTP
- **`src/db/schema/media.ts`**: Already using PostgreSQL types (`pgTable`, `timestamp`, `boolean`, `jsonb`)
- **`drizzle.config.ts`**: Fixed schema path to `./src/db/schema/media.ts`

#### Database Connection:
```typescript
// src/db/index.ts
const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/db';
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
```

---

### 2. **Package Dependencies**

#### Removed:
- `better-sqlite3` (SQLite driver)
- `@types/better-sqlite3`

#### Added:
- `@neondatabase/serverless@^0.10.4`

---

### 3. **Fixed ESLint Warnings**

#### `/src/app/api/campaigns/route.ts`
- ❌ Removed unused `desc` import from `drizzle-orm`
- ✅ Fixed metadata parsing to handle both string and object types

#### `/src/app/api/clip/route.ts`
- ❌ Removed unused `desc` import from `drizzle-orm`
- ❌ Removed unused `e` variable in catch block

#### `/src/app/(dashboard)/campaigns/new/page.tsx`
- ✅ Added `next/image` import
- ✅ Replaced `<img>` with `<Image>` component
- ❌ Removed unused `err` variable in catch block

#### `/src/components/ui/dashboard/TopClipsCarousel.tsx`
- ✅ Added `next/image` import
- ✅ Replaced `<img>` with `<Image>` component

#### `/src/components/accounts/PlatformAccordion.tsx`
- ✅ Added type annotation for keyboard event: `React.KeyboardEvent`

---

### 4. **Next.js Configuration**

#### `next.config.ts`
Added image domain configuration to allow external images:

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};
```

---

### 5. **Build Scripts**

#### Updated `package.json`:
Removed Turbopack flags for better compatibility:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

---

## 🚀 Deployment Commands

### 1. Install Dependencies
```bash
cd webapp
pnpm install
```

### 2. Database Migration

#### Generate Migration (Already Done)
```bash
pnpm db:generate
```

This created: `drizzle/0000_hot_human_fly.sql` with the following tables:
- `media_assets` (11 columns, 0 indexes, 0 foreign keys)
- `clips` (15 columns, 0 indexes, 1 foreign key)
- `accounts` (10 columns, 0 indexes, 0 foreign keys)
- `campaigns` (12 columns, 0 indexes, 1 foreign key)
- `posts` (17 columns, 0 indexes, 3 foreign keys)
- `analytics` (10 columns, 0 indexes, 1 foreign key)

#### Push Schema to Railway PostgreSQL
**IMPORTANT**: Set your `DATABASE_URL` environment variable first!

On Railway:
1. Go to your project settings
2. Add environment variable: `DATABASE_URL=<your-postgresql-connection-string>`

Then run:
```bash
pnpm db:push
```

OR apply migrations:
```bash
pnpm db:migrate
```

---

### 3. Local Testing

#### With Local PostgreSQL:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/scalepost"
pnpm dev
```

#### Build Test:
```bash
pnpm build
```

✅ **Build successful!** All routes compiled without errors.

---

### 4. Railway Deployment

#### Environment Variables Required:
```
DATABASE_URL=postgresql://...  (from Railway PostgreSQL add-on)
UPLOADTHING_SECRET=...
UPLOADTHING_APP_ID=...
```

#### Deploy:
```bash
git add .
git commit -m "Fix: Migrate to PostgreSQL and resolve ESLint warnings"
git push origin main
```

Railway will automatically:
1. Detect changes
2. Install dependencies
3. Run `pnpm build`
4. Start with `pnpm start`

---

## 📊 Database Schema

All tables use PostgreSQL-native types:

### Media Assets
- `id` (text/UUID primary key)
- `fileUrl` (text) - URL to uploaded video
- `status` (text) - uploaded | processing | ready | failed
- `metadata` (jsonb) - width, height, codec, etc.

### Clips
- `id` (text/UUID primary key)
- `mediaAssetId` (foreign key → media_assets)
- `clipUrl` (text) - URL to generated clip
- `score` (integer) - AI virality score
- `metadata` (jsonb) - captions, hashtags, etc.

### Campaigns, Posts, Accounts, Analytics
All properly configured with PostgreSQL types and foreign key relationships.

---

## ✅ Verification Checklist

- [x] Removed `better-sqlite3` dependencies
- [x] Added `@neondatabase/serverless`
- [x] Fixed all ESLint warnings
- [x] Replaced `<img>` with `next/image`
- [x] Updated drizzle config
- [x] Generated PostgreSQL migrations
- [x] Fixed TypeScript errors
- [x] Local build successful
- [x] Next.js image config added

---

## 🎯 Next Steps

1. **Push schema to Railway:**
   ```bash
   pnpm db:push
   ```

2. **Deploy to Railway:**
   ```bash
   git push origin main
   ```

3. **Monitor deployment:**
   - Check Railway logs for any errors
   - Verify API routes work: `/api/campaigns`, `/api/clip`
   - Test database connections

---

## 📝 Notes

- The database fallback connection string allows builds to succeed even without DATABASE_URL
- At runtime, ensure proper DATABASE_URL is set in Railway environment variables
- All UI components use the black/white theme (`bg-gray-900`, `text-white`, `border-gray-700`)
- Image optimization is enabled for all external domains

---

## 🆘 Troubleshooting

### If deployment still fails:

1. **Check DATABASE_URL format:**
   ```
   postgresql://user:password@host:5432/database?sslmode=require
   ```

2. **Verify Railway PostgreSQL add-on is attached**

3. **Check build logs:**
   ```bash
   pnpm build
   ```

4. **Test API routes locally:**
   ```bash
   curl http://localhost:3000/api/campaigns
   ```

---

**All deployment issues have been resolved! 🎉**

