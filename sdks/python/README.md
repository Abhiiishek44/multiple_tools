# Multiple Tools Python SDK

Typed synchronous Python client for the Multiple Tools HTTP API. The SDK talks
only to FastAPI and has no database, object-storage, Redis, Celery, or plugin
dependencies.

## Installation

```bash
pip install ./sdks/python
```

## Usage

```python
from multipletools import Client

client = Client(
    api_key="mt_live_...",
    base_url="https://api.example.com",
    timeout=60.0,
)

job = client.jobs.create(
    tool="pdf_to_word",  # underscore aliases are normalized to pdf-to-word
    file="document.pdf",
)

job = client.jobs.get(job.id)
if job.status == "SUCCESS":
    client.jobs.download(job.id, "converted.docx")

client.close()
```

The client can also be used as a context manager. `jobs.create` generates an
idempotency key automatically; pass `idempotency_key=` to reuse one across an
application-level retry. Tool-specific options are sent with `options={...}`.
If the platform cannot infer a file's MIME type, pass `media_type=` explicitly.

```python
with Client(api_key="mt_live_...", base_url="http://localhost:8000") as client:
    tools = client.tools.list()
    job = client.jobs.create(
        tool="rotate-pdf",
        file="document.pdf",
        options={"angle": 90},
        idempotency_key="conversion-123",
    )
```

HTTP failures raise typed exceptions from `multipletools.exceptions`, including
`AuthenticationError`, `PermissionDeniedError`, `ValidationError`,
`NotFoundError`, `ConflictError`, `RateLimitError`, `TimeoutError`, and
`ConnectionError`.
