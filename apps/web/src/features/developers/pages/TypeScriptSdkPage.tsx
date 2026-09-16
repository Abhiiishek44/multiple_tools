import { Seo } from '../../../shared/components/Seo'
import { AppFooter } from '../../../shared/components/layout/AppFooter'
import { CodeBlock } from '../components/CodeBlock'
import { TYPESCRIPT_GENERIC_JOB, TYPESCRIPT_INSTALL, TYPESCRIPT_SHORTCUT } from '../content'
import { primaryAction, secondaryAction } from '../../../shared/styles'
import { developerStyles as ds } from '../styles'

type Props = { onHome: () => void; onTools: () => void; onApiDocs: () => void }

export function TypeScriptSdkPage({ onHome, onTools, onApiDocs }: Props) {
  return (
    <main className={ds.page}>
      <Seo title="TypeScript SDK | Multiple Tools" description="Use the Multiple Tools Node.js SDK to run file conversions and manage jobs." path="/developers/typescript" keywords={['Multiple Tools TypeScript SDK', 'Node.js file conversion API', 'TypeScript PDF conversion']} />
      <section className={ds.hero}>
        <div className={ds.heroCopy}>
          <h1>TypeScript SDK</h1>
          <p>Use generated conversion methods to upload files, monitor jobs, and download results from Node.js applications.</p>
          <div className={ds.actions}>
            <a className={primaryAction} href="#quick-start">View examples</a>
            <button className={secondaryAction} type="button" onClick={onApiDocs}>Explore the API</button>
          </div>
        </div>
        <div className={ds.terminal}><CodeBlock code={`${TYPESCRIPT_INSTALL}\n\n${TYPESCRIPT_SHORTCUT}`} language="typescript" label="TypeScript" /></div>
      </section>

      <div className={ds.simpleContent}>
        <section className={ds.guideRow} id="quick-start">
          <div className={ds.guideCopy}><h2>Convert with a generated method</h2><p>Every registered tool has a discoverable conversion method followed by the same wait and download workflow.</p></div>
          <CodeBlock code={TYPESCRIPT_SHORTCUT} language="typescript" label="TypeScript" />
        </section>
        <section className={ds.guideRow}>
          <div className={ds.guideCopy}><h2>Use the generic jobs API</h2><p>Pass a dynamic tool name, conversion options, media metadata, or a stable idempotency key.</p></div>
          <CodeBlock code={TYPESCRIPT_GENERIC_JOB} language="typescript" label="TypeScript" />
        </section>
      </div>

      <AppFooter onHome={onHome} onTools={onTools} />
    </main>
  )
}
