import { useState } from 'react'
import { AppFooter } from '../../../shared/components/layout/AppFooter'
import { CodeBlock } from '../components/CodeBlock'
import { PYTHON_ASYNC, PYTHON_INSTALL, PYTHON_OPTIONS, PYTHON_SYNC } from '../content'
import { cn, primaryAction, secondaryAction } from '../../../shared/styles'
import { developerStyles as ds } from '../styles'

type Props = { onHome: () => void; onTools: () => void; onApiDocs: () => void }

export function PythonSdkPage({ onHome, onTools, onApiDocs }: Props) {
  const [mode, setMode] = useState<'sync' | 'async'>('sync')

  return (
    <main className={ds.page}>
      <section className={ds.hero}>
        <div className={ds.heroCopy}>
          <h1>Python SDK</h1>
          <p>Convert files, monitor jobs, and download results from synchronous or asynchronous Python applications.</p>
          <div className={ds.actions}>
            <a className={primaryAction} href="#clients">View examples</a>
            <button className={secondaryAction} type="button" onClick={onApiDocs}>Explore the API</button>
          </div>
        </div>
        <div className={ds.terminal}><CodeBlock code={`${PYTHON_INSTALL}\n\nfrom multipletools import Client\n\nclient = Client(api_key="mt_live_...")`} language="python" label="Python" /></div>
      </section>

      <div className={ds.simpleContent}>
        <section className={ds.guideRow} id="clients">
          <div className={ds.guideCopy}><h2>Choose sync or async</h2><p>Both clients use the same conversion, polling, and download workflow. Choose the style that matches your application.</p></div>
          <div className="min-w-0">
            <div className={ds.codeToggle} role="tablist" aria-label="Python client style"><button className={cn(mode === 'sync' && ds.codeToggleActive)} type="button" role="tab" aria-selected={mode === 'sync'} onClick={() => setMode('sync')}>Synchronous</button><button className={cn(mode === 'async' && ds.codeToggleActive)} type="button" role="tab" aria-selected={mode === 'async'} onClick={() => setMode('async')}>Asynchronous</button></div>
            <CodeBlock className="h-[390px] [&>pre]:max-h-[345px]" code={mode === 'sync' ? PYTHON_SYNC : PYTHON_ASYNC} language="python" label={mode === 'sync' ? 'Synchronous Python' : 'Async Python'} />
          </div>
        </section>

        <section className={ds.guideRow}>
          <div className={ds.guideCopy}><h2>Customize a conversion</h2><p>Pass tool options, media metadata, or a stable idempotency key when the default request needs more control.</p></div>
          <CodeBlock code={PYTHON_OPTIONS} language="python" label="Python" />
        </section>
      </div>

      <AppFooter onHome={onHome} onTools={onTools} />
    </main>
  )
}
