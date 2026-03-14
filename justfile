# RiskAnalysis-UI — Justfile
# Usage: just <recipe>

# Install dependencies
install:
    npm install

# Start the frontend dev server
dev:
    npm run dev

# Build the app for production
build:
    npm run build

# Start the production server
start:
    npm start
