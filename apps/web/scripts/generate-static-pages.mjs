import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(webRoot, 'dist')
const catalog = JSON.parse(await readFile(join(webRoot, 'src/generated/tool-catalog.json'), 'utf8'))
const template = await readFile(join(dist, 'index.html'), 'utf8')
const siteURL = (process.env.VITE_SITE_URL || 'https://multipletools.com').replace(/\/$/, '')

const escapeHTML = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const absolute = (path) => `${siteURL}${path}`
const list = (items, render) => items.map(render).join('')

function head(title, description, path, jsonLd) {
  const url = absolute(path)
  return `<title>${escapeHTML(title)}</title>
    <meta name="description" content="${escapeHTML(description)}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${escapeHTML(title)}" />
    <meta property="og:description" content="${escapeHTML(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">${JSON.stringify(jsonLd).replaceAll('<', '\\u003c')}</script>`
}

function pageHTML(title, description, path, body, jsonLd) {
  return template
    .replace(/<title>.*?<\/title>/, head(title, description, path, jsonLd))
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
}

function toolBody(tool) {
  const method = tool.slug.replaceAll('-', '_')
  return `<main class="static-seo-page">
    <nav aria-label="Breadcrumb"><a href="/tools">Tools</a> / <a href="/categories/${tool.category_slug}">${escapeHTML(tool.category)}</a> / ${escapeHTML(tool.display_name)}</nav>
    <header><p>${escapeHTML(tool.category)} · ${escapeHTML(tool.input_formats.join(', '))} to ${escapeHTML(tool.output_formats.join(', '))}</p><h1>${escapeHTML(tool.title)}</h1><p>${escapeHTML(tool.description)}</p></header>
    <section aria-label="Upload"><h2>Upload your ${escapeHTML(tool.input_formats.join(', '))} file</h2><p>Choose a supported file up to 50 MB to start ${escapeHTML(tool.display_name)}.</p></section>
    <section><h2>Supported formats</h2><p>Input: ${escapeHTML(tool.input_formats.join(', '))}</p><p>Output: ${escapeHTML(tool.output_formats.join(', '))}</p></section>
    ${tool.options.length ? `<section><h2>Options</h2><ul>${list(tool.options, (option) => `<li><strong>${escapeHTML(option.label)}</strong> — ${escapeHTML(option.description || (option.required ? 'Required setting' : 'Optional setting'))}</li>`)}</ul></section>` : ''}
    <section><h2>How ${escapeHTML(tool.display_name)} works</h2><ol>${list(tool.how_it_works, (step) => `<li>${escapeHTML(step)}</li>`)}</ol></section>
    <section><h2>Features</h2><ul>${list(tool.features, (feature) => `<li>${escapeHTML(feature)}</li>`)}</ul></section>
    <section><h2>API example</h2><pre><code>POST /v1/tools/${tool.slug}/jobs</code></pre><h2>Python SDK example</h2><pre><code>client.convert.${method}("input${tool.input_suffixes[0]}")</code></pre><h2>TypeScript SDK example</h2><pre><code>await client.convert.${method}('./input${tool.input_suffixes[0]}')</code></pre></section>
  </main>`
}

function toolJsonLd(tool) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebApplication', name: tool.title, description: tool.description, url: absolute(`/${tool.slug}`), applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', featureList: tool.features, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    ],
  }
}

async function writeRoute(path, html) {
  const target = join(dist, path.replace(/^\//, ''), 'index.html')
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, html)
}

for (const tool of catalog) {
  const path = `/${tool.slug}`
  await writeRoute(path, pageHTML(`${tool.title} | Multiple Tools`, tool.description, path, toolBody(tool), toolJsonLd(tool)))
}

const categories = [...new Map(catalog.map((tool) => [tool.category_slug, { slug: tool.category_slug, name: tool.category, description: tool.category_description }])).values()]
const allToolsPath = '/tools'
const allToolsTitle = 'All File Conversion Tools | Multiple Tools'
const allToolsDescription = 'Browse every file conversion, document, image, PDF, spreadsheet, and OCR tool.'
const allToolsBody = `<main class="static-seo-page"><h1>All file conversion tools</h1><p>${allToolsDescription}</p><ul>${list(catalog, (tool) => `<li><a href="/${tool.slug}">${escapeHTML(tool.display_name)}</a> — ${escapeHTML(tool.description)}</li>`)}</ul></main>`
const allToolsJsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: allToolsTitle, description: allToolsDescription, url: absolute(allToolsPath), mainEntity: { '@type': 'ItemList', itemListElement: catalog.map((tool, index) => ({ '@type': 'ListItem', position: index + 1, name: tool.display_name, url: absolute(`/${tool.slug}`) })) } }
await writeRoute(allToolsPath, pageHTML(allToolsTitle, allToolsDescription, allToolsPath, allToolsBody, allToolsJsonLd))

for (const category of categories) {
  const tools = catalog.filter((tool) => tool.category_slug === category.slug)
  const path = `/categories/${category.slug}`
  const title = `${category.name} Tools | Multiple Tools`
  const body = `<main class="static-seo-page"><h1>${escapeHTML(category.name)} tools</h1><p>${escapeHTML(category.description)}</p><ul>${list(tools, (tool) => `<li><a href="/${tool.slug}">${escapeHTML(tool.display_name)}</a> — ${escapeHTML(tool.description)}</li>`)}</ul></main>`
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description: category.description, url: absolute(path), mainEntity: { '@type': 'ItemList', itemListElement: tools.map((tool, index) => ({ '@type': 'ListItem', position: index + 1, name: tool.display_name, url: absolute(`/${tool.slug}`) })) } }
  await writeRoute(path, pageHTML(title, category.description, path, body, jsonLd))
}

const typescriptPath = '/developers/typescript'
const typescriptTitle = 'TypeScript SDK | Multiple Tools'
const typescriptDescription = 'Use the typed Multiple Tools Node.js SDK to upload files, run every registered conversion, wait for jobs, and download results.'
const typescriptBody = `<main class="static-seo-page"><h1>Multiple Tools TypeScript SDK</h1><p>${typescriptDescription}</p><section><h2>Install</h2><pre><code>npm install multipletools</code></pre></section><section><h2>Convert with a typed method</h2><pre><code>const job = await client.convert.pdf_to_word('./document.pdf')</code></pre><p>Every registered tool receives a generated conversion method. Generic job creation, polling, and downloads remain available.</p></section><nav aria-label="Developer resources"><a href="/developers/api">API keys</a> · <a href="/developers/python">Python SDK</a> · <a href="/tools">All tools</a></nav></main>`
const typescriptJsonLd = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Multiple Tools TypeScript SDK', applicationCategory: 'DeveloperApplication', operatingSystem: 'Node.js 20+', description: typescriptDescription, url: absolute(typescriptPath) }
await writeRoute(typescriptPath, pageHTML(typescriptTitle, typescriptDescription, typescriptPath, typescriptBody, typescriptJsonLd))

const summarizerPath = '/ai-summarizer'
const summarizerTitle = 'AI Document Summarizer | Multiple Tools'
const summarizerDescription = 'Summarize TXT, Markdown, Word, and PDF documents with grounded AI answers and source passages.'
const summarizerBody = `<main class="static-seo-page"><h1>AI Document Summarizer</h1><p>${summarizerDescription}</p><section><h2>Upload a document</h2><p>Sign in and upload a supported document up to 50 MB. Scanned PDF pages use OCR automatically.</p></section><section><h2>Grounded summaries</h2><p>The assistant extracts and indexes source text before creating a concise, detailed, or comprehensive summary with references.</p></section></main>`
const summarizerJsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: summarizerTitle, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', description: summarizerDescription, url: absolute(summarizerPath) }
await writeRoute(summarizerPath, pageHTML(summarizerTitle, summarizerDescription, summarizerPath, summarizerBody, summarizerJsonLd))

const paths = ['/tools', summarizerPath, typescriptPath, ...categories.map((category) => `/categories/${category.slug}`), ...catalog.map((tool) => `/${tool.slug}`)]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <url><loc>${absolute(path)}</loc></url>`).join('\n')}\n</urlset>\n`
await writeFile(join(dist, 'sitemap.xml'), sitemap)
await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${absolute('/sitemap.xml')}\n`)
console.log(`Generated ${catalog.length} tool pages, ${categories.length} category pages, and ${paths.length} sitemap entries`)
