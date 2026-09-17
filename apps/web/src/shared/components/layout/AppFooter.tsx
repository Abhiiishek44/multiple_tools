import { BrandLogo } from '../brand/BrandLogo'
import { TOOL_CATALOG } from '../../../features/tools/api'
import { getCategorySlug, getToolCategories } from '../../../features/tools/catalog'

export function AppFooter({ onHome }: { onHome: () => void; onTools: () => void }) {
  const categories = getToolCategories(TOOL_CATALOG).slice(1)
  return (
    <footer className="mx-auto mt-10 w-[min(1120px,calc(100%_-_48px))] border-t border-[var(--border)] pb-8 pt-10 max-[700px]:w-[calc(100%_-_32px)]">
      <div className="grid grid-cols-[minmax(230px,1.4fr)_repeat(3,minmax(100px,auto))] gap-12 max-[800px]:grid-cols-2 max-[700px]:gap-x-8 max-[700px]:gap-y-9">
        <div className="max-w-[310px] max-[800px]:col-span-2"><button className="cursor-pointer border-0 bg-transparent p-0" type="button" onClick={onHome} aria-label="LoveMyDocument home"><BrandLogo /></button><p className="mb-0 mt-3 text-xs font-medium leading-5 text-[var(--muted)]">Fast, private file tools for everyday document work.</p></div>
        <div className="contents [&_nav]:flex [&_nav]:min-w-[100px] [&_nav]:flex-col [&_nav]:items-start [&_nav]:gap-2.5 [&_nav>strong]:mb-1 [&_nav>strong]:text-[10px] [&_nav>strong]:font-bold [&_nav>strong]:uppercase [&_nav>strong]:tracking-[.12em] [&_nav>strong]:text-[var(--faint)] [&_nav_button]:cursor-pointer [&_nav_button]:border-0 [&_nav_button]:bg-transparent [&_nav_button]:p-0 [&_nav_button]:text-xs [&_nav_button]:font-medium [&_nav_button]:text-[var(--muted)] [&_nav_button:hover]:text-[var(--text)] [&_nav_a]:text-xs [&_nav_a]:font-medium [&_nav_a]:text-[var(--muted)] [&_nav_a]:no-underline [&_nav_a:hover]:text-[var(--text)]"><nav aria-label="Product"><strong>Product</strong><button type="button" onClick={onHome}>All tools</button></nav><nav aria-label="Developers"><strong>Developers</strong><a href="/developers/api">API keys</a><a href="/developers/python">Python SDK</a><a href="/developers/typescript">TypeScript SDK</a></nav><nav aria-label="Categories"><strong>Categories</strong>{categories.slice(0, 5).map((category) => <a href={`/categories/${getCategorySlug(category, TOOL_CATALOG)}`} key={category}>{category}</a>)}</nav></div>
      </div>
      <div className="mt-10 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-5 text-[10px] text-[var(--faint)] max-[600px]:flex-col max-[600px]:items-start"><p className="m-0">© {new Date().getFullYear()} LoveMyDocument</p><p className="m-0">Private by design · Built for reliable conversions</p></div>
    </footer>
  )
}
