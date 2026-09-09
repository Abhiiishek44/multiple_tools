import { ToolCatalog } from '../components/ToolCatalog'
import type { ConversionTool } from '../types'

type Props = { tools: ConversionTool[]; isLoading: boolean; error: string | null; onRetry: () => void; onSelect: (tool: ConversionTool) => void }

export function ToolsPage(props: Props) {
  const toolCount = props.tools.length || 56
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-sky-500 px-5 py-20 text-center text-white sm:py-28" aria-labelledby="catalog-title">
        <div className="absolute -left-24 -top-24 size-72 rounded-full bg-cyan-300/20 blur-3xl" aria-hidden="true" /><div className="absolute -bottom-32 right-0 size-96 rounded-full bg-indigo-900/30 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em]"><span className="size-2 rounded-full bg-cyan-300" /> {toolCount} tools. One simple workflow.</span><h1 className="mt-7 text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl" id="catalog-title">Every file, in the<br /><em className="font-serif font-normal text-cyan-200">format you need.</em></h1><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-blue-50/90 sm:text-lg">Fast, private document and image processing powered by the live conversion API. Choose a tool below to get started.</p><a className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3.5 font-bold text-blue-700 shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-blue-50" href="#conversion-tools">Explore all tools <span aria-hidden="true">↓</span></a><div className="mt-10 flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm font-medium text-blue-50"><span><i className="mr-1 not-italic text-cyan-300">✓</i> {toolCount} backend tools</span><span><i className="mr-1 not-italic text-cyan-300">✓</i> Secure processing</span><span><i className="mr-1 not-italic text-cyan-300">✓</i> Real job progress</span></div></div>
      </section>
      <ToolCatalog {...props} />
      <section className="bg-slate-950 px-5 py-16 text-white" aria-labelledby="how-title"><div className="mx-auto max-w-7xl"><span className="text-xs font-extrabold tracking-[0.18em] text-cyan-400">02 / HOW IT WORKS</span><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl" id="how-title">Done in three small steps</h2><div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-slate-700 md:grid-cols-3">{[['01', 'Choose a tool', 'Pick the conversion that matches your file.'], ['02', 'Upload your file', 'Drop it in securely from any device.'], ['03', 'Download the result', 'Your converted file is ready in moments.']].map(([number, title, copy]) => <div className="bg-slate-900 p-7" key={number}><span className="text-xs font-black tracking-widest text-cyan-400">{number}</span><strong className="mt-5 block text-lg">{title}</strong><p className="mt-2 leading-6 text-slate-400">{copy}</p></div>)}</div></div></section>
    </main>
  )
}
