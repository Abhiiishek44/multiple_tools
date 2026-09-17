import { useState } from 'react'
import { contentSection, eyebrow, sectionTitle } from '../../styles'

type Faq = { question: string; answer: string }

export function FaqSection({ items, title = 'Frequently asked questions' }: { items: Faq[]; title?: string }) {
  const [open, setOpen] = useState(0)
  return (
    <section className={contentSection} aria-labelledby="faq-title">
      <p className={eyebrow}>Good to know</p>
      <h2 className={sectionTitle} id="faq-title">{title}</h2>
      <div className="mt-7 border-t border-[var(--border)]">
        {items.map((item, index) => {
          const expanded = open === index
          return <div className="border-b border-[var(--border)]" key={item.question}><button className="flex w-full cursor-pointer items-center justify-between gap-5 border-0 bg-transparent px-0.5 py-5 text-left text-sm font-bold [&>span:last-child]:text-[22px] [&>span:last-child]:font-normal [&>span:last-child]:text-[var(--accent-strong)]" type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? -1 : index)}><span>{item.question}</span><span aria-hidden="true">{expanded ? '−' : '+'}</span></button>{expanded && <p className="-mt-[5px] mb-5 max-w-[780px] text-[13px] leading-[1.65] text-[var(--muted)]">{item.answer}</p>}</div>
        })}
      </div>
    </section>
  )
}
