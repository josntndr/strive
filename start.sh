#!/usr/bin/env bash
# Strive — run the whole app (frontend + backend + local database) as one server.
set -e
cd "$(dirname "$0")"

[ -d frontend/node_modules ] || (echo "Installing frontend dependencies (first run only)..." && npm --prefix frontend install)
[ -d backend/node_modules ] || (echo "Installing backend dependencies (first run only)..." && npm --prefix backend install)

echo "Building the app..."
export NEXT_PUBLIC_API_URL=
npm --prefix frontend run build

echo ""
echo "Strive is running at: http://localhost:5000"
echo "Your data is saved in: backend/data/db.json"
echo "Press Ctrl+C to stop."
echo ""
npm --prefix backend start
