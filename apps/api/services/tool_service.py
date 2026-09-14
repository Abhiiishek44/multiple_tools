from plugins.catalog import build_tool_catalog
from plugins.registry import list_plugins


def available_tools() -> list[dict[str, object]]:
    return build_tool_catalog(plugin.manifest for plugin in list_plugins())
