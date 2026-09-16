import { AppFooter } from '../../../shared/components/layout/AppFooter'
import { Seo } from '../../../shared/components/Seo'
import { ToolCatalog } from '../components/ToolCatalog'
import type { ConversionTool } from '../types'

type Props = { tools: ConversionTool[]; isLoading: boolean; error: string | null; onRetry: () => void; onSelect: (tool: ConversionTool) => void; onHome: () => void; onTools: () => void }

export function ToolsPage(props: Props) {
  const path = '/tools'
  const description = 'Search every Multiple Tools file converter, grouped by category.'
  const title = 'File Conversion Tools | Multiple Tools'
  return (
    <main>
      <Seo title={title} description={description} path={path} jsonLd={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url: path, mainEntity: { '@type': 'ItemList', itemListElement: props.tools.map((tool, index) => ({ '@type': 'ListItem', position: index + 1, name: tool.name, url: `/${tool.slug}` })) } }} />
      <ToolCatalog {...props} />
      <AppFooter onHome={props.onHome} onTools={props.onTools} />
    </main>
  )
}
