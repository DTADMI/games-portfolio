# React Games Monorepo

Monorepo containing:
- Backend: Spring Boot (Java 17) with JWT auth, rate limiting, feature flags (FF4J), caching (Caffeine), health/metrics.
- Frontend: Next.js (App Router) with NextAuth, Tailwind (tokens), shadcn-like UI primitives, theme toggle, Playwright E2E + Vitest unit tests.
- Games: Each game (e.g., snake) lives under `games/*` as its own app.

Package manager: Bun. Backend build: Maven. Deployment target: Google Cloud Run (+ Cloud SQL Postgres).

## Prerequisites
- Bun >= 1.1.x
- Docker + Docker Compose
- Java 17 + Maven 3.9+
- Node 20 (Bun bundles its own, but Node is useful for tooling)
- gcloud CLI (for GCP deployment)

## Setup
1) Clone and install
```bash
bun install
```

2) Environment files
- Backend: copy `backend/.env.example` to `backend/.env` (or export env vars)
- Frontend: copy `frontend/.env.example` to `frontend/.env.local`

3) Start Postgres
```bash
docker compose up -d postgres
```

4) Run apps
```bash
# at repo root
bun run dev
# or individually
cd backend && mvn spring-boot:run
bun --cwd frontend run dev
```

Backend base URL: http://localhost:8080
Frontend base URL: http://localhost:3000

## Scripts (root)
- `bun run dev` — run backend + frontend concurrently
- `bun run build` — build backend (jar) and frontend
- `bun run lint` — eslint (flat) across repo
- `bun run format` — prettier write
- `bun run test` — runs frontend unit tests and backend tests

## Frontend (Next.js)
- NextAuth route: `frontend/app/api/auth/[...nextauth]/route.ts`
- Global providers: `frontend/app/layout.tsx` wraps `ThemeProvider` and `AppSessionProvider`
- Session hook usable in any client component: `useSession()`
- Theme toggle component: `components/theme-toggle.tsx`
- Minimal shadcn-like UI: `components/ui/button.tsx`

Run unit tests (Vitest + RTL):
```bash
bun --cwd frontend run test
```
Run e2e tests (Playwright):
```bash
bun --cwd frontend run dev
# in another terminal
auth.
```

Required env (frontend/.env.local):
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<long_random_string>
BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:8080/api
# Optional OAuth:
# GOOGLE_CLIENT_ID= ...
# GOOGLE_CLIENT_SECRET= ...
# GITHUB_CLIENT_ID= ...
# GITHUB_CLIENT_SECRET= ...
```

## Backend (Spring Boot)
Features:
- JWT auth: `/api/auth/signup`, `/api/auth/login`
- Rate limiting: global filter with `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`
- Feature flags (FF4J): `GET /api/features`, `POST /api/admin/features/{uid}/toggle?enable=true|false`
- Caching (Caffeine): `GET /api/featured` cached as `featuredGames`, eviction `POST /api/admin/cache/featured/evict`
- Actuator health/metrics

Run tests with Testcontainers:
```bash
cd backend
mvn -q -DskipTests=false test
```

Required env (backend/.env):
```
SPRING_PROFILES_ACTIVE=local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamesdb
DB_USER=postgres
DB_PASSWORD=postgres
APP_JWT_SECRET=change_me
APP_JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## Color palette & Tailwind tokens
Tokens are defined in `frontend/app/globals.css` using CSS custom properties for both light and dark themes. Primary accent uses an emerald/royal-green family, with additional accents available.

## Docker
Build images locally:
```bash
# frontend
docker build -t games-frontend:local ./frontend
# backend
docker build -t games-backend:local ./backend
```

## Deploy to Google Cloud Run
1) Build and push images
```bash
# set your project
gcloud config set project <PROJECT_ID>
# backend
docker build -t gcr.io/<PROJECT_ID>/games-backend:latest ./backend
docker push gcr.io/<PROJECT_ID>/games-backend:latest
# frontend
docker build -t gcr.io/<PROJECT_ID>/games-frontend:latest ./frontend
docker push gcr.io/<PROJECT_ID>/games-frontend:latest
```

2) Configure secrets and database
- Create Cloud SQL Postgres instance
- Store secrets (JWT, DB creds, NextAuth) in Secret Manager

3) Deploy services
```bash
gcloud run services replace infra/cloudrun/backend.yaml
gcloud run services replace infra/cloudrun/frontend.yaml
```

Follow comments in `infra/cloudrun/*.yaml` to wire Cloud SQL (private IP recommended) and secrets.

## Troubleshooting
- Ensure Docker Postgres is healthy: `docker ps` and `docker logs games_postgres`
- If frontend cannot reach backend, verify `BACKEND_URL` and CORS origins
- When Playwright fails, start dev server before running tests
- If Testcontainers pulls are slow, pre-pull `postgres:15-alpine`

## Contributing
- Pre-commit hooks will lint and format staged files.
- Keep semicolons and braces per ESLint rules; prefer clarity.
