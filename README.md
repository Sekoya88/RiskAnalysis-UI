# Agentic Risk Assessment Framework - Frontend (UI)

This is the **Next.js 14** frontend for the Agentic Risk Assessment Framework. It provides a sleek, high-contrast monochrome interface to interact with the LangGraph multi-agent backend.

[![Build Status](https://github.com/Sekoya88/RiskAnalysis-UI/workflows/build/badge.svg)](https://github.com/Sekoya88/RiskAnalysis-UI/actions)

> **Note:** This repository only contains the **Frontend UI**.
> The FastAPI backend and LangGraph agents are located in the main repository: [RiskAnalysis](https://github.com/Sekoya88/RiskAnalysis).

## Overview

The user interface is designed for professional, scalable interaction with the risk assessment API. It features:
- A command bar with local/cloud LLM model selection (`qwen3.5`, `lfm2`, `gemini-2.5-flash`, etc.).
- A live Terminal overlay displaying real-time agent execution logs via WebSockets.
- Markdown rendering for the integrated risk reports.
- A clean, API-first architecture matching the decoupled backend.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Shadcn/ui
- **Icons:** Lucide React
- **Typography:** Inter & JetBrains Mono

## Getting Started

### 1. Run the Backend API First

Before starting the frontend, ensure the FastAPI backend is running on **port 8000** (default).

```sh
cd /path/to/RiskAnalysis
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
docker compose up postgres redis -d   # optional but typical
just dev
# → http://127.0.0.1:8000  (try GET /api/runtime-info)
```

### 2. Run the Frontend Development Server

Clone this repository and install the dependencies:

```sh
git clone https://github.com/Sekoya88/RiskAnalysis-UI.git
cd RiskAnalysis-UI

npm install
```

Optional — use the repo Git hooks so commit messages are not polluted with `Made-with: Cursor` trailers:

```sh
just git-hooks
```

Start the development server using the `just` command runner, which explicitly binds to `127.0.0.1` to avoid macOS Next.js networking bugs:

```sh
just dev
# ou équivalent :
just frontend
```

Alternatively, run Next.js manually:

```sh
npm run dev -- -H 127.0.0.1
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) with your browser to see the result.

### Environment (optional)

Create `.env.local` if the API is not at `http://127.0.0.1:8000`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8000
```

The **status bar** at the top of the dashboard calls `GET /api/runtime-info` and shows **Postgres vs SQLite**, **PPO on/off**, and API reachability.

## Usage

1. Check the runtime bar (API reachable, DB, PPO).
2. Select your preferred LLM model from the dropdown in the command bar.
3. Optionally expand **Étiquettes métriques** to send ground-truth labels for evaluation metrics.
4. Enter your query and press **Enter** — terminal overlay streams WebSocket logs.
5. When complete, read the Markdown report; use the **Sources** sidebar to vote on URLs (per-URL memory for future runs).

## Contributing

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## License

This project is licensed under the MIT License.
