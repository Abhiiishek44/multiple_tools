from plugins.base import PluginManifest, PluginOption, PluginOptionChoice

MANIFEST = PluginManifest(
    name="pdf-to-word",
    description="Convert a PDF document to an editable Word document",
    input_suffixes=frozenset({".pdf"}),
    input_media_types=frozenset({"application/pdf"}),
    output_suffix=".docx",
    output_media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    options=(
        PluginOption(
            name="mode",
            label="Conversion mode",
            type="select",
            default="editable",
            choices=(
                PluginOptionChoice("editable", "Editable document"),
                PluginOptionChoice("preserve-layout", "Preserve page layout"),
            ),
        ),
    ),
)
