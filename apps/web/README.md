# Convertly frontend

React, TypeScript, Vite, and Tailwind frontend for the multi-tool API. Conversion work always runs in the FastAPI/Celery backend.

## Structure

```text
src/
├── app/                 # Application entry, routes, providers, and orchestration
├── features/
│   ├── auth/            # Session API, Google login, and auth UI
│   ├── tools/           # Tool discovery, categories, catalog, and cards
│   └── jobs/            # Upload, options, progress, result, and job API
├── shared/
│   ├── api/             # Provider-neutral HTTP client and errors
│   ├── components/      # Reusable UI, icons, and layouts
│   ├── hooks/           # Reusable lifecycle hooks
│   └── utils/           # Framework-independent helpers
├── main.tsx
└── index.css            # Tailwind import only
```

Keep code inside a feature when it belongs to that business capability. Move code into `shared` only when multiple features can reuse it. Do not add a frontend component for each backend conversion plugin; the generic tool and job UI reads plugin metadata from the API.

`AuthProvider` is the only global context. It owns the current user and session status and exposes session refresh, logout, and invalidation through `useAuth()`. API clients, tools, files, and jobs remain outside React Context.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```
