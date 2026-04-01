# Convex License Server - Quick Start

## ⚡ 5-Minute Setup

### 1. Install dependencies
```powershell
npm install
```

### 2. Initialize Convex
```powershell
npx convex init
```
- Sign in to Convex (create account if needed)
- Select/create a project
- Accept deployment URL

### 3. Deploy schema
```powershell
npx convex deploy
```

### 4. Create .env.local
Copy `NEXT_PUBLIC_CONVEX_URL` from `.env` to `.env.local`:
```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-id.convex.cloud
```

### 5. Start server
```powershell
npm run dev
```

## 🧪 Test It

```powershell
# Verify endpoint (POST)
curl -X POST http://localhost:3000/api/verify-license `
  -H "Content-Type: application/json" `
  -d '{"licenseKey":"TEST-KEY","machineId":"machine-123"}'
```

## 📁 What's New

```
convex/
├── schema.ts              # Database schema
├── licenses.ts            # License operations
└── _generated/            # Auto-generated (after deploy)
    ├── api.ts
    └── server.d.ts
```

## 🔑 API Routes Updated

- `/api/verify-license` - Verify and activate license
- `/api/verify` - Verify with software type check

Both routes now use Convex instead of Supabase.

## 💰 Free Tier Includes

- ✅ 1GB database storage
- ✅ 500K-1M operations/month  
- ✅ Real-time sync
- ✅ Up to 500 concurrent connections

## 🔗 Useful Links

- **Convex Dashboard**: https://dashboard.convex.dev
- **Full Guide**: [CONVEX_MIGRATION.md](CONVEX_MIGRATION.md)
- **Docs**: https://docs.convex.dev

## 📊 Cost Estimate (Your Usage)

| Scenario | Monthly Checks | Operations | Cost |
|----------|----------------|------------|------|
| Small | 1K | 30K | **$0** ✅ |
| Growing | 5K | 150K | **$0** ✅ |
| Scaling | 10K | 300K | **$0** ✅ |
| Large | 50K | 1.5M | **$0.75** |

## ⚠️ Common Issues

| Issue | Fix |
|-------|-----|
| `NEXT_PUBLIC_CONVEX_URL not set` | Copy from `.env` to `.env.local` |
| `Cannot find api module` | Run `npx convex deploy` |
| `License not found` | Check license exists in Convex dashboard |

---

**Ready?** → Run `npm install && npx convex init`
