import { BrandIcon } from '../icons/Icons'

export function AppFooter({ onHome, onTools }: { onHome: () => void; onTools: () => void }) {
  return (
    <footer className="app-footer">
      <div className="footer-brand"><span className="brand-mark"><BrandIcon /></span><div><strong>Multiple Tools</strong><p>Useful file conversions in one calm workspace.</p></div></div>
      <div className="footer-links"><nav aria-label="Explore"><strong>Explore</strong><button type="button" onClick={onHome}>Home</button><button type="button" onClick={onTools}>All tools</button><a href="#faq-title">FAQs</a></nav><nav aria-label="Developers"><strong>Developers</strong><a href="/developers/api">API Key</a><a href="/developers/python">Python SDK</a></nav><nav aria-label="Tool categories"><strong>Tools</strong><a href="/tools/category/PDF">PDF</a><a href="/tools/category/Documents">Documents</a><a href="/tools/category/Images">Images</a></nav></div>
      <p className="footer-meta">© {new Date().getFullYear()} Multiple Tools. Built for fast, secure conversions.</p>
    </footer>
  )
}
