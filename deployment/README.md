# Strive Deployment Guide

## Recommended Stack
- **Frontend/Backend**: Vercel (Next.js native)
- **Database**: Supabase or Vercel Postgres
- **Auth**: NextAuth.js (requires `NEXTAUTH_SECRET` and `NEXTAUTH_URL`)

## Environment Variables
The following variables are required for a successful deployment:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"
```

## Build Process
1. Navigate to the `frontend` directory.
2. Run `npm install`.
3. Run `npx prisma generate`.
4. Run `npm run build`.

## Production Database
Ensure you run `npx prisma db push` or `npx prisma migrate deploy` against your production database before the first deployment.
