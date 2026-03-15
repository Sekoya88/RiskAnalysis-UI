# Brainstorm: Risk Analysis UI Redesign (Modern SaaS)
Date: 2026-03-14

## What We're Building
A complete redesign of the `riskanalysis-ui` dashboard to transform it from a basic "PoC" layout into a highly professional, efficient, and sleek Modern SaaS application. The new UI will prioritize typography, whitespace, and a focused workflow inspired by tools like Linear, Vercel, and Raycast.

## Why This Approach
The previous design relied on a rigid, omnipresent split-screen (Input + Logs on the left, empty Report box on the right). This cluttered the interface and distracted from the core value: the AI-generated risk report.
By adopting a "Command Bar" entry point, we center the user's intent. Using a modal/overlay for live agent logs keeps the user engaged without permanently eating screen real estate. Moving to a "Focus" layout for the final report maximizes readability while keeping sources (RAG/News) accessible yet out of the way. This adheres strictly to YAGNI by hiding complex data until explicitly needed.

## Key Decisions
- **Vibe / Artistic Direction**: Modern SaaS (Linear/Vercel style) — clean, minimalist, high-contrast typography, plenty of whitespace.
- **Workflow / Input**: Centered "Hero" command bar/search input (Raycast style) that transitions to the top of the screen once an analysis is triggered.
- **Loading State**: A Vercel-style sleek terminal overlay/modal to display live WebSocket agent logs. This disappears or minimizes when the analysis completes.
- **Final Output Layout**: "Focus Approach". The markdown report takes center stage for maximum readability. Metadata (time elapsed) and Sources (News/Docs) are moved to a collapsible right sidebar or elegantly placed at the bottom.

## Resolved Questions
- **Sources Sidebar Visibility:** Open by default on large screens to accommodate analysts verifying data immediately.
- **Run History:** Maintain a basic local history (ChatGPT-style left retractable sidebar) so users can compare runs, rather than a strict one-shot interface.

## Design Language Additions (Impeccable)
- Apply `impeccable` frontend design patterns (typography, color-and-contrast, spatial-design, motion-design).
- Use `Inter` for UI elements and `JetBrains Mono` for logs/metadata.
- Avoid raw borders; rely on subtle shadows, gray tints (zinc/neutral), and spatial separation.
