# 🚀 Quick Database Fix

Your API is working! But the database connection failed. Here's how to fix it:

## ✅ What's Working Now:
- Frontend is correctly calling backend API endpoints
- Backend is receiving requests properly
- All endpoint paths are fixed

## ❌ Current Issue:
Cannot connect to Aiven Cloud database: `pg-2432bdcd-forum-verse.e.aivencloud.com:18397`

---

## 🔧 Choose Your Fix:

### Option 1: Resume Aiven Database (30 seconds)
1. Go to https://console.aiven.io/
2. Login and find your PostgreSQL service
3. If it says "Paused" or "Powered off", click **"Resume"** or **"Power On"**
4. Wait 1-2 minutes
5. Refresh your app and try logging in again

---

### Option 2: Setup Local PostgreSQL (5 minutes)

#### Windows:
```powershell
# Install PostgreSQL (if not installed)
# Download from: https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql

# Create database
psql -U postgres
CREATE DATABASE forumverse;
CREATE USER forumuser WITH PASSWORD 'devpassword123';
GRANT ALL PRIVILEGES ON DATABASE forumverse TO forumuser;
\q
```

#### macOS:
```bash
# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Create database
psql postgres
CREATE DATABASE forumverse;
CREATE USER forumuser WITH PASSWORD 'devpassword123';
GRANT ALL PRIVILEGES ON DATABASE forumverse TO forumuser;
\q
```

#### Update .env file:
Create `forumverse-backend/.env`:
```env
DATABASE_URL="postgresql://forumuser:devpassword123@localhost:5432/forumverse?schema=public"
PORT=3001
FRONTEND_URL=http://localhost:8080
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
BACKEND_BASE_URL=http://localhost:3001
```

#### Run migrations and seed:
```bash
cd forumverse-backend

# Generate Prisma client
npx prisma generate

# Create tables
npx prisma migrate deploy

# OR if that doesn't work:
npx prisma migrate dev --name init

# Create demo user (email verified and ready to login)
npm run seed
```

The seed script will create:
- ✅ Demo user: `sarahekere79@gmail.com` / `sophia123`
- ✅ Email already verified
- ✅ Sample post

---

### Option 3: Quick SQLite Setup (2 minutes - Testing Only)

For quick testing without PostgreSQL:

1. **Update `prisma/schema.prisma`** (first few lines):
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. **No .env DATABASE_URL needed** (SQLite uses local file)

3. **Run migrations:**
```bash
cd forumverse-backend
npx prisma migrate dev --name init
npm run seed
```

---

## ✅ After Setup:

1. **Backend should restart automatically** (ts-node-dev)
   - If not, restart: `npm run dev`

2. **Go to http://localhost:8080**

3. **Login with:**
   - Email: `sarahekere79@gmail.com`
   - Password: `sophia123`

4. **Should work now!** 🎉

---

## 🐛 Still Having Issues?

Check backend console for errors:
```bash
cd forumverse-backend
npm run dev
```

View database in browser:
```bash
npx prisma studio
# Opens at http://localhost:5555
```

---

## 📝 Files I've Created/Updated:

1. ✅ `forumverse-backend/prisma/seed.ts` - Creates demo user
2. ✅ `forumverse-backend/package.json` - Added seed script
3. ✅ `DATABASE_SETUP.md` - Detailed database guide
4. ✅ `ENV_SETUP.md` - Environment variables guide
5. ✅ Fixed all API endpoints in frontend

**Your app is ready to run - just need the database connected!**

