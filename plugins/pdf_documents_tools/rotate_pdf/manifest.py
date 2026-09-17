from plugins.base import PluginManifest, PluginOption, PluginOptionChoice

MANIFEST = PluginManifest(
    name="rotate-pdf",
    description="Rotate every page in a PDF",
    input_suffixes=frozenset({".pdf"}),
    input_media_types=frozenset({"application/pdf"}),
    output_suffix=".pdf",
    output_media_type="application/pdf",
    options=(
        PluginOption(
            name="angle",
            label="Rotation angle",
            type="select",
            default=90,
            choices=(
                PluginOptionChoice(90, "90° clockwise"),
                PluginOptionChoice(180, "180°"),
                PluginOptionChoice(270, "270° clockwise"),
                PluginOptionChoice(-90, "90° counter-clockwise"),
            ),
        ),
    ),
)
