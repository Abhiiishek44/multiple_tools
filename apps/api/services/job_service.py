"""HTTP-layer compatibility wrappers for the shared job service."""

import json
from typing import BinaryIO, Mapping

from packages.auth.principal import Principal
from packages.core.errors import ValidationError
from packages.jobs.models import Job
from packages.jobs import service as job_service


def submit_job(
    *,
    tool_name: str,
    filename: str | None,
    media_type: str | None,
    stream: BinaryIO,
    principal: Principal | None = None,
    user_id: str | None = None,
    client_ip: str | None = None,
    user_agent: str | None = None,
    options: Mapping[str, object] | None = None,
    options_json: str | None = None,
    idempotency_key: str | None = None,
) -> Job:
    actor = principal or Principal.for_user(_required_user_id(user_id))
    parsed_options = dict(options) if options is not None else parse_options(options_json)
    return job_service.submit_job(
        tool_name=tool_name,
        filename=filename,
        media_type=media_type,
        stream=stream,
        principal=actor,
        options=parsed_options,
        client_ip=client_ip,
        user_agent=user_agent,
        idempotency_key=idempotency_key,
    )


def parse_options(raw: str | None) -> dict[str, object]:
    if raw is None or not raw.strip():
        return {}
    if len(raw) > 10_000:
        raise ValidationError("Job options are too large")
    try:
        value = json.loads(raw)
    except json.JSONDecodeError as error:
        raise ValidationError("Options must be valid JSON") from error
    if not isinstance(value, dict) or not all(isinstance(key, str) for key in value):
        raise ValidationError("Options must be a JSON object")
    return value


_parse_options = parse_options


def find_job(
    job_id: str, user_id: str | None = None, principal: Principal | None = None
) -> Job:
    actor = principal or Principal.for_user(_required_user_id(user_id))
    return job_service.find_job(job_id, actor)


def output_reader(
    job_id: str, user_id: str | None = None, principal: Principal | None = None
) -> tuple[BinaryIO, str, str]:
    actor = principal or Principal.for_user(_required_user_id(user_id))
    return job_service.output_reader(job_id, actor)


def _required_user_id(user_id: str | None) -> str:
    if not user_id:
        raise TypeError("principal or user_id is required")
    return user_id
