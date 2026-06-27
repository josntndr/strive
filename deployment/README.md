# Strive Deployment Guide

Strive is two apps + a database:

- **Frontend** — Next.js (`frontend/`) → Vercel
- **Backend** — Express API (`backend/`) → Vercel serverless (`backend/api/index.js` + `backend/vercel.json`)
- **Database** — MongoDB Atlas (Vercel's filesystem is read-only, so the JSON fallback can't persist there)

## Live deployment

- Frontend: https://frontend-chi-taupe-87.vercel.app
- Backend: https://backend-one-sigma-19.vercel.app

## Backend environment variables (Vercel → backend project → Settings → Environment Variables)

```env
DB_MODE=mongo
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/strive?retryWrites=true&w=majority
JWT_SECRET=<a long random secret>
CLIENT_URL=https://<your-frontend-domain>.vercel.app   # comma-separated list allowed
NODE_ENV=production
# Optional AI chat:
# AI_PROVIDER=openai
# OPENAI_API_KEY=sk-...
# AI_MODEL=gpt-4o-mini
```

## Frontend environment variables (Vercel → frontend project)

```env
NEXT_PUBLIC_API_URL=https://<your-backend-domain>.vercel.app
```

> `NEXT_PUBLIC_*` is inlined at build time — after changing it you must redeploy the frontend.

## MongoDB Atlas setup (free M0)

1. Create an account at https://www.mongodb.com/atlas and a free **M0** cluster.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → add IP `0.0.0.0/0` (Vercel serverless uses dynamic IPs).
4. **Connect → Drivers** → copy the `mongodb+srv://...` connection string, put your password in it, and append a database name (e.g. `/strive`).
5. Set it as `MONGO_URI` in the backend Vercel project, then redeploy the backend.

## Deploy commands (Vercel CLI)

```bash
# Backend
cd backend && vercel deploy --prod

# Frontend
cd frontend && vercel deploy --prod
```

Secrets live only in the host's environment variables — never commit real keys. `backend/.env` is gitignored.
