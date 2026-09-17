from pydantic import BaseModel

from packages.stats.models import PublicStats


class ToolConversionStatsResponse(BaseModel):
    total: int
    successful: int


class PublicStatsResponse(BaseModel):
    total_conversions: int
    today_conversions: int
    successful_conversions: int
    per_tool: dict[str, ToolConversionStatsResponse]

    @classmethod
    def from_stats(cls, stats: PublicStats) -> "PublicStatsResponse":
        return cls(
            total_conversions=stats.total_conversions,
            today_conversions=stats.today_conversions,
            successful_conversions=stats.successful_conversions,
            per_tool={
                slug: ToolConversionStatsResponse(
                    total=values.total, successful=values.successful
                )
                for slug, values in stats.per_tool.items()
            },
        )
