import { AppFooter } from '../../../shared/components/layout/AppFooter'
import { CategoryIcon } from '../../../shared/components/icons/Icons'
import { FaqSection } from '../../../shared/components/ui/FaqSection'
import { ALL_TOOLS, getCategoryDescription, getToolCategories, SITE_FAQS } from '../catalog'
import { ToolCard } from '../components/ToolCard'
import type { ConversionTool, ToolCategory } from '../types'
import { cn, contentSection, eyebrow, sectionTitle, textLink, toneClass } from '../../../shared/styles'

type Props = { tools: ConversionTool[]; isLoading: boolean; onSelect: (tool: ConversionTool) => void; onTools: () => void; onCategory: (category: ToolCategory) => void; onHome: () => void }

export function HomePage({ tools, isLoading, onSelect, onTools, onCategory, onHome }: Props) {
  const categories = getToolCategories(tools)
  return <main>
    <section className="px-[clamp(22px,6vw,76px)] pb-16 pt-[clamp(54px,8vw,96px)] text-center max-[700px]:px-4 max-[700px]:pb-10 max-[700px]:pt-[46px]">
      <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-3 py-[7px] text-[11px] font-[650] text-[var(--muted)] [&>span]:rounded-full [&>span]:bg-[var(--accent)] [&>span]:px-2 [&>span]:py-[3px] [&>span]:font-extrabold [&>span]:text-[var(--accent-text)]"><span>New</span> One workspace for every file</div>
      <h1 className="mx-auto mb-0 mt-6 max-w-[800px] text-[clamp(40px,5.4vw,76px)] font-[720] leading-[1.08] tracking-[-.04em] text-[var(--text)] max-[700px]:text-[clamp(39px,12vw,54px)] [&_em]:not-italic"><span>Simple tools for</span><br /><em>everyday file work.</em></h1>
      <p className="mx-auto mb-0 mt-[18px] max-w-[650px] text-[clamp(16px,1.35vw,18px)] leading-[1.55] text-[var(--muted)] max-[700px]:text-sm">Convert documents, PDFs, spreadsheets, and images with a focused workflow backed by your existing Multiple Tools API.</p>
      <div className="mx-auto mt-[54px] grid max-w-[1040px] grid-cols-6 gap-3.5 max-[1100px]:max-w-[650px] max-[1100px]:grid-cols-3 max-[700px]:mt-[42px] max-[700px]:gap-x-3 max-[700px]:gap-y-6">{categories.map((category) => <button className={cn(toneClass(category), 'flex min-w-0 cursor-pointer flex-col items-center border-0 bg-transparent')} type="button" key={category} onClick={() => category === ALL_TOOLS ? onTools() : onCategory(category)}><span className="grid aspect-[1.25] w-full place-items-center rounded-[28px] bg-[var(--tone)] text-white transition-[transform,box-shadow] duration-200 hover:-translate-y-[5px] hover:-rotate-1 hover:shadow-[var(--panel-shadow)] max-[700px]:size-[78px] max-[700px]:rounded-3xl [&_svg]:size-[38px] [&_svg]:stroke-[1.7] max-[700px]:[&_svg]:w-[31px]"><CategoryIcon category={category} /></span><strong className="mt-[13px] text-sm font-[550] text-[var(--text)] max-[700px]:text-[11px]">{category}</strong><small className="mt-[5px] text-[10px] text-[var(--muted)] max-[700px]:hidden">{category === ALL_TOOLS ? `${tools.length} converters` : getCategoryDescription(category, tools)}</small></button>)}</div>
    </section>
    <section className={`${contentSection} border-t border-[var(--border)]`}>
      <div className="mb-[26px] flex items-end justify-between gap-5"><div><p className={eyebrow}>Start here</p><h2 className={sectionTitle}>Popular tools</h2></div><button className={textLink} type="button" onClick={onTools}>See all tools →</button></div>
      {isLoading ? <div className="mt-7 grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-3 max-[700px]:grid-cols-2 max-[700px]:gap-3">{Array.from({ length: 8 }, (_, index) => <div className="min-h-[190px] animate-pulse rounded-[18px] bg-[var(--surface-strong)]" key={index} />)}</div> : <div className="mt-7 grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-3 max-[700px]:grid-cols-2 max-[700px]:gap-3">{tools.slice(0, 8).map((tool) => <ToolCard tool={tool} onSelect={onSelect} key={tool.id} />)}</div>}
    </section>
    <section className="mx-auto my-7 grid w-[min(1120px,calc(100%_-_48px))] grid-cols-3 gap-3.5 max-[700px]:w-[calc(100%_-_32px)] max-[700px]:grid-cols-1 [&>div]:min-h-[168px] [&>div]:rounded-[18px] [&>div]:border [&>div]:border-[var(--border)] [&>div]:bg-[var(--surface-soft)] [&>div]:p-6 max-[700px]:[&>div]:p-[25px] [&_span]:inline-flex [&_span]:h-6 [&_span]:min-w-[30px] [&_span]:items-center [&_span]:justify-center [&_span]:rounded-[7px] [&_span]:bg-[var(--accent)] [&_span]:px-[7px] [&_span]:text-[10px] [&_span]:font-extrabold [&_span]:tracking-[.06em] [&_span]:text-[var(--accent-text)] [&_strong]:mt-6 [&_strong]:block [&_strong]:text-[17px] [&_strong]:tracking-[-.015em] max-[700px]:[&_strong]:mt-3 [&_p]:mb-0 [&_p]:mt-2 [&_p]:text-[13px] [&_p]:leading-normal [&_p]:text-[var(--muted)]"><div><span>01</span><strong>Choose a tool</strong><p>Find the exact conversion you need.</p></div><div><span>02</span><strong>Add your file</strong><p>Drop it into the secure upload area.</p></div><div><span>03</span><strong>Download</strong><p>Follow live progress and save the result.</p></div></section>
    <FaqSection items={SITE_FAQS} />
    <AppFooter onHome={onHome} onTools={onTools} />
  </main>
}
