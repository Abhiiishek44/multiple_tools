SHELL := /bin/bash

BACKEND_ENV := .env
WEB_ENV := apps/web/.env
COMPOSE := docker compose --env-file $(BACKEND_ENV) -f deploy/compose.yaml

IMAGE_REGISTRY ?= docker.io/abhiiikumbhar
IMAGE_TAG ?= latest
RELEASE_VERSION ?= $(shell git describe --tags --always --dirty)
API_IMAGE := $(IMAGE_REGISTRY)/multiple-tools-api
WORKER_IMAGE := $(IMAGE_REGISTRY)/multiple-tools-worker
WEB_IMAGE := $(IMAGE_REGISTRY)/multiple-tools-web

.DEFAULT_GOAL := help

.PHONY: help setup env install generate dev api worker beat web \
	infra-up infra-down infra-logs db-migrate check build clean \
	sdk-build sdk-build-python sdk-publish-python \
	sdk-build-typescript sdk-publish-typescript \
	docker-build-api docker-build-worker docker-build-web docker-images \
	docker-release require-backend-env require-web-env

help: ## Show available commands
	@printf '%s\n' \
		'MULTIPLE TOOLS' \
		'' \
		'Development Commands' \
		'  help             Show available commands' \
		'  setup            Create env files, install dependencies, start infrastructure, and migrate' \
		'  install          Install Python and frontend dependencies' \
		'  generate         Generate frontend and SDK tool catalogs' \
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
		'  clean            Remove generated build artifacts' \
		'' \
		'SDK packages' \
		'  sdk-build               Build all SDK packages' \
		'  sdk-build-python        Build the Python SDK package' \
		'  sdk-publish-python      Build and publish the Python SDK to PyPI' \
		'  sdk-build-typescript    Build the TypeScript SDK package' \
		'  sdk-publish-typescript  Build and publish the TypeScript SDK to npm' \
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
	@if [[ -e "$(BACKEND_ENV)" ]]; then \
		printf 'Keeping existing %s\n' "$(BACKEND_ENV)"; \
	else \
		cp env/examples/backend.env.example "$(BACKEND_ENV)"; \
		printf 'Created %s\n' "$(BACKEND_ENV)"; \
	fi
	@if [[ -e "$(WEB_ENV)" ]]; then \
		printf 'Keeping existing %s\n' "$(WEB_ENV)"; \
	else \
		cp apps/web/.env.example "$(WEB_ENV)"; \
		printf 'Created %s\n' "$(WEB_ENV)"; \
	fi
	@for key in JWT_SECRET API_KEY_HMAC_SECRET; do \
		if grep -q "^$$key=$$" "$(BACKEND_ENV)"; then \
			value="$$(openssl rand -hex 32)"; \
			sed -i "s|^$$key=$$|$$key=$$value|" "$(BACKEND_ENV)"; \
			printf 'Generated %s in %s\n' "$$key" "$(BACKEND_ENV)"; \
		fi; \
	done

install: ## Install Python and frontend dependencies
	uv sync --frozen
	uv sync --project sdks/python --all-extras --frozen
	npm --prefix apps/web ci
	npm --prefix sdks/typescript ci

generate: ## Generate frontend and SDK tool catalogs
	uv run python scripts/generate_tool_catalog.py

dev: require-backend-env require-web-env ## Run API, worker, scheduler, and frontend
	@$(MAKE) --no-print-directory -j4 api worker beat web

api: require-backend-env ## Start FastAPI
	@set -a; source "$(BACKEND_ENV)"; set +a; \
		exec  uv run uvicorn apps.api.main:app --host 0.0.0.0  --reload

worker: require-backend-env ## Start Celery worker
	@set -a; source "$(BACKEND_ENV)"; set +a; \
		exec uv run celery --app=apps.worker.celery_app:celery_app worker --loglevel=INFO

beat: require-backend-env ## Start Celery scheduler
	@set -a; source "$(BACKEND_ENV)"; set +a; \
		exec uv run celery --app=apps.worker.celery_app:celery_app beat --loglevel=INFO

web: require-web-env ## Start frontend
	@set -a; source "$(WEB_ENV)"; set +a; \
		exec npm --prefix apps/web run dev

infra-up: require-backend-env ## Start PostgreSQL, Redis, and MinIO
	$(COMPOSE) up -d --wait

infra-down: ## Stop infrastructure
	docker compose -f deploy/compose.yaml down

infra-logs: ## Follow infrastructure logs
	docker compose -f deploy/compose.yaml logs --follow

db-migrate: require-backend-env ## Apply database migrations
	@set -a; source "$(BACKEND_ENV)"; set +a; \
		uv run python scripts/migrate.py

check: generate ## Compile backend, lint frontend, and run tests
	uv run python -m compileall -q apps packages plugins infrastructure scripts
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

sdk-build: sdk-build-python sdk-build-typescript ## Build all SDK packages

sdk-build-python: generate ## Build the Python SDK package
	uv build --clear sdks/python

sdk-publish-python: sdk-build-python ## Build and publish the Python SDK to PyPI
	uv publish sdks/python/dist/*.whl sdks/python/dist/*.tar.gz

sdk-build-typescript: generate ## Build the TypeScript SDK package
	npm --prefix sdks/typescript run build

sdk-publish-typescript: sdk-build-typescript ## Build and publish the TypeScript SDK to npm
	npm --prefix sdks/typescript publish --access public --provenance=false

clean: ## Remove generated build artifacts
	rm -rf build dist apps/web/dist sdks/python/build sdks/python/dist \
		sdks/python/src/*.egg-info .pytest_cache htmlcov .coverage
	find apps packages plugins infrastructure sdks -type d -name __pycache__ -prune -exec rm -rf {} +
	find apps packages plugins infrastructure sdks -type f \( -name '*.pyc' -o -name '*.pyo' \) -delete

docker-build-api: ## Build the API image
	docker build --file deploy/docker/Dockerfile.api --tag "$(API_IMAGE):$(IMAGE_TAG)" .

docker-build-worker: ## Build the worker image
	docker build --file deploy/docker/Dockerfile.worker --tag "$(WORKER_IMAGE):$(IMAGE_TAG)" .

docker-build-web: require-web-env ## Build the web image
	@set -a; source "$(WEB_ENV)"; set +a; \
		docker build \
			--file deploy/docker/Dockerfile.web \
			--build-arg "VITE_API_BASE_URL=$$VITE_API_BASE_URL" \
			--build-arg "VITE_GOOGLE_CLIENT_ID=$$VITE_GOOGLE_CLIENT_ID" \
			--build-arg "VITE_SITE_URL=$$VITE_SITE_URL" \
			--tag "$(WEB_IMAGE):$(IMAGE_TAG)" .

docker-images: docker-build-api docker-build-worker docker-build-web ## Build all application images

docker-release: ## Build and push versioned images
	@$(MAKE) --no-print-directory IMAGE_TAG="$(RELEASE_VERSION)" docker-images
	docker push "$(API_IMAGE):$(RELEASE_VERSION)"
	docker push "$(WORKER_IMAGE):$(RELEASE_VERSION)"
	docker push "$(WEB_IMAGE):$(RELEASE_VERSION)"

require-backend-env:
	@test -f "$(BACKEND_ENV)" || { printf 'Missing %s; run make env or make setup.\n' "$(BACKEND_ENV)" >&2; exit 1; }

require-web-env:
	@test -f "$(WEB_ENV)" || { printf 'Missing %s; run make env or make setup.\n' "$(WEB_ENV)" >&2; exit 1; }
