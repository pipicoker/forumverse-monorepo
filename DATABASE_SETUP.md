# Database Setup Guide

## Current Issue
Your app cannot connect to the Aiven Cloud PostgreSQL database at:
```
pg-2432bdcd-forum-verse.e.aivencloud.com:18397
```

## Quick Fixes

### Option 1: Fix Aiven Database Connection (If you want to keep using it)

1. **Check Aiven Console:**
   - Go to [https://console.aiven.io/](https://console.aiven.io/)
   - Log in and find your PostgreSQL service
   - Check if it's **Running** (not Paused/Suspended)
   - If paused, click "Resume" or "Power On"

2. **Update Connection String:**
   - Copy the connection string from Aiven
   - Update your `forumverse-backend/.env` file:
     ```env
     DATABASE_URL="postgresql://username:password@pg-2432bdcd-forum-verse.e.aivencloud.com:18397/database_name?sslmode=require"
     ```

3. **Check IP Whitelist:**
   - Some cloud databases restrict IPs
   - Add your IP to the whitelist in Aiven settings

### Option 2: Setup Local PostgreSQL Database (Recommended for Development)

#### Step 1: Install PostgreSQL

**Windows:**
```bash
# Download from: https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql shell:
CREATE DATABASE forumverse;
CREATE USER forumuser WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE forumverse TO forumuser;
\q
```

#### Step 3: Update Environment Variables

Create/update `forumverse-backend/.env`:

```env
# Database (Local PostgreSQL)
DATABASE_URL="postgresql://forumuser:yourpassword@localhost:5432/forumverse?schema=public"

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:8080

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# Email Configuration (Optional - for email verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Backend URL
BACKEND_BASE_URL=http://localhost:3001

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Step 4: Run Prisma Migrations

```bash
cd forumverse-backend

# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

#### Step 5: Seed Database (Create Demo User)

You'll need to create a user manually or via Prisma Studio since the demo account needs to exist.

**Option A: Using Prisma Studio**
```bash
npx prisma studio
# Opens at http://localhost:5555
# Click on "User" table
# Add a new record with the demo credentials
```

**Option B: Create a seed script**

Create `forumverse-backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('sophia123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'sarahekere79@gmail.com' },
    update: {},
    create: {
      email: 'sarahekere79@gmail.com',
      username: 'coker',
      password: hashedPassword,
      emailVerified: true,
      role: 'USER',
    },
  });

  console.log('Demo user created:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Update `package.json` to add seed script:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Run seed:
```bash
npx prisma db seed
```

### Option 3: Use SQLite (Quickest for Testing)

For quick testing, you can switch to SQLite:

1. **Update `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. **Update `.env`:**
```env
DATABASE_URL="file:./dev.db"
```

3. **Run migrations:**
```bash
npx prisma migrate dev --name init
npx prisma db seed  # Create demo user
```

## After Database Setup

1. **Restart Backend Server:**
   ```bash
   cd forumverse-backend
   npm run dev
   ```

2. **Test Login:**
   - Go to http://localhost:8080
   - Login with:
     - Email: `sarahekere79@gmail.com`
     - Password: `sophia123`

## Troubleshooting

### Connection Still Failing?
```bash
# Test if PostgreSQL is running
pg_isready -h localhost -p 5432

# Check if you can connect
psql -h localhost -U forumuser -d forumverse
```

### Migrations Failing?
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev
```

### Demo User Not Working?
- Make sure `emailVerified` is set to `true` in the database
- Password must be hashed with bcrypt
- Check backend logs for specific error

