# Multiple Tools frontend

React, TypeScript, Vite, and Tailwind frontend for the multi-tool API. Conversion work always runs in the FastAPI/Celery backend.

## Structure

```text
src/
├── app/                 # Application entry, routes, providers, and orchestration
├── generated/           # Build-generated tool catalog; do not edit by hand
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
└── index.css            # Application styles
```

Keep code inside a feature when it belongs to that business capability. Move code into `shared` only when multiple features can reuse it. Do not add a frontend component for each backend conversion plugin. `ToolPage` renders every public `/{tool-slug}` page from the generated registry catalog, and the generic job UI submits the selected registry tool to the API.

The build runs `scripts/generate_tool_catalog.py` before TypeScript and Vite. It derives the frontend catalog and SDK method maps from backend plugin manifests. After Vite builds the SPA, `scripts/generate-static-pages.mjs` emits crawlable tool/category entry pages, canonical and social metadata, JSON-LD, `sitemap.xml`, and `robots.txt`.

Set `VITE_SITE_URL` to the public site origin so canonical and sitemap URLs use the production domain.

For local development, keep `VITE_API_BASE_URL=/api`. Vite proxies that path to
FastAPI so session cookies stay same-origin whether the site is opened through
`localhost` or a LAN address. Production builds should set it to the public API
origin.

`AuthProvider` is the only global context. It owns the current user and session status and exposes session refresh, logout, and invalidation through `useAuth()`. API clients, tools, files, and jobs remain outside React Context.

## Commands

```bash
npm install
npm run generate
npm run dev
npm run build
npm run lint
```
