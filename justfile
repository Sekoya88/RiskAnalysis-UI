# RiskAnalysis-UI — Justfile
# Usage: just <recipe>

# One-time: strip "Made-with: Cursor" etc. from commits (uses .githooks/commit-msg)
git-hooks:
    git config core.hooksPath .githooks

# Install dependencies
install:
    npm install

# Start the frontend dev server
dev:
    npm run dev -- -H 127.0.0.1

# Alias explicite (même commande que `dev`)
frontend:
    npm run dev -- -H 127.0.0.1

# Build the app for production
build:
    npm run build

# Start the production server
start:
    npm start
