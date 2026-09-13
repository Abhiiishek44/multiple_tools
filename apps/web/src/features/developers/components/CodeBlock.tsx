import { useState } from 'react'
import { CheckIcon, CopyIcon } from '../../../shared/components/icons/Icons'

type Props = { code: string; language?: string; label?: string }

export function CodeBlock({ code, language = 'text', label }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return <div className="code-block"><div className="code-toolbar"><span>{label || language}</span><button type="button" onClick={() => void copy()} aria-label="Copy code">{copied ? <CheckIcon /> : <CopyIcon />}{copied ? 'Copied' : 'Copy'}</button></div><pre><code className={`language-${language}`}>{code}</code></pre></div>
}
