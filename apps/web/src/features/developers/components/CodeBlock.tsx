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

  return <div className="mt-6 min-w-0 overflow-hidden rounded-[17px] bg-[#151714] text-[#e7e9e3] shadow-[0_16px_45px_rgba(0,0,0,.13)]"><div className="flex h-11 items-center justify-between border-b border-[#30332e] pl-[18px] pr-[13px] text-[10px] uppercase tracking-[.1em] text-[#9da296]"><span>{label || language}</span><button className="flex cursor-pointer items-center gap-1.5 rounded-[7px] border-0 bg-[#292c27] px-[9px] py-1.5 text-[9px] normal-case tracking-normal text-[#d1d5cc] [&_svg]:w-3" type="button" onClick={() => void copy()} aria-label="Copy code">{copied ? <CheckIcon /> : <CopyIcon />}{copied ? 'Copied' : 'Copy'}</button></div><pre className="m-0 max-w-full overflow-x-auto p-[23px]"><code className={`language-${language} font-mono text-xs leading-[1.75] whitespace-pre max-[700px]:text-[10px]`}>{code}</code></pre></div>
}
