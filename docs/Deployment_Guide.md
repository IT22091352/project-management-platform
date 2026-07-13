# Full-Stack Deployment Guide

This guide explains how to deploy the entire Project Management Platform (Next.js Frontend, Node/Express Backend, and MySQL Database) to production using cloud hosting platforms.

---

## 🏗️ Deployment Architecture
- **Database:** Hosted on **Railway** (Cloud-hosted MySQL).
- **Backend (Express):** Hosted on **Render** (as a Web Service running Node.js).
- **Frontend (Next.js):** Hosted on **Vercel** (with static and serverless build settings).

---

## Step 1: Deploy the MySQL Database on Railway
1. Go to [Railway.app](https://railway.app/) and sign in.
2. Click **New Project** -> **Provision MySQL**.
3. Once initialized, click on the **MySQL** service container, go to the **Variables** tab, and copy the **`DATABASE_URL`**.
   - Format: `mysql://root:password@host:port/railway`

---

## Step 2: Configure and Deploy the Backend on Render
1. Go to [Render.com](https://render.com/) and link your GitHub account.
2. Click **New +** -> **Web Service**.
3. Select your repository.
4. Configure the Web Service:
   - **Name:** `project-mgmt-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   - `DATABASE_URL` = *(Paste the MySQL connection string from Step 1)*
   - `JWT_SECRET` = *(Generate a secure random string, e.g., `openssl rand -base64 32`)*
   - `PORT` = `5000`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://your-frontend.vercel.app` *(Change this to your actual Vercel URL once generated)*
6. Click **Deploy Web Service**.
7. Copy the generated Render Web Service URL (e.g., `https://project-mgmt-backend.onrender.com`).

---

## Step 3: Run Database Migrations
Before the backend can execute queries, you must apply the Prisma database schema migrations to your live database.

Run this command from your local machine terminal inside the `backend` folder (replace the DATABASE_URL with your live Railway connection URL temporarily or set it in your local `.env`):
```bash
npx prisma migrate deploy
```
This applies all migration files in `prisma/migrations` directly to the live production database.

---

## Step 4: Deploy the Frontend on Vercel
1. Go to [Vercel.com](https://vercel.com/) and sign in with GitHub.
2. Click **Add New** -> **Project**.
3. Import your repository.
4. Configure Project settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
5. Under **Environment Variables**, add:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://project-mgmt-backend.onrender.com/api` *(Your Render backend URL with /api suffix)*
6. Click **Deploy**.

---

## 🛠️ Common Deployment Issues & Troubleshooting

### 1. CORS Errors (Cross-Origin Resource Sharing)
- **Symptom:** Console displays `Access to XMLHttpRequest at ... has been blocked by CORS policy`.
- **Fix:** Verify that the `FRONTEND_URL` environment variable on Render matches your exact Vercel URL (including `https://` but excluding a trailing slash).

### 2. Cookie / Session Issues (Users cannot stay logged in)
- **Symptom:** Users log in successfully but are immediately redirected back to `/login` when navigating.
- **Fix:** 
  - Ensure the backend has `NODE_ENV` set to `production` so that cookies are set with the `secure` flag.
  - Verify that the frontend Axios client is initialized with `withCredentials: true` in `frontend/src/lib/api.ts`.
  - Ensure Vercel and Render use HTTPS.

### 3. Prisma Schema Synchronization Errors
- **Symptom:** Backend fails to start or database query crashes with `PrismaClientKnownRequestError`.
- **Fix:** Run `npx prisma migrate deploy` locally pointing to your Railway database to ensure the schema matches the Prisma client.
