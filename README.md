# Prompt-Hook

A static, GUI prompt composer for coding agents. Pick an agent, pick a project type, drag stack blocks onto the schematic, describe the task — get back a structured prompt written in that agent's own conventions.

No backend, no build step, no accounts. Everything runs in the browser.

## What it does

1. **Choose a coding agent** — Claude Code, Codex/CLI, DeepSeek Coder, Kimi K2, Cursor, or Gemini CLI. Each has its own prompt template and working conventions baked in.
2. **Choose a project type** — Web App, Backend API, CLI Tool, Mobile App, or Data/ML Script.
3. **Build the stack** — drag (or tap) blocks for frontend framework, database (RDBMS or NoSQL), auth, API style, styling, language, and extras like testing, Docker, or CI.
4. **Describe the task** — plain language in, structured prompt out.

The output panel updates live, and can be copied or downloaded as Markdown.

## Local preview

No build tools required — it's plain HTML/CSS/JS.

```bash
npx serve .
```

or just open `index.html` directly in a browser.

## Deploy on Render

This repo ships with a `render.yaml` so it deploys as a **Static Site** with zero configuration:

1. Push this project to a GitHub/GitLab repo.
2. In Render, click **New → Static Site** and select the repo (Render auto-detects `render.yaml`).
3. Leave the build command empty and the publish directory as `.` (already set in `render.yaml`).
4. Deploy — that's it, no server, no environment variables.

## Project structure

```
prompt-hook/
├── index.html      structure and content
├── style.css        blueprint-schematic design system
├── app.js           agent/project/block data + prompt generation
└── render.yaml       Render static site config
```

## Extending it

- New agent: add an entry to `AGENTS` in `app.js` with a `build(ctx)` function.
- New stack block: add it to `BLOCK_LIBRARY` (or `COMMON_EXTRAS` / `PROJECT_EXTRAS`) under the relevant category.
- New project type: add it to `PROJECT_TYPES` with the list of categories it should expose.
