import { AppFooter } from '../../../shared/components/layout/AppFooter'
import { Seo } from '../../../shared/components/Seo'
import { ALL_TOOLS, getCategoryDescription, getCategorySlug } from '../catalog'
import { ToolCatalog } from '../components/ToolCatalog'
import type { ConversionTool, ToolCategory } from '../types'

type Props = { tools: ConversionTool[]; isLoading: boolean; error: string | null; category: ToolCategory; onRetry: () => void; onSelect: (tool: ConversionTool) => void; onCategory: (category: ToolCategory) => void; onHome: () => void; onTools: () => void }

export function ToolsPage(props: Props) {
  const isAllTools = props.category === ALL_TOOLS
  const categorySlug = getCategorySlug(props.category, props.tools)
  const path = isAllTools ? '/tools' : `/categories/${categorySlug}`
  const description = getCategoryDescription(props.category, props.tools)
  const title = isAllTools ? 'All File Conversion Tools | Multiple Tools' : `${props.category} Tools | Multiple Tools`
  const categoryTools = isAllTools ? props.tools : props.tools.filter((tool) => tool.category === props.category)
  return (
    <main>
      <Seo title={title} description={description} path={path} jsonLd={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url: path, mainEntity: { '@type': 'ItemList', itemListElement: categoryTools.map((tool, index) => ({ '@type': 'ListItem', position: index + 1, name: tool.name, url: `/${tool.slug}` })) } }} />
      <ToolCatalog {...props} />
      <AppFooter onHome={props.onHome} onTools={props.onTools} />
    </main>
  )
}
