# Tasks Web

React frontend for [API Tasks](../api-tasks) — a task manager backed by a FastAPI REST API with JWT auth, semantic search (RAG), and a LangGraph agent exposed over MCP. Built with **React + TypeScript + Vite**, **Tailwind CSS v4**, **shadcn/ui**, **React Router**, **TanStack Query**, and **Zustand**.

This is a companion repo to the backend. It's a from-scratch build focused on doing state management "the right way": server state (API data) and client state (session) are deliberately kept in separate tools rather than mixed into one global store.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture notes](#architecture-notes)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [Known limitations & next steps](#known-limitations--next-steps)

## Features

- **Auth**: register, login, persistent session (JWT stored via Zustand + `persist`, survives page reloads), auto-logout on token expiry (401 response interceptor)
- **Projects**: list, create, inline edit (dialog), delete (with confirmation)
- **Tasks**: list per project, create, toggle completed, inline edit, delete (with confirmation)
- **Semantic search**: natural-language search over tasks, powered by the backend's pgvector-based RAG endpoint
- **AI chat**: conversational UI against the backend's LangGraph agent (tool use + persistent memory happen server-side; this UI holds only the visible transcript for the current session)
- Route protection: unauthenticated users are redirected to `/login`; authenticated users hitting `/login` land on the app

## Tech stack

| Concern                      | Choice                                                          |
| ---------------------------- | --------------------------------------------------------------- |
| Framework / build            | React 19 + TypeScript, Vite                                     |
| Styling                      | Tailwind CSS v4                                                 |
| Components                   | shadcn/ui (New York style)                                      |
| Routing                      | React Router                                                    |
| Server state / data fetching | TanStack Query (`useQuery` for reads, `useMutation` for writes) |
| Client state (session)       | Zustand (`persist` middleware → `localStorage`)                 |
| HTTP client                  | Axios, with request/response interceptors                       |
| Forms & validation           | react-hook-form + Zod                                           |
| Icons                        | lucide-react                                                    |
| Production server            | nginx (multi-stage Docker build)                                |

## Architecture notes

**Server state vs. client state.** Anything that comes from the API (projects, tasks, search results, chat replies) lives in TanStack Query, which owns caching, loading/error states, and invalidation. Anything that's purely local to the browser session — the JWT and the logged-in user — lives in a small Zustand store (`src/store/auth.ts`). Neither tool is used for the other's job; this mirrors the backend's separation between request-scoped data and persisted state.

**The axios interceptor is the single point where auth meets HTTP.** `src/lib/api.ts` creates one axios instance used everywhere. A request interceptor reads the current token from the Zustand store (via `getState()`, not the React hook, since this runs outside component context) and attaches `Authorization: Bearer <token>`. A response interceptor watches for `401` and clears the session automatically. No component ever attaches the header manually.

**Protected routes are a thin wrapper, not per-page logic.** `src/routes/ProtectedRoute.tsx` checks for a token and renders an `<Outlet />` or redirects to `/login`. Pages themselves don't know or care about auth — they're only ever rendered once a token exists.

**Chat history is session-only on the client.** The backend agent has real persistent memory (SQLite-backed, per user, survives server restarts). The frontend does not fetch or replay that history — the visible chat transcript is local React state that resets on page reload, while the agent's actual memory keeps working underneath regardless.

## Project structure

```
src/
├── main.tsx                  # Providers: QueryClientProvider, BrowserRouter
├── App.tsx                   # Route table
├── lib/
│   └── api.ts                 # Configured axios instance + interceptors
├── store/
│   └── auth.ts                 # Zustand store: token, user, setAuth, logout
├── routes/
│   └── ProtectedRoute.tsx       # Auth guard for nested routes
├── components/ui/               # shadcn/ui components (generated, editable)
└── features/
    ├── auth/                     # LoginPage, RegisterPage, api.ts (useLogin, useRegister)
    ├── projects/                  # ProjectsPage, api.ts (CRUD hooks)
    ├── tasks/                      # ProjectDetailPage, api.ts (CRUD hooks)
    ├── search/                      # SearchPage, api.ts (useSearchTasks)
    └── chat/                        # ChatPage, api.ts (useSendMessage)
```

Each feature folder pairs a page component with its own `api.ts` — the TanStack Query hooks for that domain live next to the UI that uses them, rather than in one global API file.

## Getting started

**Prerequisites**: Node 22+, and the [backend](../api-tasks) running (locally or via Docker) so there's an API to talk to.

```bash
git clone <your-frontend-repo-url> tasks-web
cd tasks-web
npm install
cp .env.example .env   # adjust VITE_API_URL if needed
npm run dev
```

Open `http://localhost:5173`. You'll need a registered user — either register from `/register`, or use one already created via the backend's Swagger UI.

## Environment variables

| Variable       | Purpose                     | Default (dev)                  |
| -------------- | --------------------------- | ------------------------------ |
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:8000/api/v1` |

Vite only exposes variables prefixed with `VITE_` to client code. In production builds, this value is baked into the compiled JS at build time (see Docker section) — it can't be changed at container runtime without rebuilding.

## Running with Docker

This repo builds to static files served by nginx (not a Node server in production):

```bash
docker build -t tasks-web --build-arg VITE_API_URL=http://localhost:8000/api/v1 .
docker run -p 3000:80 tasks-web
```

`nginx.conf` includes an SPA fallback (`try_files $uri $uri/ /index.html;`) so client-side routes like `/dashboard` or `/projects/5` don't 404 on a hard refresh — nginx serves `index.html` and React Router takes over from there.

In practice, this frontend is one of four services (`db`, `mcp`, `api`, `web`) orchestrated by the **backend's** `docker-compose.yml`, which builds this repo via a relative `context: ../tasks-web`. See the [backend README](../api-tasks/README.md) for the full multi-service setup and a note on the `network_mode` workaround used between the API and MCP containers.

## Known limitations & next steps

- No refresh-token flow yet — when the JWT expires, the interceptor logs the user out; there's no silent renewal.
- Chat UI has no loading/streaming of partial agent responses — it waits for the full reply (the agent's tool-calling loop can take a few seconds).
- No human-in-the-loop confirmation in the chat UI for destructive agent actions (e.g., an agent-initiated delete) — a natural next step now that dialogs/alerts already exist in the CRUD screens.
- Planned: n8n-based automation on top of the backend API.
