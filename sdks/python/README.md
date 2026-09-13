# Multiple Tools Python SDK

Typed synchronous and asynchronous Python clients for the Multiple Tools HTTP
API. The SDK communicates only with the API and has no database, object storage,
Redis, Celery, or plugin dependencies.

## Installation

```bash
pip install multipletools
```

For local development from the repository root:

```bash
pip install ./sdks/python
```

## Usage

```python
from multipletools import Client

with Client(
    api_key="mt_live_...",
    base_url="https://api.example.com",
    timeout=60.0,
) as client:
    job = client.jobs.create(
        tool="pdf-to-word",
        file="document.pdf",
    )
    job = client.jobs.get(job.id)
    if job.status == "SUCCESS":
        client.jobs.download(job.id, "converted.docx")
```

`jobs.create` generates an idempotency key automatically. Pass
`idempotency_key=` to reuse one across an application-level retry, and pass
tool-specific settings with `options={...}`.

HTTP failures raise typed exceptions from `multipletools.exceptions`, including
authentication, permission, validation, not-found, conflict, rate-limit,
timeout, and connection errors.
