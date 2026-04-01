# Convex Migration Guide

This document outlines the migration from Supabase to Convex for your licensing server.

## ✅ Changes Made

### 1. **Dependencies**
- ❌ Removed: `@supabase/supabase-js`
- ✅ Added: `convex` (^1.15.0)

### 2. **Convex Project Structure**
```
convex/
├── schema.ts           # Database schema definition
├── licenses.ts         # License functions (queries & mutations)
├── _generated/
│   ├── api.ts         # Auto-generated API client
│   └── server.d.ts    # Auto-generated server types
└── (auto-generated files from Convex CLI)
```

### 3. **Updated API Routes**
- `/app/api/verify-license/route.ts` → Now uses Convex client
- `/app/api/verify/route.ts` → Now uses Convex client

### 4. **Environment Variables**
Updated `.env.local.example` with:
```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-id.convex.cloud
CONVEX_DEPLOYMENT=prod:your-team-id/your-project-id
```

## 🚀 Deployment Steps

### Step 1: Install Convex CLI
```powershell
npm install -g convex
```

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Create Convex Project
```powershell
npx convex init
```
This will:
- Create a Convex account (or use existing)
- Generate deployment configuration
- Create `.env` with your deployment URL

### Step 4: Update Environment Variables
Copy the `NEXT_PUBLIC_CONVEX_URL` from `.env` to `.env.local`:
```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-id.convex.cloud
```

### Step 5: Deploy to Convex
```powershell
npx convex deploy
```
This will:
- Deploy your schema to Convex cloud
- Generate type definitions
- Create database tables

### Step 6: Test the API
```powershell
npm run dev
```

Test license verification:
```powershell
curl -X POST http://localhost:3000/api/verify-license \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "TEST-LICENSE-KEY",
    "machineId": "machine-123"
  }'
```

## 📊 Database Schema Migration

### Old Supabase Table
```sql
CREATE TABLE licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key TEXT UNIQUE NOT NULL,
  machine_id TEXT DEFAULT NULL,
  client_name TEXT NOT NULL,
  software_type TEXT CHECK (...),
  plan_type TEXT CHECK (...),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

### New Convex Schema
See `convex/schema.ts` - automatically created with:
- ✅ Index on `licenseKey` for fast lookups
- ✅ Index on `status` for filtering
- ✅ Timestamps stored as milliseconds (JavaScript native)
- ✅ Strong type safety with Zod validators

## 🔧 Available Functions

### Queries (Read-Only)
```typescript
// Get license by key (without binding)
query getLicenseByKey({ licenseKey: string })

// Check license status
query checkLicenseStatus({ licenseKey: string })
```

### Mutations (Write Operations)
```typescript
// Verify and activate/re-validate license
mutation verifyLicense({ 
  licenseKey: string, 
  machineId: string 
})

// Create new license (admin only)
mutation createLicense({
  licenseKey: string,
  clientName: string,
  softwareType: string,
  planType: string,
  expiresAt: number // timestamp
})

// Revoke a license
mutation revokeLicense({ licenseKey: string })
```

## 🔑 Key Differences

| Feature | Supabase | Convex |
|---------|----------|--------|
| **Initialization** | Manual client setup | HTTP client (browser-ready) |
| **Real-time** | Requires separate subscription | Built-in |
| **Type Safety** | Partial | Full TypeScript with Zod |
| **Timestamps** | ISO strings | Milliseconds (JavaScript native) |
| **Indexing** | Automatic | Explicitly defined in schema |
| **Cost Structure** | Per-seat + compute | Per-operation |

## 📦 Data Migration (if needed)

To migrate existing data from Supabase to Convex:

```typescript
// 1. Export data from Supabase
const { data: licenses } = await supabase.from('licenses').select('*');

// 2. Transform timestamps
const transformed = licenses.map(lic => ({
  licenseKey: lic.license_key,
  machineId: lic.machine_id,
  clientName: lic.client_name,
  softwareType: lic.software_type,
  planType: lic.plan_type,
  status: lic.status,
  createdAt: new Date(lic.created_at).getTime(),
  expiresAt: new Date(lic.expires_at).getTime(),
  activatedAt: lic.activated_at ? new Date(lic.activated_at).getTime() : null,
}));

// 3. Batch insert into Convex using createLicense mutation
```

## 🛠️ Troubleshooting

### Environment URL Not Set
**Error**: `NEXT_PUBLIC_CONVEX_URL is not set`
**Fix**: Copy the URL from `convex.json` after running `npx convex init`

### Type Errors with API
**Error**: `Cannot find module '@/convex/_generated/api'`
**Fix**: Run `npx convex deploy` to generate types

### License Queries Failing
**Error**: `Index 'by_license_key' not found`
**Fix**: Run `npx convex deploy` to sync schema with cloud

## 📚 Documentation Links
- [Convex Docs](https://docs.convex.dev)
- [Convex Schema](https://docs.convex.dev/database/schema)
- [Convex Functions](https://docs.convex.dev/functions)
- [Convex HTTP Client](https://docs.convex.dev/client/javascript)

## ✨ Next Steps
1. ✅ Install dependencies: `npm install`
2. ✅ Initialize Convex: `npx convex init`
3. ✅ Deploy schema: `npx convex deploy`
4. ✅ Test API: `npm run dev`
5. ✅ Deploy to Vercel (auto-detected Next.js)

**Questions?** Check Convex dashboard: https://dashboard.convex.dev
