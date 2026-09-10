# Railway CI/CD deployment

This repository is ready to run as three Railway application services backed by
Railway PostgreSQL, Redis, and a Railway Bucket:

| Service | Source root | Dockerfile | Public domain |
| --- | --- | --- | --- |
| `api` | `/` | `/docker/Dockerfile.api` | Yes |
| `worker` | `/` | `/docker/Dockerfile.worker` | No |
| `web` | `/` | `/docker/Dockerfile.web` | Yes |

The worker image contains LibreOffice for the Office conversion plugins; the
API image does not carry that large runtime dependency. The frontend image
serves the Vite SPA with Caddy and falls back to `index.html` for client-side
routes.

Each image has an independent Dockerfile. The API image stays small, while the
worker image includes LibreOffice and embedded Beat:

```bash
docker build -f docker/Dockerfile.api -t multiple-tools-api .
docker build -f docker/Dockerfile.worker -t multiple-tools-worker .
docker build -f docker/Dockerfile.web -t multiple-tools-web .
```

On successful pushes to `main`, GitHub Actions publishes these images:

```text
ghcr.io/abhiiishek44/multiple-tools-api:latest
ghcr.io/abhiiishek44/multiple-tools-worker:latest
ghcr.io/abhiiishek44/multiple-tools-web:latest
```

Every image is also tagged with its Git commit SHA for immutable releases.

## 1. GitHub configuration

Push this repository to GitHub. In **Settings → Branches**, protect `main` and
require these CI checks:

- `Backend tests`
- `Frontend checks`
- `Build and publish containers`

The workflow in `.github/workflows/ci.yml` runs for pull requests and pushes to
`main`. It uses GitHub's built-in `GITHUB_TOKEN` to publish containers, so no
Railway token is needed in GitHub.

Before the first push to `main`, create these GitHub repository variables under
**Settings → Secrets and variables → Actions → Variables**:

```text
VITE_API_BASE_URL=https://your-api-domain.up.railway.app
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

The workflow intentionally fails a production image build when either value is
missing, preventing a broken frontend image from being published.

After the first successful workflow, open each package in GitHub under
**Packages → Package settings** and make it public, or provide Railway with a
GitHub personal access token that can pull private packages.

## 2. Create Railway resources

Create an empty Railway project in the region closest to the application's
users. Add:

1. Railway PostgreSQL
2. Railway Redis
3. A Railway Bucket named `artifacts`
4. Empty services named `api`, `worker`, and `web`

Keep all resources in the same Railway project and environment. The API and
worker services must use the same database, Redis, bucket, JWT, and OCR
settings.

## 3. Connect the repository

Connect all three application services to this GitHub repository and select the
`main` branch.

Leave the root directory as `/` for all three services so every Dockerfile can
access the repository files it copies. In each service's build settings, set
the custom Dockerfile path shown in the table. Leave all three custom start
commands empty because each image defines its own `CMD`.

Alternatively, use **Connect Image** for each Railway service and select:

| Railway service | Container image |
| --- | --- |
| `api` | `ghcr.io/abhiiishek44/multiple-tools-api:latest` |
| `worker` | `ghcr.io/abhiiishek44/multiple-tools-worker:latest` |
| `web` | `ghcr.io/abhiiishek44/multiple-tools-web:latest` |

When using the published worker image, leave the Railway start-command override
empty because its image already contains the combined Worker and Beat command.
The same applies to the API and web images. Configure Railway image auto-updates
for the `latest` tags, or deploy the immutable commit-SHA tag for controlled
releases.

Beat is embedded in the worker to stay within Railway's service limit. Run
exactly one `worker` replica: multiple replicas would start multiple schedulers
and enqueue each periodic cleanup task more than once. The schedule database is
placed in `/tmp` because the application directory is read-only to the
non-root container user. If the application later needs multiple worker
replicas, move Beat back into a separate service first.

## 4. Variables

Create shared variables for secrets and ordinary application settings, then
reference the Railway resource variables from each backend service. Resource
names in `${{...}}` must match their names on the Railway canvas.

Set these on `api` and `worker`:

```dotenv
DATABASE_URL=${{Postgres.DATABASE_URL}}
CELERY_BROKER_URL=${{Redis.REDIS_URL}}
CELERY_RESULT_BACKEND=${{Redis.REDIS_URL}}

STORAGE_BACKEND=minio
MINIO_ENDPOINT=${{artifacts.ENDPOINT}}
MINIO_BUCKET=${{artifacts.BUCKET}}
MINIO_ACCESS_KEY=${{artifacts.ACCESS_KEY_ID}}
MINIO_SECRET_KEY=${{artifacts.SECRET_ACCESS_KEY}}
MINIO_REGION=${{artifacts.REGION}}
MINIO_SECURE=true
MINIO_AUTO_CREATE_BUCKET=false
MINIO_ADDRESSING_STYLE=virtual
MINIO_TEMP_PREFIX=jobs/

GOOGLE_CLIENT_ID=replace-with-google-client-id.apps.googleusercontent.com
JWT_SECRET=replace-with-a-random-secret-of-at-least-32-characters
JWT_EXPIRATION_MINUTES=60
JWT_ISSUER=multiple-tools-api
JWT_AUDIENCE=multiple-tools-web

OPENROUTER_API_KEY=replace-with-openrouter-key
OPENROUTER_OCR_MODEL=replace-with-vision-model
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TIMEOUT_SECONDS=120
OCR_MAX_PIXELS=40000000
OCR_MAX_PAYLOAD_BYTES=20971520

MAX_UPLOAD_BYTES=52428800
AUTH_COOKIE_SECURE=true
FRONTEND_URL=https://replace-with-web-domain
CORS_ORIGINS=https://replace-with-web-domain
```

Despite the `MINIO_*` compatibility names, production uses Railway's managed
S3-compatible Bucket. `MINIO_AUTO_CREATE_BUCKET=false` is important because
Railway has already provisioned it, and Railway Buckets require virtual-hosted
addressing.

When Railway builds from the GitHub source, set these build variables on `web`:

```dotenv
VITE_API_BASE_URL=https://replace-with-api-domain
VITE_GOOGLE_CLIENT_ID=replace-with-google-client-id.apps.googleusercontent.com
```

Vite embeds these values at build time, so changing either variable requires a
new frontend deployment. When using the prebuilt GHCR image, these values come
from the GitHub repository variables described above; Railway runtime variables
cannot alter an already-built Vite bundle. Seal all secrets in Railway.

## 5. API deployment settings

Generate a public domain for `api`, and set:

```text
Healthcheck path: /health
Healthcheck timeout: 300 seconds
Pre-deploy command: python /app/scripts/migrate.py
Restart policy: ON_FAILURE
```

The migration runner:

- obtains a PostgreSQL advisory lock;
- creates a `schema_migrations` ledger;
- applies unapplied SQL files in filename order;
- refuses to continue if an already-applied migration was edited.

Never edit an applied migration. Add a new numbered SQL file instead.

## 6. Frontend deployment settings

Generate a public domain for `web` and use `/health` as its healthcheck path.
The included Caddy configuration serves `/dashboard`, `/tools/*`, and `/jobs/*`
through the SPA fallback.

After Railway assigns both domains, replace the placeholder domain variables
and redeploy the affected services.

In Google Cloud Console, add the production frontend domain as an authorized
JavaScript origin. Configure any authorized callback URLs required by the
Google OAuth client.

## 7. Enable CD after CI

For every application service, open **Settings → Source**:

1. Enable GitHub autodeploys for `main`.
2. Enable **Wait for CI**.
3. Accept any updated GitHub App permissions if Railway requests them.

Railway now creates a deployment for a push to `main`, waits for the GitHub
workflow, skips the deployment if any CI job fails, and deploys if all jobs
succeed.

Optional watch paths can reduce unnecessary builds:

```text
api, worker:
  /apps/**
  /packages/**
  /plugins/**
  /scripts/**
  /infrastructure/migrations/**
  /pyproject.toml
  /uv.lock
  /docker/Dockerfile.api
  /docker/Dockerfile.worker

web:
  /apps/web/**
  /docker/Dockerfile.web
```

Use only the Dockerfile belonging to each service in its actual watch-path
list; the combined example above shows the possible backend paths.

## 8. Release verification

After the first deployment:

1. Open `https://<api-domain>/health` and expect `{"status":"ok"}`.
2. Open the frontend and refresh directly on `/dashboard`.
3. Sign in with Google.
4. Submit a conversion and confirm the worker completes it.
5. Download the output and confirm the Bucket received objects under `jobs/`.
6. Check worker logs and confirm the embedded Beat scheduler starts once.

Railway references:

- <https://docs.railway.com/deployments/github-autodeploys>
- <https://docs.railway.com/deployments/monorepo>
- <https://docs.railway.com/builds/dockerfiles>
- <https://docs.railway.com/storage-buckets>
- <https://docs.railway.com/deployments/healthchecks>
