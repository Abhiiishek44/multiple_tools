import { useEffect, useState } from 'react'
import { Seo } from '../../../shared/components/Seo'
import { AppFooter } from '../../../shared/components/layout/AppFooter'
import { CheckIcon, CodeIcon, TerminalIcon } from '../../../shared/components/icons/Icons'
import { FaqSection } from '../../../shared/components/ui/FaqSection'
import { CodeBlock } from '../components/CodeBlock'
import {
  SDK_EXCEPTIONS,
  TYPESCRIPT_BUFFER,
  TYPESCRIPT_ENV,
  TYPESCRIPT_GENERIC_JOB,
  TYPESCRIPT_INSTALL,
  TYPESCRIPT_SHORTCUT,
} from '../content'
import { cn, eyebrow, primaryAction, secondaryAction } from '../../../shared/styles'
import { developerStyles as ds } from '../styles'

type Props = { onHome: () => void; onTools: () => void; onApiDocs: () => void }

const TYPESCRIPT_EXCEPTIONS = [...SDK_EXCEPTIONS, 'RequestAbortedError']

const SDK_FAQS = [
  { question: 'Which runtimes are supported?', answer: 'The SDK supports Node.js 20 and newer and ships native ESM with generated TypeScript declarations.' },
  { question: 'Are all conversion tools typed?', answer: 'Yes. Every registered tool generates a snake-case method such as client.convert.pdf_to_word(), while client.jobs.create() remains available for forward compatibility.' },
  { question: 'Which file inputs can I upload?', answer: 'Jobs accept a filesystem path, Buffer, Blob, or File. You can provide a filename and media type when the input does not contain them.' },
  { question: 'Does the SDK contain conversion logic?', answer: 'No. The client communicates only with the HTTP API. Conversion work remains in the backend workers and registered plugins.' },
]

const SDK_SECTIONS = [
  { id: 'install', number: '01', label: 'Installation' },
  { id: 'quick-start', number: '02', label: 'Quick start' },
  { id: 'resources', number: '03', label: 'Resources' },
  { id: 'downloads', number: '04', label: 'Downloads' },
  { id: 'configuration', number: '05', label: 'Configuration' },
  { id: 'errors', number: '06', label: 'Errors' },
]

export function TypeScriptSdkPage({ onHome, onTools, onApiDocs }: Props) {
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
      <Seo
        title="TypeScript SDK | Multiple Tools"
        description="Use the typed Multiple Tools Node.js SDK to upload files, run every registered conversion, wait for jobs, and download results."
        path="/developers/typescript"
        keywords={['Multiple Tools TypeScript SDK', 'Node.js file conversion API', 'TypeScript PDF conversion']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Multiple Tools TypeScript SDK',
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Node.js 20+',
          description: 'Typed Node.js client for every conversion registered with the Multiple Tools API.',
        }}
      />

      <section className={ds.hero}>
        <div className={ds.heroCopy}>
          <p className={eyebrow}>Official TypeScript client</p>
          <h1>Every conversion, <em>fully typed.</em></h1>
          <p>A production-ready Node.js SDK for generated conversion methods, uploads, polling, downloads, retries, and structured errors.</p>
          <div className={ds.actions}>
            <a className={primaryAction} href="#install">Install SDK</a>
            <button className={secondaryAction} type="button" onClick={onApiDocs}>Explore the API</button>
          </div>
          <div className={ds.proof} aria-label="SDK highlights">
            <span><strong>20+</strong> Node.js</span>
            <span><strong>Native</strong> ESM</span>
            <span><strong>Generated</strong> Types</span>
          </div>
        </div>

        <div className={ds.terminal}>
          <div className={ds.terminalDots}><i /><i /><i /><span>TypeScript</span></div>
          <CodeBlock code={`${TYPESCRIPT_INSTALL}\n\n${TYPESCRIPT_SHORTCUT}`} language="typescript" label="TypeScript" />
        </div>
      </section>

      <div className={ds.layout}>
        <aside className={ds.toc} aria-label="TypeScript SDK guide navigation">
          <div className={ds.tocCard}>
            <strong>SDK guide</strong>
            {SDK_SECTIONS.map((item) => <a className={cn(activeSection === item.id && ds.tocActive)} href={`#${item.id}`} aria-current={activeSection === item.id ? 'location' : undefined} key={item.id}><span>{item.number}</span>{item.label}</a>)}
            <button type="button" onClick={onApiDocs}><CodeIcon />API Key</button>
          </div>
        </aside>

        <div className={ds.content}>
          <section id="install" className={ds.section}>
            <div className={ds.sectionHeading}><span>01</span><div><p className={eyebrow}>Installation</p><h2>Start with one package</h2></div></div>
            <p>Install the native ESM package, create a scoped API key, and keep credentials in environment variables.</p>
            <div className={ds.setupGrid}>
              <div><span>Step 1</span><strong>Install the client</strong><CodeBlock code={TYPESCRIPT_INSTALL} language="bash" label="Terminal" /></div>
              <div><span>Step 2</span><strong>Configure securely</strong><CodeBlock code={TYPESCRIPT_ENV} language="bash" label="Environment" /></div>
            </div>
          </section>

          <section id="quick-start" className={ds.section}>
            <div className={ds.sectionHeading}><span>02</span><div><p className={eyebrow}>Generated shortcuts</p><h2>Convert with a typed method</h2></div></div>
            <p>Every registry slug becomes a generated snake-case method. The returned job works with the same polling and download resources as the generic API.</p>
            <CodeBlock code={TYPESCRIPT_SHORTCUT} language="typescript" label="TypeScript" />
          </section>

          <section id="resources" className={ds.section}>
            <div className={ds.sectionHeading}><span>03</span><div><p className={eyebrow}>Client surface</p><h2>Small, focused resources</h2></div></div>
            <p>Use generated methods for discoverability or the generic jobs resource when tool names are selected dynamically at runtime.</p>
            <div className={ds.resourceGrid}>
              <article><TerminalIcon /><div><h3>Conversions</h3><p>Typed methods generated for every registered tool.</p></div><code>client.convert.pdf_to_word()</code><code>client.convert.jpg_to_pdf()</code></article>
              <article><CodeIcon /><div><h3>Jobs</h3><p>Create, inspect, wait for, and download jobs.</p></div><code>create · get · wait</code><code>download</code></article>
            </div>
            <h3 className={ds.subsectionTitle}>Use the generic jobs API</h3>
            <p className={ds.subsectionCopy}>Pass options, media metadata, or a stable idempotency key when you need explicit control.</p>
            <CodeBlock code={TYPESCRIPT_GENERIC_JOB} language="typescript" label="TypeScript" />
          </section>

          <section id="downloads" className={ds.section}>
            <div className={ds.sectionHeading}><span>04</span><div><p className={eyebrow}>Output handling</p><h2>Buffer or atomic file download</h2></div></div>
            <p>Keep the result in memory or provide a destination path. Destination downloads create parent directories and move the completed temporary file atomically.</p>
            <CodeBlock code={TYPESCRIPT_BUFFER} language="typescript" label="TypeScript" />
          </section>

          <section id="configuration" className={ds.section}>
            <div className={ds.sectionHeading}><span>05</span><div><p className={eyebrow}>Configuration</p><h2>Timeouts and retries</h2></div></div>
            <p>Constructor options control HTTP behavior, while wait operations accept their own deadline and polling interval.</p>
            <div className={ds.configTable} role="table" aria-label="TypeScript client configuration">
              <div role="row"><strong role="columnheader">Option</strong><strong role="columnheader">Default</strong><strong role="columnheader">Purpose</strong></div>
              <div role="row"><code>apiKey</code><span>Required</span><span>Bearer API key</span></div>
              <div role="row"><code>baseURL</code><span>localhost:8000</span><span>API origin</span></div>
              <div role="row"><code>timeout</code><span>30 seconds</span><span>Request timeout</span></div>
              <div role="row"><code>maxRetries</code><span>2</span><span>Transient retries</span></div>
            </div>
          </section>

          <section id="errors" className={ds.section}>
            <div className={ds.sectionHeading}><span>06</span><div><p className={eyebrow}>Error handling</p><h2>Recover by error type</h2></div></div>
            <p>Every SDK error inherits from <code>MultipleToolsError</code>. HTTP failures expose status, error code, request ID, retry information, and response details.</p>
            <div className={ds.exceptions}>{TYPESCRIPT_EXCEPTIONS.map((exception) => <span key={exception}><CheckIcon />{exception}</span>)}</div>
          </section>
        </div>
      </div>

      <FaqSection items={SDK_FAQS} />
      <AppFooter onHome={onHome} onTools={onTools} />
    </main>
  )
}
