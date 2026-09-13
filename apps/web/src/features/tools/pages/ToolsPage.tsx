import { AppFooter } from '../../../shared/components/layout/AppFooter'
import { ToolCatalog } from '../components/ToolCatalog'
import type { ConversionTool, ToolCategory } from '../types'

type Props = { tools: ConversionTool[]; isLoading: boolean; error: string | null; category: ToolCategory; onRetry: () => void; onSelect: (tool: ConversionTool) => void; onCategory: (category: ToolCategory) => void; onHome: () => void; onTools: () => void }

export function ToolsPage(props: Props) {
  return (
    <main>
      <ToolCatalog {...props} />
      <AppFooter onHome={props.onHome} onTools={props.onTools} />
    </main>
  )
}
