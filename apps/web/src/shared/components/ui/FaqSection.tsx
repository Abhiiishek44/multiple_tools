import { useState } from 'react'

type Faq = { question: string; answer: string }

export function FaqSection({ items, title = 'Frequently asked questions' }: { items: Faq[]; title?: string }) {
  const [open, setOpen] = useState(0)
  return (
    <section className="content-section" aria-labelledby="faq-title">
      <p className="eyebrow">Good to know</p>
      <h2 className="section-title" id="faq-title">{title}</h2>
      <div className="faq-list">
        {items.map((item, index) => {
          const expanded = open === index
          return <div className="faq-item" key={item.question}><button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? -1 : index)}><span>{item.question}</span><span aria-hidden="true">{expanded ? '−' : '+'}</span></button>{expanded && <p>{item.answer}</p>}</div>
        })}
      </div>
    </section>
  )
}
