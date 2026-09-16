import { useState, type ReactNode } from 'react'
import { CheckIcon, CopyIcon } from '../../../shared/components/icons/Icons'
import { cn } from '../../../shared/styles'

type Props = { code: string; language?: string; label?: string; className?: string }

const syntaxPattern = /(#.*$|\/\/.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:import|from|const|await|with|as|new|in|async|export|return)\b|\b(?:Client|FormData|fetch|process|env)\b|\b\d+\b|\$[A-Z_][A-Z0-9_]*)/g

function highlightLine(line: string) {
  const parts: ReactNode[] = []
  let cursor = 0
  for (const match of line.matchAll(syntaxPattern)) {
    const index = match.index
    if (index > cursor) parts.push(line.slice(cursor, index))
    const token = match[0]
    const color = token.startsWith('#') || token.startsWith('//')
      ? 'text-[#7d8590]'
      : token.startsWith('"') || token.startsWith("'") || token.startsWith('`')
        ? 'text-[#7ee787]'
        : /^\d+$/.test(token)
          ? 'text-[#ffa657]'
          : token.startsWith('$')
            ? 'text-[#d2a8ff]'
            : /^(Client|FormData|fetch|process|env)$/.test(token)
              ? 'text-[#79c0ff]'
              : 'text-[#ff7b9c]'
    parts.push(<span className={color} key={`${index}-${token}`}>{token}</span>)
    cursor = index + token.length
  }
  if (cursor < line.length) parts.push(line.slice(cursor))
  return parts
}

export function CodeBlock({ code, language = 'text', label, className }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return <div className={cn('min-h-[190px] w-full min-w-0 max-w-[680px] overflow-hidden rounded-[14px] border border-[#2b3038] bg-[#0d1117] text-[#e6edf3] shadow-[0_14px_35px_rgba(0,0,0,.14)] max-[760px]:max-w-none', className)}><div className="grid h-11 grid-cols-[1fr_auto_1fr] items-center border-b border-[#252a31] bg-[#15191f] px-3.5 text-[10px] text-[#8b949e]"><span className="flex gap-1.5" aria-hidden="true"><i className="size-2.5 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)]" /><i className="size-2.5 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)]" /><i className="size-2.5 rounded-full bg-[#28c840] shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)]" /></span><span className="font-medium text-[#9da5af]">{label || language}</span><button className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1 text-[9px] text-[#c9d1d9] transition hover:border-[#464d57] hover:bg-[#1b2027] [&_svg]:w-3" type="button" onClick={() => void copy()} aria-label="Copy code">{copied ? <CheckIcon /> : <CopyIcon />}{copied ? 'Copied' : 'Copy'}</button></div><pre className="m-0 max-w-full overflow-x-auto py-3.5"><code className={`language-${language} block min-w-max font-mono text-xs leading-[1.75] max-[700px]:text-[10px]`}>{code.split('\n').map((line, index) => {
    const highlighted = highlightLine(line)
    return <span className="grid grid-cols-[36px_minmax(0,1fr)] px-3" key={`${index}-${line}`}><span className="select-none pr-3 text-right text-[#484f58]">{index + 1}</span><span className="whitespace-pre">{highlighted.length ? highlighted : ' '}</span></span>
  })}</code></pre></div>
}
