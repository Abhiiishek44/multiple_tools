import logging
import tempfile
from pathlib import Path, PurePosixPath
from typing import BinaryIO

import boto3
from botocore.client import BaseClient
from botocore.exceptions import ClientError


logger = logging.getLogger(__name__)


class MinioStorage:
    def __init__(
        self,
        *,
        bucket: str,
        endpoint: str,
        access_key: str,
        secret_key: str,
        region: str,
        secure: bool,
        auto_create_bucket: bool,
    ) -> None:
        self.bucket = bucket
        self.region = region
        self.client: BaseClient = boto3.client(
            "s3",
            endpoint_url=_endpoint_url(endpoint, secure),
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
            use_ssl=secure,
        )
        if auto_create_bucket:
            self._ensure_bucket()

    def save_stream(self, key: str, stream: BinaryIO, maximum_bytes: int) -> int:
        key = _validate_key(key)
        written = 0
        with tempfile.SpooledTemporaryFile(
            max_size=min(maximum_bytes, 8 * 1024 * 1024)
        ) as upload:
            while chunk := stream.read(1024 * 1024):
                written += len(chunk)
                if written > maximum_bytes:
                    raise ValueError(
                        f"File exceeds the {maximum_bytes} byte upload limit"
                    )
                upload.write(chunk)
            if written == 0:
                raise ValueError("Uploaded file is empty")
            upload.seek(0)
            self.client.upload_fileobj(upload, self.bucket, key)
        logger.debug("Saved artifact key=%s bytes=%d", key, written)
        return written

    def upload_file(self, key: str, source: Path) -> None:
        key = _validate_key(key)
        self.client.upload_file(str(source), self.bucket, key)
        logger.debug("Uploaded artifact key=%s bytes=%d", key, source.stat().st_size)

    def download_file(self, key: str, destination: Path) -> None:
        key = _validate_key(key)
        destination.parent.mkdir(parents=True, exist_ok=True)
        self.client.download_file(self.bucket, key, str(destination))
        logger.debug("Downloaded artifact key=%s", key)

    def open_reader(self, key: str) -> BinaryIO:
        key = _validate_key(key)
        return self.client.get_object(Bucket=self.bucket, Key=key)["Body"]

    def exists(self, key: str) -> bool:
        key = _validate_key(key)
        try:
            self.client.head_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError as error:
            code = str(error.response.get("Error", {}).get("Code", ""))
            if code in {"404", "NoSuchKey", "NotFound"}:
                return False
            raise

    def delete(self, key: str) -> None:
        key = _validate_key(key)
        self.client.delete_object(Bucket=self.bucket, Key=key)
        logger.debug("Deleted artifact key=%s", key)

    def _ensure_bucket(self) -> None:
        try:
            self.client.head_bucket(Bucket=self.bucket)
            return
        except ClientError as error:
            code = str(error.response.get("Error", {}).get("Code", ""))
            if code not in {"404", "NoSuchBucket", "NotFound"}:
                raise
        parameters: dict[str, object] = {"Bucket": self.bucket}
        if self.region != "us-east-1":
            parameters["CreateBucketConfiguration"] = {
                "LocationConstraint": self.region
            }
        try:
            self.client.create_bucket(**parameters)
        except ClientError as error:
            code = str(error.response.get("Error", {}).get("Code", ""))
            if code != "BucketAlreadyOwnedByYou":
                raise
        logger.info("Artifact bucket ready name=%s", self.bucket)


def _endpoint_url(endpoint: str | None, secure: bool) -> str | None:
    if not endpoint:
        return None
    endpoint = endpoint.removeprefix("http://").removeprefix("https://")
    scheme = "https" if secure else "http"
    return f"{scheme}://{endpoint}"


def _validate_key(key: str) -> str:
    path = PurePosixPath(key)
    if not key or key.startswith("/") or ".." in path.parts:
        raise ValueError("Invalid artifact key")
    return key
