from infrastructure.database import database_connection
from packages.stats.models import PublicStats, ToolConversionStats


def get_public_stats() -> PublicStats:
    with database_connection() as connection:
        totals = connection.execute(
            """
            SELECT
                COUNT(*)::bigint AS total_conversions,
                COUNT(*) FILTER (
                    WHERE created_at >= date_trunc('day', NOW())
                )::bigint AS today_conversions,
                COUNT(*) FILTER (WHERE status = 'SUCCESS')::bigint
                    AS successful_conversions
            FROM tool_jobs
            """
        ).fetchone()
        tool_rows = connection.execute(
            """
            SELECT
                tool_name,
                COUNT(*)::bigint AS total,
                COUNT(*) FILTER (WHERE status = 'SUCCESS')::bigint AS successful
            FROM tool_jobs
            GROUP BY tool_name
            ORDER BY tool_name
            """
        ).fetchall()

    return PublicStats(
        total_conversions=int(totals["total_conversions"]),
        today_conversions=int(totals["today_conversions"]),
        successful_conversions=int(totals["successful_conversions"]),
        per_tool={
            str(row["tool_name"]): ToolConversionStats(
                total=int(row["total"]), successful=int(row["successful"])
            )
            for row in tool_rows
        },
    )
