import type { ReactNode } from 'react'
import { CodeExampleTabs, type CodeExample } from '../../developers/components/CodeExampleTabs'
import type { JobView } from '../../jobs/components/FlowSteps'
import { FlowSteps } from '../../jobs/components/FlowSteps'
import { Seo } from '../../../shared/components/Seo'
import { AppFooter } from '../../../shared/components/layout/AppFooter'
import { CheckIcon, HeartIcon, LockIcon } from '../../../shared/components/icons/Icons'
import { FaqSection } from '../../../shared/components/ui/FaqSection'
import { useUi } from '../../../shared/context/useUi'
import { getRelatedTools, getToolAbout } from '../catalog'
import { ToolCard } from '../components/ToolCard'
import { ToolVisual } from '../components/ToolVisual'
import type { ConversionTool } from '../types'
import { cn, contentSection, eyebrow, sectionTitle, textLink, toneClass } from '../../../shared/styles'

type Props = { tool: ConversionTool; tools: ConversionTool[]; view: JobView; children: ReactNode; onSelect: (tool: ConversionTool) => void; onHome: () => void; onTools: () => void }

function apiExample(tool: ConversionTool) {
  return `curl -X POST "$MULTIPLETOOLS_BASE_URL/v1/tools/${tool.slug}/jobs" \\
  -H "Authorization: Bearer $MULTIPLETOOLS_API_KEY" \\
  -H "Idempotency-Key: your-stable-key" \\
  -F "file=@input${tool.inputSuffixes[0]}"`
}

function sdkExample(tool: ConversionTool) {
  const method = tool.slug.replaceAll('-', '_')
  return `from multipletools import Client

with Client(api_key="mt_live_...") as client:
    job = client.convert.${method}("input${tool.inputSuffixes[0]}")
    completed = client.jobs.wait(job.id)
    client.jobs.download(completed.id, "output${tool.outputSuffix}")`
}

function typescriptSdkExample(tool: ConversionTool) {
  const method = tool.slug.replaceAll('-', '_')
  return `import { Client } from 'multipletools'

const client = new Client({ apiKey: process.env.MULTIPLETOOLS_API_KEY! })
const job = await client.convert.${method}('./input${tool.inputSuffixes[0]}')
const completed = await client.jobs.wait(job.id)
await client.jobs.download(completed.id, './output${tool.outputSuffix}')`
}

export function ToolPage({ tool, tools, view, children, onSelect, onHome, onTools }: Props) {
  const { isFavorite, toggleFavorite } = useUi()
  const favorite = isFavorite(tool.id)
  const related = getRelatedTools(tool, tools)
  const canonicalPath = `/${tool.slug}`
  const codeExamples: CodeExample[] = [
    { id: 'api', label: 'HTTP API', badge: 'API', language: 'bash', description: 'Call the conversion endpoint directly with cURL or any HTTP client.', code: apiExample(tool) },
    { id: 'python', label: 'Python SDK', badge: 'PY', language: 'python', description: 'Use the typed Python client for uploads, polling, and downloads.', code: sdkExample(tool) },
    { id: 'typescript', label: 'TypeScript SDK', badge: 'TS', language: 'typescript', description: 'Use the generated Node.js client method for this conversion.', code: typescriptSdkExample(tool) },
  ]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: tool.title,
        description: tool.description,
        url: canonicalPath,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        featureList: tool.features,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: tool.faq.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Tools', item: '/tools' },
          { '@type': 'ListItem', position: 2, name: tool.category, item: `/categories/${tool.categorySlug}` },
          { '@type': 'ListItem', position: 3, name: tool.name, item: canonicalPath },
        ],
      },
    ],
  }

  return <main>
    <Seo title={`${tool.title} | Multiple Tools`} description={tool.description} path={canonicalPath} keywords={tool.keywords} jsonLd={jsonLd} />
    <section className="mx-auto w-[min(900px,calc(100%_-_48px))] pb-[52px] pt-[58px] max-[700px]:w-[calc(100%_-_32px)]">
      <div className="grid grid-cols-[70px_minmax(0,1fr)_auto] items-center gap-5 text-left max-[700px]:grid-cols-[55px_minmax(0,1fr)] max-[700px]:gap-3.5"><div className={cn(toneClass(tool.category), 'grid size-[70px] place-items-center rounded-[20px] bg-[var(--tone)] max-[700px]:size-[55px] max-[700px]:rounded-2xl [&>span]:size-[54px] max-[700px]:[&>span]:size-[42px] [&_svg]:size-9 max-[700px]:[&_svg]:size-[29px]')}><ToolVisual tool={tool} /></div><div><p className={eyebrow}>{tool.category} · {tool.from} to {tool.to}</p><h1 className="m-0 text-[clamp(34px,5vw,54px)] font-[780] leading-none tracking-[-.055em] max-[700px]:text-[34px]">{tool.title}</h1><p className="mb-0 mt-3 max-w-[650px] leading-[1.55] text-[var(--muted)]">{tool.description}</p></div><button className={cn('flex h-10 cursor-pointer items-center gap-[7px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-[13px] text-[11px] text-[var(--muted)] transition-[transform,color,background-color] duration-200 hover:bg-[var(--surface-soft)] active:scale-90 max-[700px]:col-span-full max-[700px]:justify-self-start [&_svg]:size-[15px] [&_svg]:transition-[fill,stroke,transform] [&_svg]:duration-200', favorite && 'text-[#f05252] [&_svg]:animate-[heart-pop_320ms_ease-out] [&_svg]:stroke-[#f05252]')} type="button" aria-pressed={favorite} onClick={() => toggleFavorite(tool.id)} aria-label={`${favorite ? 'Remove from' : 'Add to'} favorites`}><HeartIcon filled={favorite} /><span>{favorite ? 'Saved' : 'Save'}</span></button></div>
      <FlowSteps view={view} />
      <div className="mt-[22px] rounded-3xl bg-[var(--surface-soft)] p-4 max-[700px]:-mx-2 max-[700px]:rounded-[20px] max-[700px]:p-[9px]">{children}<div className="flex justify-center gap-2 px-2 pb-0 pt-3.5 text-center text-[10px] text-[var(--faint)] max-[700px]:pb-[5px] max-[700px]:leading-[1.4] [&_svg]:size-[13px]"><LockIcon /><span>Private and secure · files are removed automatically after processing</span></div></div>
    </section>

    <section className="mx-auto grid w-[min(900px,calc(100%_-_48px))] grid-cols-[minmax(0,1.5fr)_minmax(270px,.7fr)] gap-[50px] border-t border-[var(--border)] pb-2 pt-16 max-[860px]:grid-cols-1 max-[860px]:gap-6 max-[700px]:w-[calc(100%_-_32px)] max-[700px]:pt-[52px]"><article><p className={eyebrow}>About this tool</p><h2 className="m-0 text-[27px] tracking-[-.04em]">About {tool.name}</h2><p className="mb-0 mt-4 text-[13px] leading-[1.75] text-[var(--muted)]">{getToolAbout(tool)}</p></article><aside className="rounded-[18px] bg-[var(--surface-soft)] px-[17px] py-2" aria-label="Tool details"><dl className="m-0 [&>div]:flex [&>div]:items-center [&>div]:justify-between [&>div]:gap-4 [&>div]:border-b [&>div]:border-[var(--border)] [&>div]:py-[13px] [&>div]:text-[11px] [&>div:last-child]:border-0 [&_dt]:text-[var(--muted)] [&_dd]:m-0 [&_dd]:text-right [&_dd]:font-bold [&_a]:text-[var(--accent-strong)] [&_a]:no-underline"><div><dt>Category</dt><dd><a href={`/categories/${tool.categorySlug}`}>{tool.category}</a></dd></div><div><dt>Input formats</dt><dd>{tool.inputFormats.join(', ')}</dd></div><div><dt>Output formats</dt><dd>{tool.outputFormats.join(', ')}</dd></div><div><dt>Options</dt><dd>{tool.options.length || 'None required'}</dd></div><div><dt>Maximum size</dt><dd>50 MB</dd></div></dl></aside></section>

    <section className={`${contentSection} grid grid-cols-2 gap-[clamp(28px,6vw,72px)] max-[700px]:grid-cols-1`} aria-labelledby="how-title"><article><p className={eyebrow}>Three simple steps</p><h2 className={sectionTitle} id="how-title">How {tool.name} works</h2><ol className="mt-6 grid list-none gap-3 p-0 [&_li]:flex [&_li]:items-start [&_li]:gap-3 [&_li]:text-[13px] [&_li]:leading-[1.55] [&_li]:text-[var(--muted)] [&_li>span]:grid [&_li>span]:size-7 [&_li>span]:shrink-0 [&_li>span]:place-items-center [&_li>span]:rounded-[9px] [&_li>span]:bg-[var(--accent)] [&_li>span]:text-[10px] [&_li>span]:font-extrabold [&_li>span]:text-[var(--accent-text)] [&_p]:mb-0 [&_p]:mt-1">{tool.howItWorks.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol></article><article><p className={eyebrow}>Built for real workflows</p><h2 className={sectionTitle}>Features</h2><ul className="mt-6 grid list-none gap-3 p-0 [&_li]:flex [&_li]:items-start [&_li]:gap-3 [&_li]:text-[13px] [&_li]:leading-[1.55] [&_li]:text-[var(--muted)] [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:text-[var(--accent-strong)]">{tool.features.map((feature) => <li key={feature}><CheckIcon /><span>{feature}</span></li>)}</ul></article></section>

    {tool.options.length > 0 && <section className={contentSection}><p className={eyebrow}>Available settings</p><h2 className={sectionTitle}>{tool.name} options</h2><div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3 [&_article]:rounded-2xl [&_article]:border [&_article]:border-[var(--border)] [&_article]:bg-[var(--surface-soft)] [&_article]:p-5 [&_h3]:m-0 [&_h3]:text-sm [&_p]:mb-0 [&_p]:mt-2 [&_p]:text-xs [&_p]:leading-[1.55] [&_p]:text-[var(--muted)] [&_small]:mt-3 [&_small]:block [&_small]:text-[10px] [&_small]:text-[var(--faint)]">{tool.options.map((option) => <article key={option.name}><h3>{option.label}</h3><p>{option.description || `${option.required ? 'Required' : 'Optional'} ${option.type} setting.`}</p>{option.choices.length > 0 && <small>{option.choices.map((choice) => choice.label).join(' · ')}</small>}</article>)}</div></section>}

    <section className={contentSection}><p className={eyebrow}>For developers</p><h2 className={sectionTitle}>Automate {tool.name}</h2><p className="max-w-[700px] text-[var(--muted)]">Choose an integration method. Additional SDKs can be added here without making the page wider or duplicating code panels.</p><CodeExampleTabs examples={codeExamples} /></section>

    <FaqSection items={tool.faq} />
    {related.length > 0 && <section className={`${contentSection} pt-5`}><div className="mb-[26px] flex items-end justify-between gap-5"><div><p className={eyebrow}>Keep working</p><h2 className={sectionTitle}>Related tools</h2></div><button className={textLink} type="button" onClick={onTools}>Browse all →</button></div><div className="mt-7 grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-3 max-[700px]:grid-cols-2 max-[700px]:gap-3">{related.map((candidate) => <ToolCard key={candidate.id} tool={candidate} onSelect={onSelect} />)}</div></section>}
    <AppFooter onHome={onHome} onTools={onTools} />
  </main>
}
