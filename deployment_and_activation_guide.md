# UrbanBill — Deployment, Licensing & Activation Guide

## 📁 Project Structure

| Project | Location | Purpose |
|---------|----------|---------|
| **BillingSoftware** (Client) | `d:\BillingSoftware` | Electron desktop app |
| **Licensing Server** | `d:\electron-licensing-server` | Next.js API on Vercel + Admin Dashboard |
| **Database** | Supabase | PostgreSQL storing all license records |

---

## 🖥️ Accessing the Admin Dashboard

### Local (Development)
1. Start the licensing server:
   ```bash
   cd d:\electron-licensing-server
   npm run dev
   ```
2. Open browser: **http://localhost:3000/admin/dashboard**
3. Login with the password set in `.env.local` → `ADMIN_PASSWORD`
   - Current password: `Urb@nB1ll_Adm!n_2026$ecure`

### Production (Vercel)
1. Open: **https://electron-licensing-server.vercel.app/admin/dashboard**
2. Login with the `ADMIN_PASSWORD` set in Vercel environment variables

> [!IMPORTANT]
> The admin dashboard link has been removed from the public homepage for security.
> You must type the URL directly: `/admin/dashboard`

---

## 🚀 Deployment Steps — Licensing Server to Vercel

### First Time Setup

1. **Install Vercel CLI** (if not already):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from the server directory**:
   ```bash
   cd d:\electron-licensing-server
   vercel --prod
   ```

4. **Set Environment Variables on Vercel**:

   Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

   Add these exact variables:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://mtxjyyugubofiobijjvd.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(copy from .env.local)* |
   | `SUPABASE_SERVICE_ROLE_KEY` | *(copy from .env.local)* |
   | `ADMIN_PASSWORD` | `Urb@nB1ll_Adm!n_2026$ecure` *(or your own strong password)* |

5. **Redeploy after adding env variables**:
   ```bash
   vercel --prod
   ```

### Subsequent Deployments (After Code Changes)
```bash
cd d:\electron-licensing-server
vercel --prod
```

Or push to Git if you have GitHub integration enabled — Vercel auto-deploys.

---

## 🔑 License Lifecycle — How It Works

### Step 1: Generate a License Key (You — Admin)

1. Open admin dashboard: `https://electron-licensing-server.vercel.app/admin/dashboard`
2. Login with admin password
3. Fill the form:
   - **Client Name**: Customer's name (e.g., "Rahul Sharma")
   - **Software Type**: UrbanBill
   - **Plan Type**: Standard or Premium
   - **Validity**: Number of days (e.g., 365 for 1 year)
4. Click **Generate License**
5. Copy the generated key (format: `XXXX-XXXX-XXXX-XXXX`)
6. Share the key with your customer

### Step 2: Customer Activates (Customer — First Launch)

1. Customer installs UrbanBill on their PC
2. On first launch, they see the **Activation Page**
3. They paste the license key: `XXXX-XXXX-XXXX-XXXX`
4. Click **Activate License**
5. What happens behind the scenes:
   - App sends `{licenseKey, machineId, softwareType}` to your Vercel server
   - Server checks: key exists? active? not expired? software type matches?
   - Server binds the `machine_id` (hardware fingerprint) to this license
   - Returns `{valid: true, expiry: "2027-04-18"}`
   - App saves status locally and opens the main window ✅

### Step 3: Every Subsequent Launch (Automatic)

1. App reads stored license key
2. Checks for clock tampering (time wound backwards?)
3. Sends verification request to server
4. Server confirms: still active? not banned? machine matches? not expired?
5. If valid → app opens normally
6. If invalid → shows activation page again

> [!NOTE]
> **Internet is required on EVERY launch.** No offline grace period.
> This is the strictest protection — no offline bypass possible.

---

## 🛡️ Admin Actions

### From the Dashboard you can:

| Action | What it Does |
|--------|-------------|
| **Generate License** | Creates a new key and stores it in Supabase |
| **Revoke/Ban** | Immediately blocks a license. Customer's next launch fails |
| **Reset Machine ID** | Unbinds the hardware lock. Use when customer gets a new PC |
| **Delete License** | Permanently removes the record |
| **View Status** | See active/banned/expired, machine ID, expiry date |

### Handling Common Scenarios

**Customer got a new computer:**
→ Reset Machine ID from dashboard → Customer enters same key on new PC → Works

**Customer's license expired:**
→ Generate a new key with fresh validity → Share new key with customer

**Suspicious activity / piracy:**
→ Ban the license from dashboard → Takes effect on next launch

**Customer can't connect to internet:**
→ App won't open. Internet is mandatory. This is by design for security.

---

## 📦 Building UrbanBill for Distribution

### Development
```bash
cd d:\BillingSoftware
npm run dev
```

### Production Build
```bash
cd d:\BillingSoftware
npm run build
```
This creates the installer in the `release/` or `dist/` directory.

---

## 🗄️ Database Schema (Supabase)

```sql
CREATE TABLE licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key TEXT UNIQUE NOT NULL,
  machine_id TEXT DEFAULT NULL,
  client_name TEXT NOT NULL,
  software_type TEXT CHECK (software_type IN (
    'UrbanBill', 'MediBill', 'KiranaBill',
    'StationMaster', 'MandiBill', 'OptiVision'
  )) NOT NULL DEFAULT 'UrbanBill',
  plan_type TEXT CHECK (plan_type IN ('Standard', 'Premium')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'banned', 'expired')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

---

## 🔒 Security Checklist

- [x] Strict online validation on every launch
- [x] Machine ID hardware locking (node lock)
- [x] Clock tamper detection
- [x] Software type enforcement  
- [x] Admin password in environment variable
- [x] Admin cookie with 24h expiry + secure + sameSite
- [x] Dead API route (`/api/verify-license`) deleted
- [x] Admin dashboard URL hidden from public page
- [x] DevTools blocked in production builds
- [x] Encrypted local license store

### ⚠️ CRITICAL — You Must Do After Deployment

1. **Set `ADMIN_PASSWORD` in Vercel env variables** — without this, the old weak password is used
2. **Change the password** to something only you know
3. **Never share** the Supabase service role key
4. **Never share** the admin dashboard URL with customers

---

## 🔗 Quick Reference URLs

| What | URL |
|------|-----|
| Licensing Server (Home) | https://electron-licensing-server.vercel.app |
| Admin Dashboard | https://electron-licensing-server.vercel.app/admin/dashboard |
| Verification API | https://electron-licensing-server.vercel.app/api/verify |
| Supabase Dashboard | https://supabase.com/dashboard |
