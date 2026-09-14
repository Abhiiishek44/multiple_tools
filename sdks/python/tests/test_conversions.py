from pathlib import Path
from unittest.mock import AsyncMock, Mock, sentinel

import httpx
import pytest

from multipletools import Client
from multipletools.resources.conversions import (
    CONVERSION_TOOLS,
    AsyncConversions,
    Conversions,
)


@pytest.mark.parametrize(
    ("method_name", "tool_name"),
    CONVERSION_TOOLS.items(),
)
def test_conversion_shortcuts_delegate_to_jobs_create(
    method_name: str, tool_name: str
) -> None:
    jobs = Mock()
    jobs.create.return_value = sentinel.job
    conversions = Conversions(jobs)

    result = getattr(conversions, method_name)(
        "input.file",
        options={"quality": "balanced"},
        idempotency_key="operation-123",
        media_type="application/test",
    )

    assert result is sentinel.job
    jobs.create.assert_called_once_with(
        tool=tool_name,
        file="input.file",
        options={"quality": "balanced"},
        idempotency_key="operation-123",
        media_type="application/test",
    )


@pytest.mark.asyncio
async def test_async_conversion_shortcut_has_the_same_behavior() -> None:
    jobs = Mock()
    jobs.create = AsyncMock(return_value=sentinel.job)
    conversions = AsyncConversions(jobs)

    result = await conversions.pdf_to_word("document.pdf")

    assert result is sentinel.job
    jobs.create.assert_awaited_once_with(
        tool="pdf-to-word",
        file="document.pdf",
        options=None,
        idempotency_key=None,
        media_type=None,
    )


def test_shortcut_uses_the_tool_scoped_jobs_endpoint(tmp_path: Path) -> None:
    document = tmp_path / "document.pdf"
    document.write_bytes(b"pdf")
    requested_path = ""

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal requested_path
        requested_path = request.url.path
        return httpx.Response(
            202,
            json={
                "id": "job-123",
                "tool_name": "pdf-to-word",
                "tool_version": "1.0.0",
                "status": "QUEUED",
                "progress": 0,
                "input_filename": "document.pdf",
                "output_filename": None,
                "output_url": None,
                "error": None,
                "created_at": "2026-09-13T10:00:00Z",
                "started_at": None,
                "completed_at": None,
            },
        )

    with Client(
        api_key="key",
        base_url="https://api.test",
        transport=httpx.MockTransport(handler),
    ) as client:
        job = client.convert.pdf_to_word(document)

    assert job.id == "job-123"
    assert requested_path == "/v1/tools/pdf-to-word/jobs"
