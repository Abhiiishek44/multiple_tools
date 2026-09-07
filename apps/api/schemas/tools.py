from pydantic import BaseModel


class ToolResponse(BaseModel):
    name: str
    version: str
    description: str
    input_suffixes: list[str]
    output_suffix: str
    output_media_type: str
