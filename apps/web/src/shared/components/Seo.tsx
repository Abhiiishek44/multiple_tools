import { useEffect } from 'react'

type Props = {
  title: string
  description: string
  path: string
  keywords?: string[]
  jsonLd?: object
}

const configuredSiteURL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '')

function setMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.append(element)
  }
  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value))
}

export function Seo({ title, description, path, keywords = [], jsonLd }: Props) {
  useEffect(() => {
    const siteURL = configuredSiteURL || window.location.origin
    const canonicalURL = `${siteURL}${path}`
    document.title = title
    setMeta('meta[name="description"]', { name: 'description', content: description })
    setMeta('meta[name="robots"]', { name: 'robots', content: 'index,follow,max-image-preview:large' })
    setMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    setMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalURL })
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    if (keywords.length) setMeta('meta[name="keywords"]', { name: 'keywords', content: keywords.join(', ') })

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = canonicalURL

    const id = 'route-json-ld'
    document.getElementById(id)?.remove()
    if (jsonLd) {
      const script = document.createElement('script')
      script.id = id
      script.type = 'application/ld+json'
      script.text = JSON.stringify(jsonLd).replaceAll('<', '\\u003c')
      document.head.append(script)
    }
  }, [description, jsonLd, keywords, path, title])

  return null
}
