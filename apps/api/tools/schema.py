from pydantic import BaseModel


class ToolOptionChoiceResponse(BaseModel):
    value: str | int
    label: str


class ToolOptionResponse(BaseModel):
    name: str
    label: str
    type: str
    required: bool
    description: str
    default: str | int | None
    choices: list[ToolOptionChoiceResponse]


class ToolResponse(BaseModel):
    name: str
    slug: str
    display_name: str
    title: str
    description: str
    category: str
    category_slug: str
    category_description: str
    input_suffixes: list[str]
    input_media_types: list[str]
    input_formats: list[str]
    output_suffix: str
    output_media_type: str
    output_formats: list[str]
    features: list[str]
    options: list[ToolOptionResponse]
    keywords: list[str]
    how_it_works: list[str]
