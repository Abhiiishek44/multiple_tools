import { BrandLogo } from '../brand/BrandLogo'
import { TOOL_CATALOG } from '../../../features/tools/api'
import { getCategorySlug, getToolCategories } from '../../../features/tools/catalog'

export function AppFooter({ onHome }: { onHome: () => void; onTools: () => void }) {
  const categories = getToolCategories(TOOL_CATALOG).slice(1)
  return (
    <footer className="mx-auto mt-7 grid w-[min(1120px,calc(100%_-_48px))] grid-cols-[1fr_auto] gap-[30px] border-t border-[var(--border)] pb-[50px] pt-10 max-[700px]:w-[calc(100%_-_32px)] max-[700px]:grid-cols-1">
      <div><BrandLogo /><p className="mb-0 mt-1 text-[10px] text-[var(--muted)]">Useful file conversions in one calm workspace.</p></div>
      <div className="grid grid-cols-3 gap-[45px] max-[700px]:grid-cols-2 max-[700px]:gap-5 [&_nav]:flex [&_nav]:min-w-[85px] [&_nav]:flex-col [&_nav]:items-start [&_nav]:gap-2 [&_nav>strong]:mb-[3px] [&_nav>strong]:text-[10px] [&_nav>strong]:uppercase [&_nav>strong]:tracking-[.1em] [&_nav_button]:cursor-pointer [&_nav_button]:border-0 [&_nav_button]:bg-transparent [&_nav_button]:p-0 [&_nav_button]:text-[10px] [&_nav_button]:font-semibold [&_nav_button]:text-[var(--muted)] [&_nav_a]:text-[10px] [&_nav_a]:font-semibold [&_nav_a]:text-[var(--muted)] [&_nav_a]:no-underline"><nav aria-label="Explore"><strong>Explore</strong><button type="button" onClick={onHome}>Tools</button></nav><nav aria-label="Developers"><strong>Developers</strong><a href="/developers/api">API Key</a><a href="/developers/python">Python SDK</a><a href="/developers/typescript">TypeScript SDK</a></nav><nav aria-label="Tool categories"><strong>Tools</strong>{categories.map((category) => <a href={`/categories/${getCategorySlug(category, TOOL_CATALOG)}`} key={category}>{category}</a>)}</nav></div>
      <p className="col-span-full m-0 text-[9px] text-[var(--faint)]">© {new Date().getFullYear()} LoveMyDocument. Built for fast, secure conversions. File icons by <a className="font-semibold text-inherit underline underline-offset-2" href="https://icons8.com" target="_blank" rel="noreferrer">Icons8</a>.</p>
    </footer>
  )
}
