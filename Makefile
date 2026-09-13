SHELL := /bin/bash

API_ENV := env/local/api.env
WORKER_ENV := env/local/worker.env
WEB_ENV := env/local/web.env
COMPOSE := docker compose --env-file $(API_ENV) -f infrastructure/compose.yaml

IMAGE_REGISTRY ?= docker.io/abhiiikumbhar
IMAGE_TAG ?= latest
RELEASE_VERSION ?= $(shell git describe --tags --always --dirty)
API_IMAGE := $(IMAGE_REGISTRY)/multiple-tools-api
WORKER_IMAGE := $(IMAGE_REGISTRY)/multiple-tools-worker
WEB_IMAGE := $(IMAGE_REGISTRY)/multiple-tools-web

.DEFAULT_GOAL := help

.PHONY: help setup env install dev api worker beat web \
	infra-up infra-down infra-logs db-migrate check build sdk-build clean \
	docker-build-api docker-build-worker docker-build-web docker-images \
	docker-release require-api-env require-worker-env require-web-env

help: ## Show available commands
	@printf '%s\n' \
		'MULTIPLE TOOLS' \
		'' \
		'Development Commands' \
		'  help             Show available commands' \
		'  setup            Create env files, install dependencies, start infrastructure, and migrate' \
		'  install          Install Python and frontend dependencies' \
		'  dev              Run API, worker, scheduler, and frontend' \
		'  api              Start FastAPI' \
		'  worker           Start Celery worker' \
		'  beat             Start Celery scheduler' \
		'  web              Start frontend' \
		'  infra-up         Start PostgreSQL, Redis, and MinIO' \
		'  infra-down       Stop infrastructure' \
		'  infra-logs       Follow infrastructure logs' \
		'  db-migrate       Apply database migrations' \
		'  check            Compile backend, lint frontend, and run tests' \
		'  build            Build frontend and all SDK packages' \
		'  sdk-build        Build all SDK packages' \
		'  clean            Remove generated build artifacts' \
		'' \
		'Container images' \
		'  docker-build-api        Build the API image' \
		'  docker-build-worker     Build the worker image' \
		'  docker-build-web        Build the web image' \
		'  docker-images           Build all application images' \
		'  docker-release          Build and push versioned images'

setup: env ## Create env files, install dependencies, start infrastructure, and migrate
	@$(MAKE) --no-print-directory install
	@$(MAKE) --no-print-directory infra-up
	@$(MAKE) --no-print-directory db-migrate

env:
	@mkdir -p env/local
	@for service in api worker web; do \
		target="env/local/$$service.env"; \
		if [[ -e "$$target" ]]; then \
			printf 'Keeping existing %s\n' "$$target"; \
		else \
			cp "env/examples/$$service.env.example" "$$target"; \
			printf 'Created %s\n' "$$target"; \
		fi; \
	done
	@for key in JWT_SECRET API_KEY_HMAC_SECRET; do \
		if grep -q "^$$key=$$" "$(API_ENV)"; then \
			value="$$(openssl rand -hex 32)"; \
			sed -i "s|^$$key=$$|$$key=$$value|" "$(API_ENV)"; \
			printf 'Generated %s in %s\n' "$$key" "$(API_ENV)"; \
		fi; \
	done

install: ## Install Python and frontend dependencies
	uv sync --frozen
	uv sync --project sdks/python --all-extras --frozen
	npm --prefix apps/web ci

dev: require-api-env require-worker-env require-web-env ## Run API, worker, scheduler, and frontend
	@$(MAKE) --no-print-directory -j4 api worker beat web

api: require-api-env ## Start FastAPI
	@set -a; source "$(API_ENV)"; set +a; \
		exec  uv run uvicorn apps.api.main:app --host 0.0.0.0  --reload

worker: require-worker-env ## Start Celery worker
	@set -a; source "$(WORKER_ENV)"; set +a; \
		exec uv run celery --app=apps.worker.celery_app:celery_app worker --loglevel=INFO

beat: require-worker-env ## Start Celery scheduler
	@set -a; source "$(WORKER_ENV)"; set +a; \
		exec uv run celery --app=apps.worker.celery_app:celery_app beat --loglevel=INFO

web: require-web-env ## Start frontend
	@set -a; source "$(WEB_ENV)"; set +a; \
		exec npm --prefix apps/web run dev

infra-up: require-api-env ## Start PostgreSQL, Redis, and MinIO
	$(COMPOSE) up -d --wait

infra-down: ## Stop infrastructure
	docker compose -f infrastructure/compose.yaml down

infra-logs: ## Follow infrastructure logs
	docker compose -f infrastructure/compose.yaml logs --follow

db-migrate: require-api-env ## Apply database migrations
	@set -a; source "$(API_ENV)"; set +a; \
		uv run python scripts/migrate.py

check: ## Compile backend, lint frontend, and run tests
	uv run python -m compileall -q apps packages plugins scripts
	@if [[ -d tests ]]; then \
		uv run python -m unittest discover -s tests -v; \
	else \
		printf 'No backend tests directory; skipping backend tests.\n'; \
	fi
	@if [[ -d sdks/python/tests ]]; then \
		uv run --project sdks/python --extra test pytest; \
	else \
		printf 'No Python SDK tests directory; skipping SDK tests.\n'; \
	fi
	npm --prefix apps/web run lint

build: ## Build frontend and all SDK packages
	npm --prefix apps/web run build
	@$(MAKE) --no-print-directory sdk-build

sdk-build: ## Build all SDK packages
	uv build --clear sdks/python

clean: ## Remove generated build artifacts
	rm -rf build dist apps/web/dist sdks/python/build sdks/python/dist \
		sdks/python/src/*.egg-info .pytest_cache htmlcov .coverage
	find apps packages plugins sdks -type d -name __pycache__ -prune -exec rm -rf {} +
	find apps packages plugins sdks -type f \( -name '*.pyc' -o -name '*.pyo' \) -delete

docker-build-api: ## Build the API image
	docker build --file docker/Dockerfile.api --tag "$(API_IMAGE):$(IMAGE_TAG)" .

docker-build-worker: ## Build the worker image
	docker build --file docker/Dockerfile.worker --tag "$(WORKER_IMAGE):$(IMAGE_TAG)" .

docker-build-web: require-web-env ## Build the web image
	@set -a; source "$(WEB_ENV)"; set +a; \
		docker build \
			--file docker/Dockerfile.web \
			--build-arg "VITE_API_BASE_URL=$$VITE_API_BASE_URL" \
			--build-arg "VITE_GOOGLE_CLIENT_ID=$$VITE_GOOGLE_CLIENT_ID" \
			--tag "$(WEB_IMAGE):$(IMAGE_TAG)" .

docker-images: docker-build-api docker-build-worker docker-build-web ## Build all application images

docker-release: ## Build and push versioned images
	@$(MAKE) --no-print-directory IMAGE_TAG="$(RELEASE_VERSION)" docker-images
	docker push "$(API_IMAGE):$(RELEASE_VERSION)"
	docker push "$(WORKER_IMAGE):$(RELEASE_VERSION)"
	docker push "$(WEB_IMAGE):$(RELEASE_VERSION)"

require-api-env:
	@test -f "$(API_ENV)" || { printf 'Missing %s; run make env or make setup.\n' "$(API_ENV)" >&2; exit 1; }

require-worker-env:
	@test -f "$(WORKER_ENV)" || { printf 'Missing %s; run make env or make setup.\n' "$(WORKER_ENV)" >&2; exit 1; }

require-web-env:
	@test -f "$(WEB_ENV)" || { printf 'Missing %s; run make env or make setup.\n' "$(WEB_ENV)" >&2; exit 1; }
