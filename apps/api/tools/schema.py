from pydantic import BaseModel


class ToolResponse(BaseModel):
    name: str
    version: str
    description: str
    input_suffixes: list[str]
    input_media_types: list[str]
    output_suffix: str
    output_media_type: str
