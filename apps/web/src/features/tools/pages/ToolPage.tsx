import type { ReactNode } from 'react'
import { CodeExampleTabs, type CodeExample } from '../../developers/components/CodeExampleTabs'
import { Seo } from '../../../shared/components/Seo'
import { AppFooter } from '../../../shared/components/layout/AppFooter'
import { HeartIcon, LockIcon } from '../../../shared/components/icons/Icons'
import { useUi } from '../../../shared/context/useUi'
import { getToolAbout } from '../catalog'
import { ToolIcon } from '../components/ToolIcon'
import type { ConversionTool } from '../types'
import { cn, contentSection, sectionTitle } from '../../../shared/styles'

type Props = { tool: ConversionTool; children: ReactNode; onHome: () => void; onTools: () => void }

function apiExample(tool: ConversionTool) {
  const options = tool.slug === 'rotate-pdf' ? ` \\\n  -F 'options={"angle":90}'` : ''
  return `curl -X POST "$MULTIPLETOOLS_BASE_URL/v1/tools/${tool.slug}/jobs" \\
  -H "Authorization: Bearer $MULTIPLETOOLS_API_KEY" \\
  -H "Idempotency-Key: your-stable-key" \\
  -F "file=@input${tool.inputSuffixes[0]}"${options}`
}

function sdkExample(tool: ConversionTool) {
  const method = tool.slug.replaceAll('-', '_')
  const conversion = tool.slug === 'rotate-pdf'
    ? `client.convert.${method}(\n        "input${tool.inputSuffixes[0]}",\n        options={"angle": 90},\n    )`
    : `client.convert.${method}("input${tool.inputSuffixes[0]}")`
  return `from multipletools import Client

with Client(api_key="mt_live_...") as client:
    job = ${conversion}
    completed = client.jobs.wait(job.id)
    client.jobs.download(completed.id, "output${tool.outputSuffix}")`
}

function typescriptSdkExample(tool: ConversionTool) {
  const method = tool.slug.replaceAll('-', '_')
  const options = tool.slug === 'rotate-pdf' ? `, {\n  options: { angle: 90 },\n}` : ''
  return `import { Client } from 'multipletools'

const client = new Client({ apiKey: process.env.MULTIPLETOOLS_API_KEY! })
const job = await client.convert.${method}('./input${tool.inputSuffixes[0]}'${options})
const completed = await client.jobs.wait(job.id)
await client.jobs.download(completed.id, './output${tool.outputSuffix}')`
}

export function ToolPage({ tool, children, onHome, onTools }: Props) {
  const { isFavorite, toggleFavorite } = useUi()
  const favorite = isFavorite(tool.id)
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
    <section className="mx-auto w-[min(940px,calc(100%_-_48px))] pb-[60px] pt-[58px] max-[700px]:w-[calc(100%_-_32px)] max-[700px]:pt-10">
      <div className="grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-5 text-left max-[700px]:grid-cols-[58px_minmax(0,1fr)] max-[700px]:gap-3.5"><ToolIcon tool={tool} size="large" className="max-[700px]:size-[58px] max-[700px]:rounded-2xl" /><div><h1 className="m-0 text-[clamp(38px,5vw,56px)] font-[800] leading-[1.02] tracking-[-.055em] max-[700px]:text-[36px]">{tool.title}</h1><p className="mb-0 mt-4 max-w-[670px] text-base leading-[1.6] text-[var(--muted)]">{tool.description}</p></div><button className={cn('flex h-10 cursor-pointer items-center gap-[7px] rounded-lg border border-[var(--border)] bg-[var(--surface)] px-[13px] text-xs font-semibold text-[var(--muted)] transition-colors hover:border-[var(--faint)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] max-[700px]:col-span-full max-[700px]:justify-self-start [&_svg]:size-[15px]', favorite && 'border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] text-[var(--accent)] [&_svg]:stroke-[var(--accent)]')} type="button" aria-pressed={favorite} onClick={() => toggleFavorite(tool.id)} aria-label={`${favorite ? 'Remove from' : 'Add to'} favorites`}><HeartIcon filled={favorite} /><span>{favorite ? 'Saved' : 'Save'}</span></button></div>
      <div className="mt-[22px] rounded-3xl bg-[var(--surface-soft)] p-4 max-[700px]:-mx-2 max-[700px]:rounded-[20px] max-[700px]:p-[9px]">{children}<div className="flex justify-center gap-2 px-2 pb-0 pt-3.5 text-center text-[10px] text-[var(--faint)] max-[700px]:pb-[5px] max-[700px]:leading-[1.4] [&_svg]:size-[13px]"><LockIcon /><span>Private and secure · files are removed automatically after processing</span></div></div>
    </section>

    <section className={contentSection} aria-labelledby="about-tool-title"><article className="border-t border-[var(--border)] pt-[clamp(42px,6vw,64px)]"><h2 className={sectionTitle} id="about-tool-title">About {tool.name}</h2><p className="mb-0 mt-5 max-w-[760px] text-sm leading-[1.8] text-[var(--muted)]">{getToolAbout(tool)}</p></article></section>

    {tool.options.length > 0 && <section className={contentSection}><h2 className={sectionTitle}>{tool.name} options</h2><div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3 [&_article]:rounded-xl [&_article]:border [&_article]:border-[var(--border)] [&_article]:bg-[var(--surface-soft)] [&_article]:p-5 [&_h3]:m-0 [&_h3]:text-sm [&_p]:mb-0 [&_p]:mt-2 [&_p]:text-xs [&_p]:leading-[1.55] [&_p]:text-[var(--muted)] [&_small]:mt-3 [&_small]:block [&_small]:text-[10px] [&_small]:text-[var(--faint)]">{tool.options.map((option) => <article key={option.name}><h3>{option.label}</h3><p>{option.description || `${option.required ? 'Required' : 'Optional'} ${option.type} setting.`}</p>{option.choices.length > 0 && <small>{option.choices.map((choice) => choice.label).join(' · ')}</small>}</article>)}</div></section>}

    <section className={`${contentSection} pt-2`} aria-labelledby="developer-section-title"><div className="border-t border-[var(--border)] pt-[clamp(42px,6vw,64px)]"><h2 className={sectionTitle} id="developer-section-title">Integrate {tool.name}</h2><p className="mb-0 mt-4 max-w-[680px] text-sm leading-[1.7] text-[var(--muted)]">Use the API directly or choose a typed SDK for your application.</p><CodeExampleTabs examples={codeExamples} /></div></section>

    <AppFooter onHome={onHome} onTools={onTools} />
  </main>
}
