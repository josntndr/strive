# Strive Backend

Express, MongoDB, and JWT API for the Strive fitness and meal planning web application.

## Setup

```bash
cd backend
npm install
npm run dev
```

The API runs on `http://localhost:5000` by default.

On Windows PowerShell, if `npm run dev` is blocked by execution policy, run the npm command shim directly:

```bash
npm.cmd run dev
```

## Environment

Copy `.env.example` to `.env` and adjust values if needed:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
JWT_SECRET=replace_this_with_a_secure_secret
DB_MODE=json
MONGO_URI=
```

The backend now supports two modes:

- `DB_MODE=json` for a local JSON fallback database
- `DB_MODE=mongo` for MongoDB Atlas

## JSON fallback mode

Use this for local development when MongoDB Atlas is not ready yet:

```env
DB_MODE=json
MONGO_URI=
```

The backend will create and use `backend/data/db.json` automatically.

## Strive Assistant (AI chat)

The chat endpoint is `POST /api/ai/chat` (login required). It works in two modes:

- **Real AI** — set a provider and key in `.env`. The provider is auto-detected from whichever key is present.
- **Rule-based fallback** — used automatically when no key is set, so the chat always works offline.

To enable real AI with OpenAI:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...your key...
AI_MODEL=gpt-4o-mini
```

For Claude instead, use `AI_PROVIDER=anthropic`, `ANTHROPIC_API_KEY=...`, and (optionally) `AI_MODEL=claude-haiku-4-5-20251001`.

Restart the backend after adding the key. The key stays server-side and is never sent to the frontend. `.env` is gitignored.

## MongoDB Atlas setup

1. Go to MongoDB Atlas.
2. Create a free account.
3. Create a free cluster.
4. Create a database user.
5. Add your current IP address in Network Access.
6. For development only, allow `0.0.0.0/0` if needed.
7. Copy the connection string.
8. Replace `<username>`, `<password>`, and the cluster URL.
9. Set `DB_MODE=mongo`.
10. Paste the URI into `backend/.env` as `MONGO_URI`.
11. Restart the backend.

Example:

```env
DB_MODE=mongo
MONGO_URI=mongodb+srv://myUser:myPassword@cluster0.xxxxx.mongodb.net/strive?retryWrites=true&w=majority
```

## Optional local MongoDB

Local MongoDB is optional. Use it only if MongoDB Community Server is successfully installed and the MongoDB service is running.

If you do want to run local MongoDB on Windows:

```powershell
Get-Service MongoDB
Start-Service MongoDB
```

## Routes

- `GET /`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/profile`
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/workouts/generate`
- `GET /api/workouts`
- `PUT /api/workouts/:id`
- `DELETE /api/workouts/:id`
- `POST /api/meals/generate`
- `GET /api/meals`
- `PUT /api/meals/:id`
- `DELETE /api/meals/:id`
- `GET /api/dashboard`
- `GET /api/admin/analytics`
- `GET /api/admin/users`

Protected routes require:

```txt
Authorization: Bearer token_here
```
