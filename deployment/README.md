# Strive Deployment Guide

## Run it all on your own machine

This runs the entire app as a single server. The Express backend serves the
built Next.js frontend and the API, and all data is stored on your computer in
`backend/data/db.json` when using local JSON mode.

```bash
# 1. Install dependencies (first time only)
npm --prefix frontend install
npm --prefix backend install

# 2. Build the frontend and start the one server
npm run app

# 3. Open the app
#    http://localhost:5000
```

`npm run app` builds the frontend into `frontend/out` and starts the backend,
which serves both the website and `/api/*` on `http://localhost:5000`.
Re-run it after code changes.

To make the local app reachable from the internet while keeping the data on
your machine, run a tunnel in another terminal, such as:

```bash
cloudflared tunnel --url http://localhost:5000
```

## Cloud deployment

The portfolio deployment uses the Strive frontend project plus the existing
production backend project:

- Website: https://strive-fitness-app.vercel.app
- API: https://backend-one-sigma-19.vercel.app
- Database: MongoDB Atlas or Vercel Blob storage

## Live deployment

- App: https://strive-fitness-app.vercel.app
- Backend health check: https://backend-one-sigma-19.vercel.app/api/health

The frontend Vercel project must set:

```env
NEXT_PUBLIC_API_URL=https://backend-one-sigma-19.vercel.app
```

`NEXT_PUBLIC_*` values are inlined into the frontend build, so redeploy the
frontend after changing this value.

## Backend environment variables

Set these in the backend Vercel project under Settings -> Environment Variables:

```env
DB_MODE=mongo
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/strive?retryWrites=true&w=majority
JWT_SECRET=<a long random secret>
CLIENT_URL=https://strive-fitness-app.vercel.app,https://frontend-chi-taupe-87.vercel.app
NODE_ENV=production

# Optional AI chat:
# AI_PROVIDER=openai
# OPENAI_API_KEY=sk-...
# AI_MODEL=gpt-4o-mini
```

If you use `DB_MODE=json` on Vercel, set `BLOB_READ_WRITE_TOKEN` so the JSON
collections persist in Vercel Blob. Without MongoDB or Blob storage, serverless
filesystem writes will not persist.

## MongoDB Atlas setup

1. Create an account at https://www.mongodb.com/atlas and a free M0 cluster.
2. In Database Access, add a database user.
3. In Network Access, add IP `0.0.0.0/0` because Vercel serverless uses dynamic IPs.
4. In Connect -> Drivers, copy the `mongodb+srv://...` connection string.
5. Put your password in the connection string and append a database name, such as `/strive`.
6. Set the URI as `MONGO_URI` in the backend Vercel project, then redeploy the backend.

## Deploy command

Deploy the backend from `backend/` and the frontend from the project root:

```bash
cd backend
vercel deploy --prod

cd ..
vercel deploy --prod
```

Secrets live only in the host's environment variables. Never commit real keys.
`backend/.env` and `frontend/.env.local` are gitignored.
