import type { ReactNode } from 'react'
import { AppFooter } from '../../../shared/components/layout/AppFooter'
import { HeartIcon, LockIcon } from '../../../shared/components/icons/Icons'
import { FaqSection } from '../../../shared/components/ui/FaqSection'
import { useUi } from '../../../shared/context/useUi'
import type { JobView } from '../../jobs/components/FlowSteps'
import { FlowSteps } from '../../jobs/components/FlowSteps'
import { getToolAbout, getToolFaqs } from '../catalog'
import { ToolCard } from '../components/ToolCard'
import { ToolVisual } from '../components/ToolVisual'
import type { ConversionTool } from '../types'

type Props = { tool: ConversionTool; tools: ConversionTool[]; view: JobView; children: ReactNode; onSelect: (tool: ConversionTool) => void; onHome: () => void; onTools: () => void }

export function ToolDetailPage({ tool, tools, view, children, onSelect, onHome, onTools }: Props) {
  const { isFavorite, toggleFavorite } = useUi()
  const favorite = isFavorite(tool.id)
  const related = tools.filter((candidate) => candidate.id !== tool.id && (candidate.category === tool.category || candidate.from === tool.from)).slice(0, 4)
  return <main><section className="tool-detail"><div className="tool-heading"><div className={`detail-visual tone-${tool.category.toLowerCase()}`}><ToolVisual tool={tool} /></div><div><p className="eyebrow">{tool.category} · {tool.from} to {tool.to}</p><h1>{tool.name}</h1><p>{tool.description}</p></div><button className={`detail-favorite ${favorite ? 'is-favorite' : ''}`} type="button" onClick={() => toggleFavorite(tool.id)} aria-label={`${favorite ? 'Remove from' : 'Add to'} favorites`}><HeartIcon /><span>{favorite ? 'Saved' : 'Save'}</span></button></div><FlowSteps view={view} /><div className="workflow-card">{children}<div className="privacy-note"><LockIcon /><span>Private and secure · files are removed automatically after processing</span></div></div></section><section className="tool-information"><article><p className="eyebrow">About this tool</p><h2>About {tool.name}</h2><p>{getToolAbout(tool)}</p></article><aside aria-label="Tool details"><dl><div><dt>Category</dt><dd>{tool.category}</dd></div><div><dt>Input</dt><dd>{tool.inputSuffixes.join(', ').toUpperCase()}</dd></div><div><dt>Output</dt><dd>{tool.outputSuffix.slice(1).toUpperCase()}</dd></div><div><dt>Maximum size</dt><dd>50 MB</dd></div><div><dt>Processing</dt><dd>Multiple Tools API</dd></div></dl></aside></section><FaqSection items={getToolFaqs(tool)} />{related.length > 0 && <section className="content-section related-section"><div className="section-heading"><div><p className="eyebrow">Keep working</p><h2 className="section-title">Related tools</h2></div><button className="text-link" type="button" onClick={onTools}>Browse all →</button></div><div className="tool-grid">{related.map((candidate) => <ToolCard key={candidate.id} tool={candidate} onSelect={onSelect} />)}</div></section>}<AppFooter onHome={onHome} onTools={onTools} /></main>
}
