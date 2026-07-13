# Random Frames OS (v1.0)

Random Frames OS is a comprehensive, production-ready business management suite built for creative agencies and studios. It manages everything from lead generation and client pipelines to shoots, scheduling, finance, reporting, and automated notifications.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase / Neon or local Docker)
- **ORM**: Prisma
- **Styling**: Tailwind CSS + Lucide Icons + Recharts
- **State/UI**: React Hooks, Radix UI (base components)

---

## ⚙️ Installation & Local Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd random-frames-os/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root of the `frontend` directory:
```env
# Database connection string
DATABASE_URL="postgresql://user:password@localhost:5432/randomframes?schema=public"

# Next Auth / Secret Keys (if applicable)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup & Prisma Migration
Sync your database schema and generate the Prisma Client:
```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 5. Development Server
Start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🏗️ Build & Production Deployment

To prepare the application for a production environment:

### 1. Run strict type checking and linting
```bash
npx tsc --noEmit
npm run lint
```
*Note: The project is strictly typed and audited to ensure zero runtime errors.*

### 2. Build the production bundle
```bash
npm run build
```

### 3. Start the production server
```bash
npm run start
```

### Deployment (Vercel, AWS, Render)
This application is optimized for Serverless environments like Vercel. 
Simply connect your GitHub repository to Vercel and ensure the `DATABASE_URL` is set in the environment variables. The build command (`npm run build`) automatically runs Prisma generation if configured correctly in `package.json`.

---

## 📁 Project Structure

- `/app` - Next.js App Router pages, layouts, and server actions.
  - `/app/(dashboard)` - Protected routes (Leads, Projects, Shoots, Finance, etc.)
  - `/app/actions` - Next.js Server Actions (Database mutations)
- `/components` - Reusable UI components grouped by business module.
- `/prisma` - Database schema (`schema.prisma`).
- `/lib` - Helper functions, utilities, and Prisma client instance.
