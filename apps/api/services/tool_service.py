from plugins.registry import list_plugins


def available_tools() -> list[dict[str, object]]:
    return [
        {
            "name": plugin.manifest.name,
            "version": plugin.manifest.version,
            "description": plugin.manifest.description,
            "input_suffixes": sorted(plugin.manifest.input_suffixes),
            "input_media_types": sorted(plugin.manifest.input_media_types),
            "output_suffix": plugin.manifest.output_suffix,
            "output_media_type": plugin.manifest.output_media_type,
        }
        for plugin in list_plugins()
    ]
