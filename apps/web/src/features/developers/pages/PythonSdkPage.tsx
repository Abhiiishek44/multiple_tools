import { useEffect, useState } from 'react'
import { AppFooter } from '../../../shared/components/layout/AppFooter'
import { CheckIcon, CodeIcon, TerminalIcon } from '../../../shared/components/icons/Icons'
import { FaqSection } from '../../../shared/components/ui/FaqSection'
import { CodeBlock } from '../components/CodeBlock'
import { PYTHON_ASYNC, PYTHON_ENV, PYTHON_INSTALL, PYTHON_OPTIONS, PYTHON_SYNC, SDK_EXCEPTIONS } from '../content'
import { cn, eyebrow, primaryAction, secondaryAction } from '../../../shared/styles'
import { developerStyles as ds } from '../styles'

type Props = { onHome: () => void; onTools: () => void; onApiDocs: () => void }

const SDK_FAQS = [
  { question: 'Which Python versions are supported?', answer: 'The package supports Python 3.10 and newer and uses httpx for HTTP communication.' },
  { question: 'Can I use the SDK with asyncio?', answer: 'Yes. AsyncClient mirrors the synchronous resources and exposes awaitable tool, job, polling, and download operations.' },
  { question: 'Does the SDK need access to the database or workers?', answer: 'No. It communicates only with the HTTP API and has no database, object storage, Redis, Celery, or conversion-plugin dependencies.' },
  { question: 'Can I use a local API?', answer: 'Yes. The default base URL is http://localhost:8000. Override it with MULTIPLETOOLS_BASE_URL or the base_url client argument.' },
]

const SDK_SECTIONS = [
  { id: 'install', number: '01', label: 'Installation' },
  { id: 'sync-client', number: '02', label: 'Sync client' },
  { id: 'async-client', number: '03', label: 'Async client' },
  { id: 'resources', number: '04', label: 'Resources' },
  { id: 'configuration', number: '05', label: 'Configuration' },
  { id: 'exceptions', number: '06', label: 'Errors' },
]

export function PythonSdkPage({ onHome, onTools, onApiDocs }: Props) {
  const [activeSection, setActiveSection] = useState(SDK_SECTIONS[0].id)

  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>('[data-scroll-container]')
    if (!scroller) return

    const updateActiveSection = () => {
      const activationLine = scroller.getBoundingClientRect().top + 150
      let current = SDK_SECTIONS[0].id
      for (const item of SDK_SECTIONS) {
        const section = document.getElementById(item.id)
        if (section && section.getBoundingClientRect().top <= activationLine) current = item.id
      }
      setActiveSection(current)
    }

    updateActiveSection()
    scroller.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)
    return () => {
      scroller.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [])

  return (
    <main className={ds.page}>
      <section className={ds.hero}>
        <div className={ds.heroCopy}>
          <p className={eyebrow}>Official Python client</p>
          <h1>From upload to output <em>in a few lines.</em></h1>
          <p>A typed SDK for discovery, uploads, job polling, downloads, retries, and structured errors—in synchronous and asynchronous Python.</p>
          <div className={ds.actions}>
            <a className={primaryAction} href="#install">Install SDK</a>
            <button className={secondaryAction} type="button" onClick={onApiDocs}>Explore the API</button>
          </div>
          <div className={ds.proof} aria-label="SDK highlights">
            <span><strong>3.10+</strong> Python</span>
            <span><strong>Typed</strong> Models</span>
            <span><strong>Sync</strong> + Async</span>
          </div>
        </div>

        <div className={ds.terminal}>
          <div className={ds.terminalDots}><i /><i /><i /><span>Terminal</span></div>
          <CodeBlock code={`${PYTHON_INSTALL}\n\nfrom multipletools import Client\n\nclient = Client(\n    api_key="mt_live_...",\n    base_url="https://api.example.com",\n)`} language="python" label="Terminal" />
        </div>
      </section>

      <div className={ds.layout}>
        <aside className={ds.toc} aria-label="Python SDK guide navigation">
          <div className={ds.tocCard}>
            <strong>SDK guide</strong>
            {SDK_SECTIONS.map((item) => <a className={cn(activeSection === item.id && ds.tocActive)} href={`#${item.id}`} aria-current={activeSection === item.id ? 'location' : undefined} key={item.id}><span>{item.number}</span>{item.label}</a>)}
            <button type="button" onClick={onApiDocs}><CodeIcon />API Key</button>
          </div>
        </aside>

        <div className={ds.content}>
          <section id="install" className={ds.section}>
            <div className={ds.sectionHeading}><span>01</span><div><p className={eyebrow}>Installation</p><h2>Start in under a minute</h2></div></div>
            <p>Install the package, create a scoped API key, and configure two environment variables. No database or worker connection is required.</p>
            <div className={ds.setupGrid}>
              <div><span>Step 1</span><strong>Install the client</strong><CodeBlock code={PYTHON_INSTALL} language="bash" label="Terminal" /></div>
              <div><span>Step 2</span><strong>Configure securely</strong><CodeBlock code={PYTHON_ENV} language="bash" label="Environment" /></div>
            </div>
          </section>

          <section id="sync-client" className={ds.section}>
            <div className={ds.sectionHeading}><span>02</span><div><p className={eyebrow}>Synchronous</p><h2>Convert with a context manager</h2></div></div>
            <p>The client manages its HTTP session, waits for a terminal job state, and downloads the completed file.</p>
            <CodeBlock code={PYTHON_SYNC} language="python" label="Python" />
          </section>

          <section id="async-client" className={ds.section}>
            <div className={ds.sectionHeading}><span>03</span><div><p className={eyebrow}>Asynchronous</p><h2>The same workflow with asyncio</h2></div></div>
            <p><code>AsyncClient</code> mirrors the synchronous interface for FastAPI, workers, bots, and other event-driven applications.</p>
            <CodeBlock code={PYTHON_ASYNC} language="python" label="Python" />
          </section>

          <section id="resources" className={ds.section}>
            <div className={ds.sectionHeading}><span>04</span><div><p className={eyebrow}>Client surface</p><h2>Small, focused resources</h2></div></div>
            <p>The SDK keeps discovery and job operations separate while returning typed Python models throughout.</p>
            <div className={ds.resourceGrid}>
              <article><TerminalIcon /><div><h3>Tools</h3><p>Discover the live catalog and supported file formats.</p></div><code>client.tools.list()</code><code>client.tools.get(name)</code></article>
              <article><CodeIcon /><div><h3>Jobs</h3><p>Create, track, and download conversions.</p></div><code>create · get · wait</code><code>create_and_wait · download</code></article>
            </div>
            <h3 className={ds.subsectionTitle}>Customize an upload</h3>
            <p className={ds.subsectionCopy}>Pass tool options, a reusable idempotency key, or an explicit media type when you need more control.</p>
            <CodeBlock code={PYTHON_OPTIONS} language="python" label="Python" />
          </section>

          <section id="configuration" className={ds.section}>
            <div className={ds.sectionHeading}><span>05</span><div><p className={eyebrow}>Configuration</p><h2>Explicit when you need it</h2></div></div>
            <p>Constructor arguments override environment variables, making the same client easy to use locally and in production.</p>
            <div className={ds.configTable} role="table" aria-label="Python client configuration">
              <div role="row"><strong role="columnheader">Option</strong><strong role="columnheader">Default</strong><strong role="columnheader">Purpose</strong></div>
              <div role="row"><code>api_key</code><span>Environment</span><span>Bearer API key</span></div>
              <div role="row"><code>base_url</code><span>localhost:8000</span><span>API origin</span></div>
              <div role="row"><code>timeout</code><span>30 seconds</span><span>Request timeout</span></div>
              <div role="row"><code>max_retries</code><span>2</span><span>Transient retries</span></div>
            </div>
          </section>

          <section id="exceptions" className={ds.section}>
            <div className={ds.sectionHeading}><span>06</span><div><p className={eyebrow}>Error handling</p><h2>Catch errors by intent</h2></div></div>
            <p>Every SDK exception inherits from <code>MultipleToolsError</code>, while focused subclasses let your application recover intelligently.</p>
            <div className={ds.exceptions}>{SDK_EXCEPTIONS.map((exception) => <span key={exception}><CheckIcon />{exception}</span>)}</div>
          </section>
        </div>
      </div>

      <FaqSection items={SDK_FAQS} />
      <AppFooter onHome={onHome} onTools={onTools} />
    </main>
  )
}
