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

````bash
# will auto-start the dev server defined in frontend/playwright.config.ts
cd frontend
bun test:e2e
```bash

In CI, Playwright browsers are installed and the E2E job runs headless with traces/screenshots on failure. Artifacts are
available in the workflow run summary.

Required env (frontend/.env.local):

````

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<long_random_string>
BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Optional OAuth:

# GOOGLE_CLIENT_ID= ...

# GOOGLE_CLIENT_SECRET= ...

# GITHUB_CLIENT_ID= ...

# GITHUB_CLIENT_SECRET= ...

````

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
````

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

## Start in production mode (local)

1. Build everything

```bash
bun run build
```

2. Start backend jar

```bash
cd backend
java -jar target/*.jar --spring.profiles.active=prod
```

3. Start frontend (Next.js) in production mode

```bash
cd frontend
bun run start
```

## Production database (Cloud SQL for PostgreSQL)

This service uses the `prod` Spring profile in production. In `prod`, the datasource is read from these environment
variables:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

For Google Cloud SQL with the Cloud SQL JDBC Socket Factory over Public IP, use a full JDBC URL like:

```
jdbc:postgresql:///gamesdb?cloudSqlInstance=games-portal-479600:northamerica-northeast1:games-postgresql-instance&socketFactory=com.google.cloud.sql.postgres.SocketFactory&ipTypes=PUBLIC&sslmode=disable
```

Where:

- PROJECT: `games-portal-479600`
- REGION: `northamerica-northeast1`
- INSTANCE: `games-postgresql-instance`
- INSTANCE_CONNECTION_NAME: `games-portal-479600:northamerica-northeast1:games-postgresql-instance`
- DB_NAME: `gamesdb`
- DB_USER: `postgres`

Set the credentials accordingly:

```
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<your-strong-password>
```

### Store DB envs in Secret Manager

Create three secrets and their initial versions (run once):

```bash
gcloud secrets create SPRING_DATASOURCE_URL --replication-policy=automatic
gcloud secrets create SPRING_DATASOURCE_USERNAME --replication-policy=automatic
gcloud secrets create SPRING_DATASOURCE_PASSWORD --replication-policy=automatic

# Add secret versions
echo -n "jdbc:postgresql:///gamesdb?cloudSqlInstance=games-portal-479600:northamerica-northeast1:games-postgresql-instance&socketFactory=com.google.cloud.sql.postgres.SocketFactory&ipTypes=PUBLIC&sslmode=disable" \
  | gcloud secrets versions add SPRING_DATASOURCE_URL --data-file=-
echo -n "postgres" | gcloud secrets versions add SPRING_DATASOURCE_USERNAME --data-file=-
echo -n "<your-strong-password>" | gcloud secrets versions add SPRING_DATASOURCE_PASSWORD --data-file=-
```

Grant access to the Cloud Run runtime service account so the service can read secrets at runtime:

```bash
PROJECT=games-portal-479600
REGION=northamerica-northeast1
SERVICE=games-backend

# Cloud Run runtime SA follows this pattern:
RUNTIME_SA="service-${PROJECT_NUMBER}@serverless-robot-prod.iam.gserviceaccount.com"

# Get project number and export it
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')
RUNTIME_SA="service-${PROJECT_NUMBER}@serverless-robot-prod.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:${RUNTIME_SA}" \
  --role="roles/secretmanager.secretAccessor"
```

Also ensure your GitHub Actions deploy service account (the one whose JSON key is stored in `GCP_SA_KEY`) has at least:

- Artifact Registry Writer: `roles/artifactregistry.writer`
- Cloud Run Admin: `roles/run.admin`
- Service Account User on the Cloud Run runtime SA: `roles/iam.serviceAccountUser`
- Secret Manager Accessor: `roles/secretmanager.secretAccessor`

### Cloud Run deployment with Cloud SQL connector and secrets

The CI workflow already deploys with:

```
--set-env-vars SPRING_PROFILES_ACTIVE=prod \
--add-cloudsql-instances "games-portal-479600:northamerica-northeast1:games-postgresql-instance" \
--set-secrets "SPRING_DATASOURCE_URL=SPRING_DATASOURCE_URL:latest,SPRING_DATASOURCE_USERNAME=SPRING_DATASOURCE_USERNAME:latest,SPRING_DATASOURCE_PASSWORD=SPRING_DATASOURCE_PASSWORD:latest"
```

This attaches the Cloud SQL connector to the service and injects the DB configuration from Secret Manager. No additional
proxy is required. The backend includes the Cloud SQL PostgreSQL Socket Factory dependency.

### Manual deploy example

If you want to deploy manually using the image built in Artifact Registry:

```bash
PROJECT=games-portal-479600
REGION=northamerica-northeast1
SERVICE=games-backend
IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/games/${SERVICE}:manual"

# Build and push image
gcloud auth configure-docker "${REGION}-docker.pkg.dev"
docker build -t "$IMAGE" -f backend/Dockerfile .
docker push "$IMAGE"

# Deploy to Cloud Run
gcloud run deploy "$SERVICE" \
  --region="$REGION" \
  --image="$IMAGE" \
  --allow-unauthenticated \
  --set-env-vars SPRING_PROFILES_ACTIVE=prod \
  --add-cloudsql-instances "games-portal-479600:northamerica-northeast1:games-postgresql-instance" \
  --set-secrets "SPRING_DATASOURCE_URL=SPRING_DATASOURCE_URL:latest,SPRING_DATASOURCE_USERNAME=SPRING_DATASOURCE_USERNAME:latest,SPRING_DATASOURCE_PASSWORD=SPRING_DATASOURCE_PASSWORD:latest"
```

Note: If you prefer a direct TCP connection via public IP without the Cloud SQL socket factory, you can also use a
conventional JDBC URL:

```
jdbc:postgresql://<PUBLIC_IP>:5432/gamesdb
```

But in that case you must configure authorized networks, SSL, and possibly IAM DB auth; the recommended approach on
Cloud Run is the Cloud SQL connector as shown above.

## Deploy to Google Cloud Run

We recommend using Artifact Registry (AR) for images and deploying to Cloud Run by image.

### Prerequisites

- Enable APIs: Artifact Registry, Cloud Run, Cloud Build, Cloud SQL Admin, Secret Manager.
- Create a service account with roles: Cloud Run Admin, Cloud Build Editor, Artifact Registry Writer, Secret Manager
  Accessor. Store its JSON key as repository secret `GCP_SA_KEY` (or use Workload Identity Federation for keyless).

### Create Artifact Registry repository (one time)

```bash
gcloud artifacts repositories create games \
  --repository-format=docker \
  --location=$REGION \
  --description="Games images"
```

### Build & push images (locally)

```bash
REGION=<your-region>
PROJECT=<your-project>
SHA=$(git rev-parse --short HEAD)

gcloud auth configure-docker ${REGION}-docker.pkg.dev

docker build -t ${REGION}-docker.pkg.dev/${PROJECT}/games/games-backend:${SHA} -f backend/Dockerfile .
docker push ${REGION}-docker.pkg.dev/${PROJECT}/games/games-backend:${SHA}

docker build -t ${REGION}-docker.pkg.dev/${PROJECT}/games/games-frontend:${SHA} -f frontend/Dockerfile .
docker push ${REGION}-docker.pkg.dev/${PROJECT}/games/games-frontend:${SHA}
```

### Deploy to Cloud Run (by image)

```bash
# Backend
gcloud run deploy games-backend \
  --region=$REGION \
  --image=${REGION}-docker.pkg.dev/${PROJECT}/games/games-backend:${SHA} \
  --allow-unauthenticated \
  --set-env-vars SPRING_PROFILES_ACTIVE=prod

# Frontend (SSR)
gcloud run deploy games-frontend \
  --region=$REGION \
  --image=${REGION}-docker.pkg.dev/${PROJECT}/games/games-frontend:${SHA} \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=https://<backend-domain>/api
```

Optional: put Cloud CDN in front of the frontend service via HTTPS Load Balancer to cache static assets.

### GitHub Actions CI/CD

- Repository secrets (Settings → Secrets and variables → Actions):
  - `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_SA_KEY` (JSON). Prefer WIF for keyless in production.
  - Optional variables: `AR_REPO` (default `games`), `BACKEND_SERVICE` (default `games-backend`), `FRONTEND_SERVICE` (
    default `games-frontend`), `NEXT_PUBLIC_API_URL`.
- The workflow `.github/workflows/ci-cd.yml` builds images, pushes to AR, and deploys to Cloud Run on pushes to `main`
  when secrets exist.

## Troubleshooting

- Ensure Docker Postgres is healthy: `docker ps` and `docker logs games_postgres`
- If frontend cannot reach backend, verify `BACKEND_URL` and CORS origins
- When Playwright fails, start dev server before running tests
- If Testcontainers pulls are slow, pre-pull `postgres:15-alpine`
- If Cloud Run deploy fails: confirm `GCP_PROJECT_ID`, `GCP_REGION`, and `GCP_SA_KEY` secrets; ensure the Artifact
  Registry repo exists and you ran `gcloud auth configure-docker <region>-docker.pkg.dev` locally.

## Cloud services, variables and secrets

Below is a checklist of required variables/secrets and how to obtain them.

### Frontend (Next.js)

- `NEXTAUTH_URL` (secret): canonical site URL (e.g., https://app.example.com).
- `NEXTAUTH_SECRET` (secret): generate with `openssl rand -base64 32`.
- `NEXT_PUBLIC_API_URL` (variable): base URL to backend API (e.g., https://api.example.com/api or the Cloud Run backend
  URL + `/api`).
- Stripe (optional; behind `payments.stripe_enabled`):
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (variable): from Stripe Dashboard → Developers → API keys.
  - `STRIPE_SECRET_KEY` (secret): Stripe secret key (store in Secret Manager / GitHub Actions secret).
  - `STRIPE_WEBHOOK_SECRET` (secret): after creating a webhook endpoint in Stripe (test mode), copy the signing secret.

### Backend (Spring Boot)

- Database (Cloud SQL):
  - `SPRING_DATASOURCE_URL`: jdbc:postgresql://<PRIVATE_IP_OR_PROXY>/<DB_NAME>
  - `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` (Secret Manager / Actions secret).
- JWT:
  - `APP_JWT_SECRET` (secret) and `APP_JWT_EXPIRATION_MS` (e.g., 86400000).
- Feature flags:
  - Unleash (default): `UNLEASH_URL`, `UNLEASH_INSTANCE_ID`/token (if secured). Or rely on built-in overlay +
    `application.yml` defaults.
  - flagd (dev only): `FLAGD_ENDPOINT` (optional).
- Redis (optional): `REDIS_HOST`, `REDIS_PORT` (Memorystore). Enable with `features.cache.redis_enabled=true`.
- Stripe (optional): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

### GCP (CI/CD)

- `GCP_PROJECT_ID` (secret): GCP project ID (e.g., my-project-123).
- `GCP_REGION` (secret): GCP region (e.g., us-central1).
- `GCP_SA_KEY` (secret): JSON key for a service account with roles: Cloud Run Admin, Cloud Build Editor, Artifact
  Registry Writer, Secret Manager Accessor.
  - Recommended: switch to Workload Identity Federation to avoid JSON keys.

## Feature Flags provider

Default: **Unleash** (production/staging). Optional: **flagd** (dev/local).

Pros Unleash: battle-tested, UI & strategies (gradual, constraints), Postgres store, good Spring integration.
Cons: extra service to host.

Pros flagd: light & fast for local, spec-compliant (OpenFeature).
Cons: fewer strategies/UI; better for dev than prod.

We will progressively enable external providers via flags:

- `payments.stripe_enabled`: internal → Stripe; cohort rollouts supported.
- `cache.redis_enabled` / `kv.redis_enabled`: in-proc Caffeine → Memorystore.
- `db.external_enabled`: dev embedded DB → Cloud SQL in prod.
- `mail.provider`: smtp | ses | mailgun.
- `realtime.provider`: spring-ws | managed; fallback to polling.

## Contributing

- Pre-commit hooks will lint and format staged files.
- Keep semicolons and braces per ESLint rules; prefer clarity.

## Observability Profile (optional)

To run the observability stack only when needed, use Docker Compose profiles:

```bash
# Start core stack (Postgres, Redis, backend, frontend)
docker compose up -d

# Start with observability (Elasticsearch, Logstash, Kibana, Prometheus, Grafana, Filebeat)
docker compose --profile observability up -d

# Later, stop only observability services
docker compose --profile observability stop
```

Services behind the `observability` profile:

- Elasticsearch, Logstash, Kibana (ELK)
- Prometheus, Grafana
- Filebeat

The core application services run without this profile.

## Games in App Router

All games are consolidated under the Next.js App Router at `frontend/app/games`:

- `/games` — gallery
- `/games/snake` — Snake
- `/games/memory` — Memory
- `/games/breakout` — Breakout

Game components remain authored under `games/*` packages and are imported via monorepo aliases configured in `next.config.ts`.

## Bun as the JS runtime

This repo is standardized on Bun. Typical commands:

```bash
bun install
bun run dev
bun run build
bun run test
```

## Color palette suggestion

A modern, accessible palette with strong dark-mode support:

- Primary (emerald): 600 `#059669`, 700 `#047857`
- Secondary (indigo): 600 `#4F46E5`, 700 `#4338CA`
- Accent (amber): 500 `#F59E0B`
- Foreground: `#0F172A` (slate-900), `#111827` (gray-900)
- Background (light): `#F8FAFC` (slate-50)
- Background (dark): `#0B1020`

These can map to CSS variables in `globals.css` and be consumed by shadcn/ui components for consistent theming.

## Next steps: UX and multiplayer enhancements

Planned, feature-flagged improvements for engagement:

- UX: pause/resume, touch controls, sound/music toggles, difficulty presets, persistent high scores
- Social: session-based nicknames, shareable score cards
- Realtime: basic presence and live leaderboard via backend WebSocket channel

Please confirm which game to prioritize for the first multiplayer prototype (Snake or Breakout recommended). Once confirmed, we’ll wire the backend WS topic, add client hooks, and ship tests (integration + e2e).
